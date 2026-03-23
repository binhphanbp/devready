"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(progress, 1));
      setVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // SVG circle math
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - scrollProgress);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 group cursor-pointer"
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          {/* Container */}
          <div className="relative flex items-center justify-center h-12 w-12">
            {/* Background circle */}
            <svg
              className="absolute inset-0 -rotate-90"
              width={size}
              height={size}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-border/50"
              />
              {/* Progress ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-100 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0066FF" />
                  <stop offset="100%" stopColor="#00AAFF" />
                </linearGradient>
              </defs>
            </svg>

            {/* Button center */}
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20 group-hover:bg-background group-hover:border-primary/30 group-hover:shadow-primary/10 transition-all duration-300">
              <ArrowUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
