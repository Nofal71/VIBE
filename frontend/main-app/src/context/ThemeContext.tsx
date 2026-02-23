import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import api from '../api/axiosConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UiScale = 'small' | 'default' | 'large';

interface ThemeContextProps {
    uiScale: UiScale;
    setUiScale: (scale: UiScale) => void;
    /** Tailwind text-size class derived from current scale */
    scaleClass: string;
    primaryColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'crm_ui_scale';

const SCALE_CLASS_MAP: Record<UiScale, string> = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
};

const isValidScale = (val: string | null): val is UiScale =>
    val === 'small' || val === 'default' || val === 'large';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts Hex (#RRGGBB) to Tailwind-friendly RGB string (R G B) */
const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
};

/** Calculates a darker version of the hex color by a factor */
const darkenColor = (hex: string, factor: number = 0.85): string => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextProps>({
    uiScale: 'default',
    setUiScale: () => { },
    scaleClass: SCALE_CLASS_MAP['default'],
    primaryColor: '#4F46E5',
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: UiScale = isValidScale(stored) ? stored : 'default';

    const [uiScale, setUiScaleState] = useState<UiScale>(initial);
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');

    const setUiScale = useCallback((scale: UiScale) => {
        setUiScaleState(scale);
        localStorage.setItem(STORAGE_KEY, scale);
    }, []);

    // ─── Dynamic Branding Extraction ───
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/tenant/config');
                const config = response.data;
                const color = config.ui_config_json?.primary_color || '#4F46E5';

                setPrimaryColor(color);

                // Inject CSS Variables for Tailwind to consume
                const brandRgb = hexToRgb(color);
                const brandDarkHex = darkenColor(color);
                const brandDarkRgb = hexToRgb(brandDarkHex);

                document.documentElement.style.setProperty('--color-brand', brandRgb);
                document.documentElement.style.setProperty('--color-brand-dark', brandDarkRgb);

            } catch (error) {
                console.error('Failed to load tenant branding, falling back to default.', error);
                // defaults already in index.css
            }
        };

        fetchConfig();
    }, []);

    return (
        <ThemeContext.Provider value={{ uiScale, setUiScale, scaleClass: SCALE_CLASS_MAP[uiScale], primaryColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = () => useContext(ThemeContext);
