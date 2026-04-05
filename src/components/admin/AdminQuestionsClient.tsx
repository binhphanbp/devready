'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bot,
  Shield,
  Clock,
  RotateCcw,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  difficulty: string;
  status: string;
  ai_score: number | null;
  ai_feedback: string | null;
  view_count: number;
  bookmark_count: number;
  tech_tags: string[];
  company_tags: string[];
  created_at: string;
  categories: { name: string } | null;
}

type FilterType = 'all' | 'pending' | 'ai_verified' | 'human_reviewed';

const ITEMS_PER_PAGE = 15;

const difficultyColors: Record<string, string> = {
  intern: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  fresher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  junior: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  middle: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  senior: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Chờ duyệt',
    color:
      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    icon: <Clock className="h-3 w-3" />,
  },
  ai_verified: {
    label: 'AI xác minh',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: <Bot className="h-3 w-3" />,
  },
  human_reviewed: {
    label: 'Đã duyệt',
    color:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: <Shield className="h-3 w-3" />,
  },
};

const filterLabels: Record<FilterType, string> = {
  all: 'Tất cả',
  pending: 'Chờ duyệt',
  ai_verified: 'AI xác minh',
  human_reviewed: 'Đã duyệt',
};

export default function AdminQuestionsClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('questions')
      .select(
        'id, title, difficulty, status, ai_score, ai_feedback, view_count, bookmark_count, tech_tags, company_tags, created_at, categories(name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (filter !== 'all') query = query.eq('status', filter);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, count } = await query;
    setQuestions((data as unknown as Question[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, filter, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSetStatus = async (
    id: string,
    newStatus: 'pending' | 'ai_verified' | 'human_reviewed',
  ) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from('questions').update({ status: newStatus }).eq('id', id);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
    );
    setActionLoading(null);
  };

  const handleAIVerifySingle = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/verify-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_ids: [id] }),
      });
      const data = await res.json();
      if (data.results?.length > 0) {
        const result = data.results[0];
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  status: result.status,
                  ai_score: result.score,
                  ai_feedback: result.feedback,
                }
              : q,
          ),
        );
      }
    } catch (err) {
      console.error('AI verify error:', err);
    }
    setActionLoading(null);
  };

  const handleBatchVerify = async () => {
    setVerifyingAll(true);
    try {
      const res = await fetch('/api/admin/verify-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.results) {
        // Refresh the list
        await fetchQuestions();
      }
    } catch (err) {
      console.error('Batch verify error:', err);
    }
    setVerifyingAll(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from('answers').delete().eq('question_id', id);
    await supabase.from('bookmarks').delete().eq('question_id', id);
    await supabase.from('question_views').delete().eq('question_id', id);
    await supabase.from('questions').delete().eq('id', id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setTotal((prev) => prev - 1);
    setActionLoading(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý câu hỏi</h1>
          <p className="mt-1 text-sm text-zinc-400">{total} câu hỏi</p>
        </div>
        <button
          onClick={handleBatchVerify}
          disabled={verifyingAll}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:opacity-60"
        >
          {verifyingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
          {verifyingAll ? 'Đang xác minh...' : 'AI Xác minh hàng loạt'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500/50"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
          {(
            ['all', 'pending', 'ai_verified', 'human_reviewed'] as const
          ).map((f) => (
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
              <Filter className="mr-1 inline h-3 w-3" />
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
                <th className="px-5 py-3 font-medium">Câu hỏi</th>
                <th className="px-5 py-3 font-medium">Danh mục</th>
                <th className="px-5 py-3 font-medium">Độ khó</th>
                <th className="px-5 py-3 font-medium text-center">
                  Lượt xem
                </th>
                <th className="px-5 py-3 font-medium text-center">
                  Trạng thái
                </th>
                <th className="px-5 py-3 font-medium text-center">
                  AI Score
                </th>
                <th className="px-5 py-3 font-medium text-right">
                  Hành động
                </th>
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
                ) : questions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-zinc-500"
                    >
                      Không tìm thấy câu hỏi nào
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => {
                    const cfg = statusConfig[q.status] || statusConfig.pending;
                    return (
                      <motion.tr
                        key={q.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-b border-white/5 transition-colors hover:bg-white/2"
                      >
                        <td className="max-w-xs px-5 py-3">
                          <p className="truncate text-sm text-white">
                            {q.title}
                          </p>
                          <div className="mt-1 flex gap-1">
                            {q.tech_tags?.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-zinc-400">
                            {q.categories?.name || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                              difficultyColors[q.difficulty],
                            )}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                            <Eye className="h-3 w-3" />{' '}
                            {q.view_count.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                              cfg.color,
                            )}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {q.ai_score ? (
                            <button
                              onClick={() =>
                                setFeedbackOpen(
                                  feedbackOpen === q.id ? null : q.id,
                                )
                              }
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors',
                                q.ai_score >= 8
                                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  : q.ai_score >= 5
                                    ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
                              )}
                              title="Xem phản hồi AI"
                            >
                              <MessageSquare className="h-3 w-3" />
                              {q.ai_score}/10
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* AI Verify */}
                            {q.status === 'pending' && (
                              <button
                                onClick={() => handleAIVerifySingle(q.id)}
                                disabled={actionLoading === q.id}
                                className="rounded-lg p-1.5 text-blue-400 transition-colors hover:bg-blue-500/10 disabled:opacity-50"
                                title="AI Xác minh"
                              >
                                {actionLoading === q.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Bot className="h-4 w-4" />
                                )}
                              </button>
                            )}

                            {/* Approve → human_reviewed */}
                            {q.status !== 'human_reviewed' && (
                              <button
                                onClick={() =>
                                  handleSetStatus(q.id, 'human_reviewed')
                                }
                                disabled={actionLoading === q.id}
                                className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                                title="Duyệt thủ công"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}

                            {/* Reset → pending */}
                            {q.status !== 'pending' && (
                              <button
                                onClick={() =>
                                  handleSetStatus(q.id, 'pending')
                                }
                                disabled={actionLoading === q.id}
                                className="rounded-lg p-1.5 text-yellow-400 transition-colors hover:bg-yellow-500/10 disabled:opacity-50"
                                title="Đặt lại"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(q.id)}
                              disabled={actionLoading === q.id}
                              className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* AI Feedback Drawer */}
        <AnimatePresence>
          {feedbackOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              {(() => {
                const q = questions.find((q) => q.id === feedbackOpen);
                if (!q?.ai_feedback) return null;
                return (
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">
                        Phản hồi AI — {q.title}
                      </span>
                      <button
                        onClick={() => setFeedbackOpen(null)}
                        className="ml-auto text-xs text-zinc-500 hover:text-white"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="rounded-xl bg-white/3 border border-white/5 p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {q.ai_feedback}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <p className="text-xs text-zinc-400">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
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
