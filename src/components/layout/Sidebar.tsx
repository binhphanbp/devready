'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explore', label: 'Khám phá', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: Sparkles },
  { href: '/community', label: 'Cộng đồng', icon: Users },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

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
    <div className="flex h-full flex-col">
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
      <nav className="flex-1 space-y-1 px-3 py-2">
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
      <div className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-3 mb-3 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
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
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data?.role === 'admin') setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

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
          'hidden lg:flex flex-col border-r border-border/40 bg-card/20 backdrop-blur-sm transition-all duration-300 shrink-0 relative',
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
          className="absolute -right-3 top-7 z-10 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm"
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

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[min(80vw,280px)] border-r border-border/50 bg-card shadow-2xl"
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
