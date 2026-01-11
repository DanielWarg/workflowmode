'use client';

import { ThemeProvider } from '@/lib/theme';
import { YjsProvider } from '@/components/YjsProvider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <YjsProvider>
                {children}
            </YjsProvider>
        </ThemeProvider>
    );
}
