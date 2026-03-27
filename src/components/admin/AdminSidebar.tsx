'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileQuestion,
  MessageSquare,
  FolderTree,
  Users,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const adminLinks = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Câu hỏi', icon: FileQuestion },
  { href: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-orange-500">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">DevReady</h2>
          <p className="text-[11px] text-zinc-500">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminLinks.map((link) => {
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);

          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-red-500 to-orange-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <link.icon
                  className={cn(
                    'h-[18px] w-[18px]',
                    isActive && 'text-orange-400',
                  )}
                />
                {link.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        <Link href="/dashboard">
          <motion.div
            whileHover={{ x: -4 }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
            Quay lại Client
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
