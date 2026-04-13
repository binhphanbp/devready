"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
 * Client-only decorative enhancements. Deferred until after first paint
 * using requestIdleCallback to avoid blocking FCP/LCP.
 */
export function ClientEnhancements() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Defer loading until browser is idle (after LCP)
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setReady(true), 2000);
      return () => clearTimeout(id);
    }
  }, []);

  if (!ready) return null;

  return (
    <>
      <CustomCursor />
      <ClickSound />
    </>
  );
}
