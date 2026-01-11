'use client';

import { ThemeProvider } from '@/lib/theme';
import { YjsProvider } from '@/components/YjsProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <YjsProvider>
                    {children}
                </YjsProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
