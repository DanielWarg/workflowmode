'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, Translations } from '@/lib/i18n/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    // Persist language choice
    useEffect(() => {
        const saved = localStorage.getItem('antigravity-lang') as Language;
        if (saved && (saved === 'en' || saved === 'sv')) {
            setLanguage(saved);
        }
        setMounted(true);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('antigravity-lang', lang);
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
