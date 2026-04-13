'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code2,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explore', label: 'Khám phá', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: Sparkles },
  { href: '/community', label: 'Cộng đồng', icon: Users },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

const themeOptions = [
  { value: 'dark', label: 'Tối', icon: Moon },
  { value: 'light', label: 'Sáng', icon: Sun },
  { value: 'system', label: 'Hệ thống', icon: Monitor },
] as const;

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme ?? 'system';
  const currentIndex = themeOptions.findIndex((o) => o.value === currentTheme);
  const current = themeOptions[currentIndex >= 0 ? currentIndex : 0];
  const ThemeIcon = mounted ? current.icon : Moon;

  const cycleTheme = () => {
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex].value);
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Chế độ: ${current.label}`}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 lg:py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200 min-h-[44px]"
    >
      <ThemeIcon className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-foreground" />
      {!collapsed && <span>{mounted ? current.label : 'Tối'}</span>}
    </button>
  );
}

function SidebarContent({
  pathname,
  collapsed,
  onNavClick,
  onLogout,
  isAdmin,
}: {
  pathname: string;
  collapsed: boolean;
  onNavClick: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
            <Code2 className="h-4.5 w-4.5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              Dev<span className="text-gradient">Ready</span>
            </span>
          )}
        </Link>
      </div>

      <div className="px-4 pb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 lg:py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px] relative',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
              )}
              <link.icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'group-hover:text-foreground',
                )}
              />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-3 px-3">
              <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            </div>
            <Link
              href="/admin"
              onClick={onNavClick}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 lg:py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px] relative',
                pathname.startsWith('/admin')
                  ? 'bg-red-500/10 text-red-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
              )}
            >
              {pathname.startsWith('/admin') && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-red-400" />
              )}
              <Shield className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>Admin</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-3 mb-3 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        <FeedbackDialog collapsed={collapsed} />
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 lg:py-2.5 text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 min-h-[44px]"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Check localStorage cache first to avoid extra DB query
        const cachedRole = sessionStorage.getItem('user_role');
        if (cachedRole) {
          setIsAdmin(cachedRole === 'admin');
          return;
        }
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data?.role === 'admin') setIsAdmin(true);
        if (data?.role) sessionStorage.setItem('user_role', data.role);
      }
    }
    checkAdmin();
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border/40 bg-card/20 backdrop-blur-sm transition-all duration-300 shrink-0 sticky top-0 h-screen z-20',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onNavClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
          isAdmin={isAdmin}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 z-30 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft
            className={cn(
              'h-3 w-3 transition-transform duration-300',
              collapsed && 'rotate-180',
            )}
          />
        </button>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card/80 backdrop-blur-md text-muted-foreground hover:text-foreground active:scale-95 transition-all shadow-sm"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay — CSS transitions instead of framer-motion for better INP */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-[min(72vw,256px)] border-r border-border/50 bg-card shadow-2xl transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 transition-all"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent
          pathname={pathname}
          collapsed={false}
          onNavClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
          isAdmin={isAdmin}
        />
      </aside>
    </>
  );
}
