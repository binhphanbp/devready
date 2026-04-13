'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// ssr: false is only allowed inside Client Components
const ReadyBot = dynamic(
  () =>
    import('@/components/readybot/ReadyBot').then((m) => ({
      default: m.ReadyBot,
    })),
  { ssr: false },
);

export function ReadyBotLazy() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer ReadyBot loading until after LCP — wait for idle or 4s max
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setShouldLoad(true), {
        timeout: 4000,
      });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShouldLoad(true), 3000);
      return () => clearTimeout(id);
    }
  }, []);

  if (!shouldLoad) return null;

  return <ReadyBot />;
}
