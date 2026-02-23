import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        } else {
            setQuery('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const mockResults = [
        { title: 'Global Settings', type: 'System', url: '/crm/settings/preferences' },
        { title: 'Sales Pipeline', type: 'Module', url: '/crm/pipeline' },
        { title: 'Lead: John Doe', type: 'Record', url: '/crm/leads/123' },
    ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (url: string) => {
        navigate(url);
        setIsOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-gray-900/50 backdrop-blur-sm">
            <div
                className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full py-4 pl-3 pr-4 text-gray-900 bg-transparent border-0 focus:ring-0 text-lg outline-none"
                        placeholder="Search leads, settings, modules... (Access via Ctrl + K)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">ESC</kbd>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                    {query.length > 0 ? (
                        mockResults.length > 0 ? (
                            mockResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition"
                                    onClick={() => handleSelect(result.url)}
                                >
                                    <span className="font-medium text-gray-800">{result.title}</span>
                                    <span className="text-xs uppercase tracking-wider text-gray-500">{result.type}</span>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">No results found for "{query}"</div>
                        )
                    ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            Type to begin searching the global tenant scope...
                        </div>
                    )}
                </div>
            </div>
            {/* Click outside to close overlay */}
            <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
        </div>
    );
};
