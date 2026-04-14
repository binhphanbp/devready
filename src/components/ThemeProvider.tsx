'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// ------------------------------------------------------------------
// React 19 + next-themes workaround
// next-themes injects an inline <script> to prevent FOUC.
// React 19 now throws "Encountered a script tag while rendering React
// component" during hydration. This is a false-positive — the script
// works perfectly during SSR but React flags it in dev mode.
//
// Official community recommendation: filter the specific console.error
// in development only. Production builds are unaffected.
// ------------------------------------------------------------------
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag')
    ) {
      return; // suppress false-positive
    }
    origConsoleError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
