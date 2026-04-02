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
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">
              Dev<span className="text-gradient">Ready</span>
            </span>
          )}
        </Link>
      </div>

      <Separator className="opacity-50" />

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 lg:py-2.5 text-sm transition-all min-h-[44px]',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <link.icon className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <div className="my-2 h-px bg-border/30" />
            <Link
              href="/admin"
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 lg:py-2.5 text-sm transition-all min-h-[44px]',
                pathname.startsWith('/admin')
                  ? 'bg-red-500/10 text-red-400 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <Shield className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" />
              {!collapsed && <span>Admin</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Separator className="mb-3 opacity-50" />
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 lg:py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
        >
          <LogOut className="h-5 w-5 lg:h-4 lg:w-4 shrink-0" />
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
          'hidden lg:flex flex-col border-r border-border/50 bg-card/30 transition-all duration-300 shrink-0',
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
          className="absolute left-[calc(var(--sidebar-width)-12px)] top-6 z-10 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground transition-colors"
          style={
            {
              '--sidebar-width': collapsed ? '4rem' : '15rem',
            } as React.CSSProperties
          }
        >
          <ChevronLeft
            className={cn(
              'h-3 w-3 transition-transform',
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
