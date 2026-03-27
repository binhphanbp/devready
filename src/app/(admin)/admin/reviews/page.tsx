'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  company: string;
  role: string;
  difficulty: string | null;
  content: string;
  is_approved: boolean;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  profiles: { full_name: string } | null;
}

const ITEMS_PER_PAGE = 15;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('community_reviews')
      .select(
        'id, company, role, difficulty, content, is_approved, upvote_count, comment_count, created_at, profiles:author_id(full_name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (filter === 'approved') query = query.eq('is_approved', true);
    if (filter === 'pending') query = query.eq('is_approved', false);
    if (search)
      query = query.or(`company.ilike.%${search}%,role.ilike.%${search}%`);

    const { data, count } = await query;
    setReviews((data as unknown as Review[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, filter, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase
      .from('community_reviews')
      .update({ is_approved: true })
      .eq('id', id);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r)),
    );
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase
      .from('community_reviews')
      .update({ is_approved: false })
      .eq('id', id);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_approved: false } : r)),
    );
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from('comments').delete().eq('review_id', id);
    await supabase.from('upvotes').delete().eq('review_id', id);
    await supabase.from('community_reviews').delete().eq('id', id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setTotal((prev) => prev - 1);
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const diffColors: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    hard: 'text-red-400 bg-red-500/10',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý đánh giá</h1>
        <p className="mt-1 text-sm text-zinc-400">{total} đánh giá phỏng vấn</p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo công ty, vị trí..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-500/50"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
          {(['all', 'approved', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(0);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                filter === f
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white',
              )}
            >
              {f === 'all'
                ? 'Tất cả'
                : f === 'approved'
                  ? 'Đã duyệt'
                  : 'Chờ duyệt'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="px-5 py-3 font-medium">Người viết</th>
              <th className="px-5 py-3 font-medium">Công ty</th>
              <th className="px-5 py-3 font-medium">Vị trí</th>
              <th className="px-5 py-3 font-medium">Độ khó</th>
              <th className="px-5 py-3 font-medium text-center">Trạng thái</th>
              <th className="px-5 py-3 font-medium text-right">Hành động</th>
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
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-zinc-500"
                  >
                    Không tìm thấy đánh giá nào
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/5 hover:bg-white/2"
                  >
                    <td className="px-5 py-3 text-sm text-white">
                      {r.profiles?.full_name || 'Ẩn danh'}
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-300">
                      {r.company}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400">
                      {r.role}
                    </td>
                    <td className="px-5 py-3">
                      {r.difficulty && (
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-medium',
                            diffColors[r.difficulty],
                          )}
                        >
                          {r.difficulty}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {r.is_approved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                          <XCircle className="h-3 w-3" /> Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!r.is_approved ? (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id}
                            className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                            title="Duyệt"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={actionLoading === r.id}
                            className="rounded-lg p-1.5 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50"
                            title="Bỏ duyệt"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={actionLoading === r.id}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
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
