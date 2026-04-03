"use client";

import dynamic from "next/dynamic";

// Dynamic import non-critical UI enhancements with ssr:false
// These components need browser APIs (mousemove, AudioContext) and don't affect first paint
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});
const ClickSound = dynamic(
  () =>
    import("@/components/ClickSound").then((m) => ({ default: m.ClickSound })),
  { ssr: false }
);

/**
 * Client-only decorative enhancements. Wrapped in a client component
 * so we can use next/dynamic with ssr:false (not allowed in Server Components).
 */
export function ClientEnhancements() {
  return (
    <>
      <CustomCursor />
      <ClickSound />
    </>
  );
}
