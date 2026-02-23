import React from 'react';
import { useTheme, UiScale } from '../../../context/ThemeContext';



interface ScaleOption {
    value: UiScale;
    label: string;
    description: string;
    preview: string; 
}

const SCALE_OPTIONS: ScaleOption[] = [
    {
        value: 'small',
        label: 'Compact',
        description: 'Smaller text, tighter spacing — ideal for power users with large monitors.',
        preview: '14px',
    },
    {
        value: 'default',
        label: 'Default',
        description: 'Standard interface scale. Balanced for most team members.',
        preview: '16px',
    },
    {
        value: 'large',
        label: 'Comfortable',
        description: 'Larger text and more breathing room — best for presentations or accessibility.',
        preview: '18px',
    },
];



const Preferences: React.FC = () => {
    const { uiScale, setUiScale } = useTheme();

    return (
        <div className="space-y-8 max-w-2xl">
            {}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Preferences</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Personalize your workspace experience. Settings are stored locally on this device.
                </p>
            </div>

            {}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="font-extrabold text-gray-800 text-lg">Interface Scale</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Adjusts the global text size across the CRM. Saved to this browser — no account required.
                    </p>
                </div>

                <div className="space-y-3">
                    {SCALE_OPTIONS.map((opt) => {
                        const isSelected = uiScale === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setUiScale(opt.value)}
                                className={`w-full text-left flex items-center gap-5 p-5 rounded-2xl border-2 transition duration-150 hover:shadow-sm active:scale-[0.99]
                  ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-blue-100 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                            >
                                {}
                                <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors
                  ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <div
                                        className={`font-extrabold transition-all duration-200 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}
                                        style={{ fontSize: opt.preview }}
                                    >
                                        Aa
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{opt.preview}</span>
                                </div>

                                {}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-extrabold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                            {opt.label}
                                        </p>
                                        {isSelected && (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                ✓ Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.description}</p>
                                </div>

                                {}
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition
                  ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                    💡 This setting is stored in your browser's local storage and does not sync across devices.
                </div>
            </div>

            {}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-60 select-none">
                <h2 className="font-extrabold text-gray-800 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-400">Coming soon — configure in-app and email notification preferences.</p>
            </div>
        </div>
    );
};

export default Preferences;
