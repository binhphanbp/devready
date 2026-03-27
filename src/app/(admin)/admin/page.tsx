'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Users,
  FileQuestion,
  MessageSquare,
  FolderTree,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  approvedQuestions: number;
  pendingQuestions: number;
  totalReviews: number;
  totalCategories: number;
  recentUsers: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
  }[];
  recentQuestions: {
    id: string;
    title: string;
    difficulty: string;
    is_approved: boolean;
    created_at: string;
  }[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [
        { count: totalUsers },
        { count: totalQuestions },
        { count: approvedQuestions },
        { count: pendingQuestions },
        { count: totalReviews },
        { count: totalCategories },
        { data: recentUsers },
        { data: recentQuestions },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true),
        supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', false),
        supabase
          .from('community_reviews')
          .select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('questions')
          .select('id, title, difficulty, is_approved, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalUsers: totalUsers ?? 0,
        totalQuestions: totalQuestions ?? 0,
        approvedQuestions: approvedQuestions ?? 0,
        pendingQuestions: pendingQuestions ?? 0,
        totalReviews: totalReviews ?? 0,
        totalCategories: totalCategories ?? 0,
        recentUsers: recentUsers ?? [],
        recentQuestions: recentQuestions ?? [],
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
      </div>
    );
  }

  if (!stats) return null;

  const difficultyColors: Record<string, string> = {
    intern: 'bg-emerald-500/20 text-emerald-400',
    fresher: 'bg-blue-500/20 text-blue-400',
    junior: 'bg-yellow-500/20 text-yellow-400',
    middle: 'bg-orange-500/20 text-orange-400',
    senior: 'bg-red-500/20 text-red-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
        <p className="mt-1 text-sm text-zinc-400">Quản lý nền tảng DevReady</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Người dùng"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          label="Câu hỏi"
          value={stats.totalQuestions}
          icon={FileQuestion}
          color="green"
        />
        <StatsCard
          label="Chờ duyệt"
          value={stats.pendingQuestions}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          label="Đánh giá"
          value={stats.totalReviews}
          icon={MessageSquare}
          color="purple"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/3 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Câu hỏi gần đây
            </h2>
            <Link
              href="/admin/questions"
              className="text-xs text-orange-400 hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-xl bg-white/3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{q.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${difficultyColors[q.difficulty] || ''}`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(q.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                {q.is_approved ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/3 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Người dùng mới
            </h2>
            <Link
              href="/admin/users"
              className="text-xs text-orange-400 hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                  {u.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {u.full_name || 'Ẩn danh'}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Tham gia{' '}
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/3 p-5"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-lg font-bold text-white">
              {stats.approvedQuestions}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Đã duyệt</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <FolderTree className="h-4 w-4 text-blue-400" />
            <span className="text-lg font-bold text-white">
              {stats.totalCategories}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Danh mục</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <span className="text-lg font-bold text-white">
              {stats.totalQuestions > 0
                ? Math.round(
                    (stats.approvedQuestions / stats.totalQuestions) * 100,
                  )
                : 0}
              %
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Tỷ lệ duyệt</p>
        </div>
      </motion.div>
    </div>
  );
}
