'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import {
  Search,
  Bug,
  Sparkles,
  Wrench,
  BookOpen,
  HelpCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const ITEMS_PER_PAGE = 15;

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  bug: { label: 'Báo lỗi', icon: Bug, color: 'text-red-400 bg-red-500/10' },
  feature: { label: 'Tính năng', icon: Sparkles, color: 'text-violet-400 bg-violet-500/10' },
  improvement: { label: 'Cải thiện', icon: Wrench, color: 'text-blue-400 bg-blue-500/10' },
  content: { label: 'Nội dung', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10' },
  other: { label: 'Khác', icon: HelpCircle, color: 'text-zinc-400 bg-white/5' },
};

const statusConfig: Record<string, { label: string; color: string; selectColor: string }> = {
  pending: { label: 'Chờ xét', color: 'text-yellow-400 bg-yellow-500/10', selectColor: 'text-yellow-400 bg-yellow-500/10' },
  in_review: { label: 'Đang xét', color: 'text-blue-400 bg-blue-500/10', selectColor: 'text-blue-400 bg-blue-500/10' },
  accepted: { label: 'Đã duyệt', color: 'text-emerald-400 bg-emerald-500/10', selectColor: 'text-emerald-400 bg-emerald-500/10' },
  rejected: { label: 'Từ chối', color: 'text-red-400 bg-red-500/10', selectColor: 'text-red-400 bg-red-500/10' },
  implemented: { label: 'Đã triển khai', color: 'text-teal-400 bg-teal-500/10', selectColor: 'text-teal-400 bg-teal-500/10' },
};

const TYPE_FILTERS = ['all', 'bug', 'feature', 'improvement', 'content', 'other'] as const;
const STATUS_FILTERS = ['all', 'pending', 'in_review', 'accepted', 'rejected', 'implemented'] as const;

export default function AdminFeedbackClient() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('all');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('feedback')
      .select('id, user_id, type, title, content, status, created_at, profiles(full_name, username, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data, count } = await query;
    setItems((data as unknown as FeedbackItem[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    const supabase = createClient();
    const { error } = await supabase
      .from('feedback')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
      );
    }
    setUpdatingStatus(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa góp ý "${title}"?\n\nHành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((t) => t - 1);
    }
    setDeletingId(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý góp ý</h1>
        <p className="mt-1 text-sm text-zinc-400">{total} góp ý</p>
      </div>

      {/* Filters */}
      <div className="mb-5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-500/50"
          />
        </div>

        {/* Filter pills row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setPage(0); }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  statusFilter === f ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white',
                )}
              >
                {f === 'all' ? 'Tất cả' : (statusConfig[f]?.label || f)}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setTypeFilter(f); setPage(0); }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  typeFilter === f ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white',
                )}
              >
                {f === 'all' ? 'Tất cả loại' : (typeConfig[f]?.label || f)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="px-5 py-3 font-medium">Người dùng</th>
              <th className="px-5 py-3 font-medium">Loại</th>
              <th className="px-5 py-3 font-medium">Tiêu đề</th>
              <th className="px-5 py-3 font-medium">Nội dung</th>
              <th className="px-5 py-3 font-medium text-center">Trạng thái</th>
              <th className="px-5 py-3 font-medium">Ngày gửi</th>
              <th className="px-5 py-3 font-medium text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-500">
                    Không có góp ý nào
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const tc = typeConfig[item.type] || typeConfig.other;
                  const sc = statusConfig[item.status] || statusConfig.pending;
                  const TypeIcon = tc.icon;
                  const profile = item.profiles;

                  return (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/2"
                    >
                      {/* User */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {profile?.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt=""
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white">
                              {profile?.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-xs text-white max-w-25 truncate">
                            {profile?.full_name || profile?.username || 'Ẩn danh'}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium', tc.color)}>
                          <TypeIcon className="h-3 w-3" />
                          {tc.label}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3">
                        <p className="text-sm text-white max-w-45 truncate" title={item.title}>
                          {item.title}
                        </p>
                      </td>

                      {/* Content */}
                      <td className="px-5 py-3">
                        <p className="text-xs text-zinc-400 max-w-55 truncate" title={item.content}>
                          {item.content}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          disabled={updatingStatus === item.id}
                          className={cn(
                            'appearance-none rounded-lg border-0 px-3 py-1.5 text-xs font-medium outline-none transition-all cursor-pointer disabled:opacity-50',
                            sc.selectColor,
                          )}
                        >
                          <option value="pending">Chờ xét</option>
                          <option value="in_review">Đang xét</option>
                          <option value="accepted">Đã duyệt</option>
                          <option value="rejected">Từ chối</option>
                          <option value="implemented">Đã triển khai</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3 text-xs text-zinc-400">
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Delete */}
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                          title="Xóa góp ý"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
