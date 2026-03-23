"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Code2,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Users,
  LayoutDashboard,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/explore", label: "Khám phá", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Sparkles },
  { href: "/community", label: "Cộng đồng", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const userInitials = user
    ? (
        user.user_metadata?.full_name ||
        user.email ||
        "U"
      )
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Outer wrapper — always full width, handles padding */}
      <div
        className={cn(
          "mx-auto transition-[padding] duration-500 ease-out",
          scrolled ? "px-4 sm:px-6 py-2" : "px-0 py-0"
        )}
      >
        {/* Glass pill background — only visual changes, no width animation */}
        <div
          className={cn(
            "mx-auto max-w-5xl transition-all duration-500 ease-out",
            scrolled
              ? "rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20"
              : "rounded-none bg-transparent border border-transparent shadow-none"
          )}
        >
          <nav
            className={cn(
              "flex items-center justify-between transition-[padding] duration-500 ease-out",
              scrolled ? "px-5 py-2" : "mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8"
            )}
          >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className={cn(
                "flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00AAFF] shadow-md shadow-[#0066FF]/20 group-hover:shadow-lg group-hover:shadow-[#0066FF]/30 transition-all",
                scrolled ? "h-8 w-8" : "h-9 w-9"
              )}
            >
              <Code2
                className={cn(
                  "text-white",
                  scrolled ? "h-4 w-4" : "h-5 w-5"
                )}
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Dev<span className="text-gradient">Ready</span>
            </span>
          </Link>

          {/* Desktop Nav — Center (hidden below lg/1024px) */}
          <div
            className={cn(
              "hidden lg:flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-1.5 py-1 transition-all duration-500",
              scrolled && "bg-muted/20"
            )}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-background/80 whitespace-nowrap"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right — Auth + Theme (hidden below lg/1024px) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Chuyển chế độ sáng/tối"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {user ? (
              /* Logged in */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 pl-3 pr-1.5 py-1 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#0055DD] text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-3 py-2.5 border-b border-border/50">
                          <p className="text-sm font-medium truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Hồ sơ
                          </Link>
                        </div>
                        <div className="border-t border-border/50 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Not logged in */
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href="/login" />}
                  className="font-medium"
                >
                  Đăng nhập
                </Button>
                {!scrolled && (
                  <Button
                    size="sm"
                    className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] hover:from-[#0055DD] hover:to-[#0044CC] text-white border-0 font-medium px-4"
                    render={<Link href="/register" />}
                  >
                    Bắt đầu miễn phí
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile/Tablet Right — Theme + Hamburger (visible below lg/1024px) */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Chuyển chế độ sáng/tối"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile/Tablet Menu (visible below lg/1024px) */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {user && (
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#0055DD] text-white text-sm font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

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
                  {user ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        render={<Link href="/profile" />}
                        onClick={() => setMobileOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Hồ sơ
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-400 hover:text-red-400 hover:bg-red-500/10 border-red-500/20"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </header>
  );
}
