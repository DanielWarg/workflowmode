'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, Translations } from '@/lib/i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window === 'undefined') return 'sv';
        const saved = localStorage.getItem('antigravity-lang');
        return saved === 'en' || saved === 'sv' ? saved : 'sv';
    });

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('antigravity-lang', lang);
        }
    };



    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: handleSetLanguage,
            t: translations[language]
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
