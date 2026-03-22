"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Khám phá", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Sparkles },
  { href: "/community", label: "Cộng đồng", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00AAFF] shadow-md shadow-[#0066FF]/20 group-hover:shadow-lg group-hover:shadow-[#0066FF]/30 transition-all">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Dev<span className="text-gradient">Ready</span>
          </span>
        </Link>

        {/* Desktop Nav — Center */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-1.5 py-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-background/80"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth — Right */}
        <div className="hidden md:flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/login" />}
            className="font-medium"
          >
            Đăng nhập
          </Button>
          <Button
            size="sm"
            className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] hover:from-[#0055DD] hover:to-[#0044CC] text-white border-0 font-medium px-4"
            render={<Link href="/register" />}
          >
            Bắt đầu miễn phí
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-border/50 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  render={<Link href="/login" />}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="w-full glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
                  render={<Link href="/register" />}
                >
                  Bắt đầu miễn phí
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
