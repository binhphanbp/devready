"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    // Ring follows with gentle delay
    const ringEase = 0.18;
    ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringEase;
    ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringEase;

    // Glow follows even slower for dreamy effect
    const glowEase = 0.08;
    glowPos.current.x += (mousePos.current.x - glowPos.current.x) * glowEase;
    glowPos.current.y += (mousePos.current.y - glowPos.current.y) * glowEase;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
    }
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${glowPos.current.x}px, ${glowPos.current.y}px, 0) translate(-50%, -50%)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;
    setIsFinePointer(true);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e: Event) => {
      const target = e.target as HTMLElement;
      const interactable = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"], label[for], .cursor-pointer'
      );
      setIsHovering(!!interactable);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleElementHover, { passive: true });

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleElementHover);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate, isVisible]);

  if (!isFinePointer) return null;

  const dotSize = isClicking ? 5 : isHovering ? 6 : 7;
  const ringSize = isClicking ? 30 : isHovering ? 50 : 36;

  return (
    <>
      {/* Dot — precise position, always visible */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: "50%",
          background: "var(--cursor-dot-color, #3b82f6)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: "width 0.15s ease, height 0.15s ease, opacity 0.3s ease",
          willChange: "transform",
          boxShadow: "0 0 6px 2px rgba(59, 130, 246, 0.5)",
        }}
      />

      {/* Ring — smooth trailing follower */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          borderRadius: "50%",
          border: isHovering
            ? "2px solid rgba(99, 152, 255, 0.7)"
            : "1.5px solid rgba(99, 152, 255, 0.4)",
          background: isHovering
            ? "rgba(59, 130, 246, 0.08)"
            : isClicking
              ? "rgba(59, 130, 246, 0.12)"
              : "transparent",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: isVisible ? 1 : 0,
          transition:
            "width 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), height 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), border 0.25s ease, background 0.25s ease, opacity 0.3s ease, box-shadow 0.25s ease",
          willChange: "transform",
          boxShadow: isHovering
            ? "0 0 20px 4px rgba(59, 130, 246, 0.15), inset 0 0 8px rgba(59, 130, 246, 0.05)"
            : "none",
        }}
      />

      {/* Glow — slow-following ambient light */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? "80px" : "60px",
          height: isHovering ? "80px" : "60px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 99997,
          opacity: isVisible ? 0.8 : 0,
          transition:
            "width 0.4s ease, height 0.4s ease, opacity 0.3s ease",
          willChange: "transform",
          filter: "blur(2px)",
        }}
      />
    </>
  );
}
