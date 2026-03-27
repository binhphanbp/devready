'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  streak_count: number | null;
  last_active_date: string | null;
  created_at: string | null;
}

const ITEMS_PER_PAGE = 15;

const roleConfig: Record<
  string,
  { label: string; icon: typeof Shield; color: string }
> = {
  user: {
    label: 'Người dùng',
    icon: Shield,
    color: 'text-zinc-400 bg-white/5',
  },
  admin: {
    label: 'Quản trị',
    icon: ShieldAlert,
    color: 'text-red-400 bg-red-500/10',
  },
  moderator: {
    label: 'Kiểm duyệt',
    icon: ShieldCheck,
    color: 'text-blue-400 bg-blue-500/10',
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'user' | 'admin' | 'moderator'
  >('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    if (search)
      query = query.or(
        `full_name.ilike.%${search}%,username.ilike.%${search}%`,
      );

    const { data, count } = await query;
    setUsers((data as UserProfile[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    }
    setChangingRole(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
        <p className="mt-1 text-sm text-zinc-400">{total} người dùng</p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo tên, username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-500/50"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
          {(['all', 'user', 'admin', 'moderator'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setRoleFilter(f);
                setPage(0);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                roleFilter === f
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white',
              )}
            >
              {f === 'all' ? 'Tất cả' : roleConfig[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="px-5 py-3 font-medium">Người dùng</th>
              <th className="px-5 py-3 font-medium">Username</th>
              <th className="px-5 py-3 font-medium text-center">Streak</th>
              <th className="px-5 py-3 font-medium">Hoạt động cuối</th>
              <th className="px-5 py-3 font-medium">Ngày tham gia</th>
              <th className="px-5 py-3 font-medium text-center">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-zinc-500"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const role = roleConfig[u.role || 'user'] || roleConfig.user;
                  const RoleIcon = role.icon;
                  return (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/2"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt=""
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                              {u.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-sm text-white">
                            {u.full_name || 'Ẩn danh'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-400">
                        {u.username || '—'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-sm font-medium text-orange-400">
                          🔥 {u.streak_count || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-400">
                        {u.last_active_date
                          ? new Date(u.last_active_date).toLocaleDateString(
                              'vi-VN',
                            )
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-400">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="relative inline-block">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            disabled={changingRole === u.id}
                            className={cn(
                              'appearance-none rounded-lg border-0 px-3 py-1.5 pr-7 text-xs font-medium outline-none transition-all cursor-pointer disabled:opacity-50',
                              role.color,
                            )}
                          >
                            <option value="user">Người dùng</option>
                            <option value="moderator">Kiểm duyệt</option>
                            <option value="admin">Quản trị</option>
                          </select>
                          <RoleIcon className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <p className="text-xs text-zinc-400">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
