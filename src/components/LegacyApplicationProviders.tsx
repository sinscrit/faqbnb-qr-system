'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DebugProvider } from '@/contexts/DebugContext';
import { VersionFooter } from '@/components/VersionFooter';

export function LegacyApplicationProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LocaleProvider>
        <ThemeProvider>
          <DebugProvider>
            {children}
            <VersionFooter />
          </DebugProvider>
        </ThemeProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}
