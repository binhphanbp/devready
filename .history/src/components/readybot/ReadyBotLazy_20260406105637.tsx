'use client';

import dynamic from 'next/dynamic';

// ssr: false is only allowed inside Client Components
const ReadyBot = dynamic(
  () =>
    import('@/components/readybot/ReadyBot').then((m) => ({
      default: m.ReadyBot,
    })),
  { ssr: false },
);

export function ReadyBotLazy() {
  return <ReadyBot />;
}
