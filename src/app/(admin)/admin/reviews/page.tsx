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
  ChevronDown,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Building2,
  Briefcase,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  company: string;
  role: string;
  difficulty: string | null;
  content: string | null;
  question_text: string | null;
  answer_text: string | null;
  tags: string[];
  is_approved: boolean;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  profiles: { full_name: string } | null;
  categories: { name: string } | null;
}

const ITEMS_PER_PAGE = 15;

const diffColors: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  hard: 'text-red-400 bg-red-500/10',
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch total pending count (global, not just current page)
    const { count: pendingCount } = await supabase
      .from('community_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);
    setTotalPending(pendingCount ?? 0);

    let query = supabase
      .from('community_reviews')
      .select(
        'id, company, role, difficulty, content, question_text, answer_text, tags, is_approved, upvote_count, comment_count, created_at, profiles:author_id(full_name), categories:category_id(name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (filter === 'approved') query = query.eq('is_approved', true);
    if (filter === 'pending') query = query.eq('is_approved', false);
    if (search)
      query = query.or(
        `company.ilike.%${search}%,role.ilike.%${search}%,question_text.ilike.%${search}%`,
      );

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
    const { error } = await supabase
      .from('community_reviews')
      .update({ is_approved: true })
      .eq('id', id);
    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r)),
      );
      setTotalPending((prev) => Math.max(0, prev - 1));
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase
      .from('community_reviews')
      .update({ is_approved: false })
      .eq('id', id);
    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: false } : r)),
      );
      setTotalPending((prev) => prev + 1);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (
      !confirm(
        `Bạn có chắc muốn xóa đóng góp từ "${review?.profiles?.full_name || 'Ẩn danh'}"? Hành động này sẽ xóa cả bình luận và upvotes liên quan.`,
      )
    )
      return;
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from('comments').delete().eq('review_id', id);
    await supabase.from('upvotes').delete().eq('review_id', id);
    const { error } = await supabase
      .from('community_reviews')
      .delete()
      .eq('id', id);
    if (!error) {
      if (!review?.is_approved) {
        setTotalPending((prev) => Math.max(0, prev - 1));
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
      if (expandedId === id) setExpandedId(null);
    }
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý đóng góp</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {total} đóng góp từ cộng đồng
          {totalPending > 0 && (
            <span className="ml-2 rounded-full bg-yellow-500/10 px-2 py-0.5 text-yellow-400">
              {totalPending} chờ duyệt
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo công ty, vị trí, câu hỏi..."
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
                  : `Chờ duyệt${f === 'pending' && totalPending > 0 ? ` (${totalPending})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* Card-based list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/3 py-16 text-center">
            <p className="text-sm text-zinc-500">Không tìm thấy đóng góp nào</p>
          </div>
        ) : (
          reviews.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'overflow-hidden rounded-xl border transition-colors',
                  isExpanded
                    ? 'border-orange-500/30 bg-white/3'
                    : 'border-white/10 bg-white/2 hover:bg-white/3',
                )}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 px-5 py-4">
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                    title="Xem nội dung"
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </button>

                  {/* Author */}
                  <div className="min-w-0 w-32 shrink-0">
                    <p className="truncate text-sm font-medium text-white">
                      {r.profiles?.full_name || 'Ẩn danh'}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  {/* Company + Role */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 shrink-0 text-zinc-500" />
                      <span className="truncate text-sm text-zinc-300">
                        {r.company}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <Briefcase className="h-3 w-3 shrink-0 text-zinc-500" />
                      <span className="truncate text-xs text-zinc-400">
                        {r.role}
                      </span>
                    </div>
                    {r.categories?.name && (
                      <span className="mt-0.5 inline-block rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        {r.categories.name}
                      </span>
                    )}
                  </div>

                  {/* Difficulty */}
                  {r.difficulty && (
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium',
                        diffColors[r.difficulty],
                      )}
                    >
                      {r.difficulty}
                    </span>
                  )}

                  {/* Status */}
                  <div className="shrink-0">
                    {r.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Đã duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                        <XCircle className="h-3 w-3" /> Chờ duyệt
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {!r.is_approved ? (
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={actionLoading === r.id}
                        className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
                        title="Duyệt"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReject(r.id)}
                        disabled={actionLoading === r.id}
                        className="rounded-lg p-1.5 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50 transition-colors"
                        title="Bỏ duyệt"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={actionLoading === r.id}
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded preview — inline, directly below the row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="px-6 py-5 space-y-4">
                        {/* Question */}
                        {r.question_text && (
                          <div className="rounded-xl bg-white/3 p-4 border border-white/5">
                            <p className="text-[10px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                              Câu hỏi phỏng vấn
                            </p>
                            <p className="text-sm text-white font-medium leading-relaxed">
                              {r.question_text}
                            </p>
                          </div>
                        )}

                        {/* Context */}
                        {r.content && (
                          <div>
                            <p className="text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                              Bối cảnh
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {r.content}
                            </p>
                          </div>
                        )}

                        {/* Answer */}
                        {r.answer_text && (
                          <div className="rounded-xl bg-emerald-500/3 border border-emerald-500/10 p-4">
                            <p className="text-[10px] font-medium text-emerald-500 mb-1.5 uppercase tracking-wider">
                              Câu trả lời mẫu
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                              {r.answer_text}
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {r.tags && r.tags.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3 w-3 text-zinc-500" />
                            <div className="flex flex-wrap gap-1.5">
                              {r.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Engagement stats */}
                        <div className="flex items-center gap-4 pt-1 text-xs text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {r.upvote_count}{' '}
                            hữu ích
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />{' '}
                            {r.comment_count} bình luận
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{' '}
                            {new Date(r.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/2 px-5 py-3">
          <p className="text-xs text-zinc-400">
            Trang {page + 1} / {totalPages} · {total} đóng góp
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
  );
}
