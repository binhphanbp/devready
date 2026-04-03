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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  difficulty: string;
  is_approved: boolean;
  view_count: number;
  bookmark_count: number;
  tech_tags: string[];
  company_tags: string[];
  created_at: string;
  categories: { name: string } | null;
}

const ITEMS_PER_PAGE = 15;

const difficultyColors: Record<string, string> = {
  intern: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  fresher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  junior: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  middle: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  senior: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminQuestionsClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('questions')
      .select(
        'id, title, difficulty, is_approved, view_count, bookmark_count, tech_tags, company_tags, created_at, categories(name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (filter === 'approved') query = query.eq('is_approved', true);
    if (filter === 'pending') query = query.eq('is_approved', false);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, count } = await query;
    setQuestions((data as unknown as Question[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, filter, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from('questions').update({ is_approved: true }).eq('id', id);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_approved: true } : q)),
    );
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    await supabase
      .from('questions')
      .update({ is_approved: false })
      .eq('id', id);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_approved: false } : q)),
    );
    setActionLoading(null);
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
              <Filter className="mr-1 inline h-3 w-3" />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
                <th className="px-5 py-3 font-medium">Câu hỏi</th>
                <th className="px-5 py-3 font-medium">Danh mục</th>
                <th className="px-5 py-3 font-medium">Độ khó</th>
                <th className="px-5 py-3 font-medium text-center">Lượt xem</th>
                <th className="px-5 py-3 font-medium text-center">
                  Trạng thái
                </th>
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
                ) : questions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-zinc-500"
                    >
                      Không tìm thấy câu hỏi nào
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <motion.tr
                      key={q.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-white/5 transition-colors hover:bg-white/2"
                    >
                      <td className="max-w-xs px-5 py-3">
                        <p className="truncate text-sm text-white">{q.title}</p>
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
                          <Eye className="h-3 w-3" /> {q.view_count}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {q.is_approved ? (
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
                          {!q.is_approved ? (
                            <button
                              onClick={() => handleApprove(q.id)}
                              disabled={actionLoading === q.id}
                              className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                              title="Duyệt"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(q.id)}
                              disabled={actionLoading === q.id}
                              className="rounded-lg p-1.5 text-yellow-400 transition-colors hover:bg-yellow-500/10 disabled:opacity-50"
                              title="Bỏ duyệt"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
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
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

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
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
