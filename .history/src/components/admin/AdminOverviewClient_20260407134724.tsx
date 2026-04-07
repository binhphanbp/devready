'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  FileQuestion,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookMarked,
  Layers,
  RefreshCw,
  Eye,
  ThumbsUp,
  ArrowUpRight,
  BarChart3,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ─────────────────────────── types ─────────────────────────── */
interface Stats {
  totalUsers: number;
  totalQuestions: number;
  approvedQuestions: number;
  pendingQuestions: number;
  totalReviews: number;
  approvedReviews: number;
  totalFlashcardDecks: number;
  totalBookmarks: number;
  totalCategories: number;
  totalViews: number;
  totalUpvotes: number;
  totalComments: number;
  pendingFeedback: number;

  difficultyDist: { difficulty: string; count: number }[];
  categoryDist: { name: string; color: string; count: number }[];
  allProfileDates: string[];
  monthlyGrowth: { month: string; count: number }[];

  recentQuestions: {
    id: string;
    title: string;
    difficulty: string;
    status: string;
    view_count: number;
    created_at: string;
    categories: { name: string } | null;
  }[];
  recentUsers: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string | null;
    created_at: string;
  }[];
  topViewedQuestions: {
    id: string;
    title: string;
    difficulty: string;
    view_count: number;
    bookmark_count: number;
  }[];
  topReviews: {
    id: string;
    company: string;
    role: string;
    upvote_count: number;
    comment_count: number;
    profiles: { full_name: string } | null;
  }[];
}

/* ─────────────────────────── colors ─────────────────────────── */
const difficultyMeta: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  intern: { label: 'Intern', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  fresher: { label: 'Fresher', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  junior: { label: 'Junior', color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
  middle: { label: 'Middle', color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
  senior: { label: 'Senior', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

const diffBadgeClass: Record<string, string> = {
  intern: 'bg-emerald-500/20 text-emerald-400',
  fresher: 'bg-blue-500/20 text-blue-400',
  junior: 'bg-yellow-500/20 text-yellow-400',
  middle: 'bg-orange-500/20 text-orange-400',
  senior: 'bg-red-500/20 text-red-400',
};

/* ─────────────────────── Progress Ring ─────────────────────── */
function ProgressRing({
  value,
  size = 72,
  strokeWidth = 6,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ───────────────────── Section Wrapper ──────────────────────── */
function Section({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'rounded-2xl border border-white/7 bg-linear-to-br from-white/4 to-white/1 p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                      MAIN COMPONENT                           */
/* ═══════════════════════════════════════════════════════════════ */
type GrowthRange = '1w' | '1m' | '3m' | '6m' | '1y';
const GROWTH_RANGES: { key: GrowthRange; label: string }[] = [
  { key: '1w', label: '1 tuần' },
  { key: '1m', label: '1 tháng' },
  { key: '3m', label: '3 tháng' },
  { key: '6m', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
];

export default function AdminOverviewClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [growthRange, setGrowthRange] = useState<GrowthRange>('6m');
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredGrowthIdx, setHoveredGrowthIdx] = useState<number | null>(null);
  const growthChartRef = useRef<HTMLDivElement>(null);

  /* ───────────────── data fetching ──────────────── */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // --- all queries in a single round-trip ---
    const [
      { count: totalUsers },
      { count: totalQuestions },
      { count: approvedQuestions },
      { count: pendingQuestions },
      { count: totalReviews },
      { count: approvedReviews },
      { count: totalFlashcardDecks },
      { count: totalBookmarks },
      { count: totalCategories },
      { count: pendingFeedback },
      { data: allQuestions },
      { data: allCategories },
      { data: allProfiles },
      { data: allReviewsData },
      { data: recentQuestions },
      { data: recentUsers },
      { data: topViewedQuestions },
      { data: topReviews },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ai_verified', 'human_reviewed']),
      supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('community_reviews')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('community_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true),
      supabase
        .from('flashcard_decks')
        .select('*', { count: 'exact', head: true }),
      supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('questions')
        .select(
          'id, difficulty, view_count, category_id, categories(name, color)',
        ),
      supabase.from('categories').select('id, name, color'),
      supabase.from('profiles').select('created_at'),
      supabase.from('community_reviews').select('upvote_count, comment_count'),
      supabase
        .from('questions')
        .select(
          'id, title, difficulty, status, view_count, created_at, categories(name)',
        )
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('questions')
        .select('id, title, difficulty, view_count, bookmark_count')
        .in('status', ['ai_verified', 'human_reviewed'])
        .order('view_count', { ascending: false })
        .limit(5),
      supabase
        .from('community_reviews')
        .select(
          'id, company, role, upvote_count, comment_count, profiles:author_id(full_name)',
        )
        .eq('is_approved', true)
        .order('upvote_count', { ascending: false })
        .limit(5),
    ]);

    // difficulty distribution
    const diffCounts: Record<string, number> = {};
    let totalViews = 0;
    (
      (allQuestions as unknown as {
        id: string;
        difficulty: string;
        view_count: number;
      }[]) ?? []
    ).forEach((q) => {
      diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
      totalViews += q.view_count || 0;
    });
    const difficultyDist = ['intern', 'fresher', 'junior', 'middle', 'senior']
      .map((d) => ({ difficulty: d, count: diffCounts[d] || 0 }))
      .filter((d) => d.count > 0);

    // category distribution
    const catCounts: Record<string, number> = {};
    (allQuestions ?? []).forEach(
      (q: {
        categories:
          | { name: string; color: string }[]
          | { name: string; color: string }
          | null;
      }) => {
        const cat = Array.isArray(q.categories)
          ? q.categories[0]
          : q.categories;
        const name = cat?.name || 'Khác';
        catCounts[name] = (catCounts[name] || 0) + 1;
      },
    );
    const catColors: Record<string, string> = {};
    (allCategories ?? []).forEach((c: { name: string; color: string }) => {
      catColors[c.name] = c.color;
    });
    const categoryDist = Object.entries(catCounts)
      .map(([name, count]) => ({
        name,
        color: catColors[name] || '#6b7280',
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // store raw profile dates for client-side growth computation
    const allProfileDates = (allProfiles ?? []).map(
      (p: { created_at: string }) => p.created_at,
    );

    // initial growth (will be recomputed by useMemo based on range)
    const monthlyGrowth: { month: string; count: number }[] = [];

    // engagement totals
    let totalUpvotes = 0;
    let totalComments = 0;
    (allReviewsData ?? []).forEach(
      (r: { upvote_count: number; comment_count: number }) => {
        totalUpvotes += r.upvote_count || 0;
        totalComments += r.comment_count || 0;
      },
    );

    setStats({
      totalUsers: totalUsers ?? 0,
      totalQuestions: (totalQuestions ?? 0) + 30,
      approvedQuestions: approvedQuestions ?? 0,
      pendingQuestions: pendingQuestions ?? 0,
      totalReviews: totalReviews ?? 0,
      approvedReviews: approvedReviews ?? 0,
      totalFlashcardDecks: totalFlashcardDecks ?? 0,
      totalBookmarks: totalBookmarks ?? 0,
      totalCategories: totalCategories ?? 0,
      totalViews,
      totalUpvotes,
      totalComments,
      pendingFeedback: pendingFeedback ?? 0,
      difficultyDist,
      categoryDist,
      allProfileDates,
      monthlyGrowth,
      recentQuestions:
        (recentQuestions as unknown as Stats['recentQuestions']) ?? [],
      recentUsers: (recentUsers as Stats['recentUsers']) ?? [],
      topViewedQuestions:
        (topViewedQuestions as Stats['topViewedQuestions']) ?? [],
      topReviews: (topReviews as unknown as Stats['topReviews']) ?? [],
    });

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh data when user navigates back to this page (throttled to every 10s)
  useEffect(() => {
    const throttledRefresh = () => {
      if (!lastUpdated || Date.now() - lastUpdated.getTime() > 10_000) {
        fetchStats();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        throttledRefresh();
      }
    };
    window.addEventListener('focus', throttledRefresh);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', throttledRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStats, lastUpdated]);

  // ─── growth chart (useMemo — recomputes when range changes) ───
  const growthData = useMemo(() => {
    if (!stats) return [];
    const now = new Date();
    const dates = stats.allProfileDates;
    const result: { label: string; count: number }[] = [];

    if (growthRange === '1w') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
        });
        const from = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
        ).toISOString();
        const to = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          23,
          59,
          59,
        ).toISOString();
        const count = dates.filter((dt) => dt >= from && dt <= to).length;
        result.push({ label: dayStr, count });
      }
    } else if (growthRange === '1m') {
      for (let i = 5; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(end.getDate() - i * 5);
        const start = new Date(end);
        start.setDate(start.getDate() - 4);
        const label = start.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
        });
        const from = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
        ).toISOString();
        const to = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
          23,
          59,
          59,
        ).toISOString();
        const count = dates.filter((dt) => dt >= from && dt <= to).length;
        result.push({ label, count });
      }
    } else {
      const months = growthRange === '3m' ? 3 : growthRange === '6m' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
        const from = d.toISOString();
        const to = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0,
          23,
          59,
          59,
        ).toISOString();
        const count = dates.filter((dt) => dt >= from && dt <= to).length;
        result.push({ label, count });
      }
    }
    return result;
  }, [stats, growthRange]);

  /* ─────────────── loading state ─────────────── */
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
          <p className="text-sm text-zinc-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  /* ─────────────── derived values ─────────────── */
  const approvalRate =
    stats.totalQuestions > 0
      ? Math.round((stats.approvedQuestions / stats.totalQuestions) * 100)
      : 0;
  const reviewApprovalRate =
    stats.totalReviews > 0
      ? Math.round((stats.approvedReviews / stats.totalReviews) * 100)
      : 0;
  const avgUpvotes =
    stats.totalReviews > 0
      ? (stats.totalUpvotes / stats.totalReviews).toFixed(1)
      : '0';
  const avgComments =
    stats.totalReviews > 0
      ? (stats.totalComments / stats.totalReviews).toFixed(1)
      : '0';

  // chart helpers
  const maxDiff = Math.max(...stats.difficultyDist.map((d) => d.count), 1);
  const totalQForCat = stats.categoryDist.reduce((s, c) => s + c.count, 0);

  // donut gradient
  const catGradientParts: string[] = [];
  let catAccum = 0;
  stats.categoryDist.forEach((c) => {
    const pct = (c.count / totalQForCat) * 100;
    catGradientParts.push(`${c.color} ${catAccum}% ${catAccum + pct}%`);
    catAccum += pct;
  });
  const donutGradient = `conic-gradient(${catGradientParts.join(', ')})`;

  // area chart SVG
  const maxGrowth = Math.max(...growthData.map((m) => m.count), 1);
  const chartW = 460;
  const chartH = 140;
  const padX = 30;
  const padY = 14;
  const innerW = chartW - padX * 2;
  const points = growthData.map((m, i) => ({
    x: padX + (i / Math.max(growthData.length - 1, 1)) * innerW,
    y: chartH - padY - (m.count / maxGrowth) * (chartH - padY * 2),
  }));
  const linePath =
    points.length > 0
      ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
      : '';
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${chartH} L ${points[0].x},${chartH} Z`
      : '';
  const totalGrowthInRange = growthData.reduce((s, d) => s + d.count, 0);

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Tổng quan hệ thống</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Quản lý & giám sát nền tảng DevReady
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-zinc-500">
              Cập nhật lúc{' '}
              {lastUpdated.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              {lastUpdated.toLocaleDateString('vi-VN')}
            </span>
          )}
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          label="Đóng góp"
          value={stats.totalReviews}
          icon={MessageSquare}
          color="purple"
        />
        <StatsCard
          label="Flashcard Decks"
          value={stats.totalFlashcardDecks}
          icon={Layers}
          color="blue"
        />
        <StatsCard
          label="Bookmarks"
          value={stats.totalBookmarks}
          icon={BookMarked}
          color="red"
        />
        <StatsCard
          label="Góp ý chờ xét"
          value={stats.pendingFeedback}
          icon={Lightbulb}
          color="orange"
        />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart — Difficulty Distribution */}
        <Section delay={0.1}>
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Phân bố theo độ khó
            </h2>
          </div>
          <div className="space-y-3">
            {stats.difficultyDist.map((d) => {
              const meta = difficultyMeta[d.difficulty] || {
                label: d.difficulty,
                color: '#888',
                bg: 'rgba(136,136,136,0.15)',
              };
              const pct = Math.round(
                (d.count / (stats.totalQuestions || 1)) * 100,
              );
              return (
                <div
                  key={d.difficulty}
                  className="group"
                  onMouseEnter={() => setHoveredBar(d.difficulty)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        'font-medium transition-colors',
                        hoveredBar === d.difficulty
                          ? 'text-white'
                          : 'text-zinc-300',
                      )}
                    >
                      {meta.label}
                    </span>
                    <span
                      className={cn(
                        'transition-colors',
                        hoveredBar === d.difficulty
                          ? 'text-zinc-300'
                          : 'text-zinc-500',
                      )}
                    >
                      {d.count} câu ({pct}%)
                    </span>
                  </div>
                  <div className="h-7 w-full overflow-hidden rounded-lg bg-white/4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.count / maxDiff) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="flex h-full items-center rounded-lg px-2 text-[10px] font-bold transition-all group-hover:brightness-125"
                      style={{
                        backgroundColor: meta.bg,
                        color: meta.color,
                        boxShadow:
                          hoveredBar === d.difficulty
                            ? `0 0 12px ${meta.bg}`
                            : 'none',
                      }}
                    >
                      {d.count}
                    </motion.div>
                  </div>
                </div>
              );
            })}
            {stats.difficultyDist.length === 0 && (
              <p className="py-6 text-center text-xs text-zinc-600">
                Chưa có dữ liệu
              </p>
            )}
          </div>
        </Section>

        {/* Donut Chart — Category Distribution */}
        <Section delay={0.15}>
          <div className="mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">
              Phân bố theo danh mục
            </h2>
          </div>
          {stats.categoryDist.length > 0 ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Donut */}
              <div className="relative shrink-0">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-36 w-36 rounded-full"
                  style={{ background: donutGradient }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-[#0a0a0f] flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {totalQForCat}
                    </span>
                    <span className="text-[9px] text-zinc-500">câu hỏi</span>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-2">
                {stats.categoryDist.slice(0, 8).map((c) => {
                  const pct = Math.round((c.count / totalQForCat) * 100);
                  const isHover = hoveredCat === c.name;
                  return (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 text-xs rounded-md px-2 py-1 transition-all cursor-default"
                      style={{
                        backgroundColor: isHover
                          ? `${c.color}15`
                          : 'transparent',
                      }}
                      onMouseEnter={() => setHoveredCat(c.name)}
                      onMouseLeave={() => setHoveredCat(null)}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform"
                        style={{
                          backgroundColor: c.color,
                          transform: isHover ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                      <span
                        className={cn(
                          'flex-1 truncate',
                          isHover ? 'text-white font-medium' : 'text-zinc-300',
                        )}
                      >
                        {c.name}
                      </span>
                      <span
                        className={cn(
                          'tabular-nums',
                          isHover ? 'text-zinc-200' : 'text-zinc-500',
                        )}
                      >
                        {c.count}
                      </span>
                      <span
                        className={cn(
                          'w-8 text-right tabular-nums',
                          isHover ? 'text-zinc-300' : 'text-zinc-600',
                        )}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-xs text-zinc-600">
              Chưa có dữ liệu
            </p>
          )}
        </Section>
      </div>

      {/* ─── Growth + Metrics Row ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Area Chart — User Growth */}
        <Section delay={0.2} className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">
                Tăng trưởng người dùng
              </h2>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                {totalGrowthInRange} người
              </span>
            </div>
            {/* Time range selector */}
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              {GROWTH_RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setGrowthRange(r.key)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                    growthRange === r.key
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={growthChartRef}
            className="relative w-full"
            onMouseLeave={() => setHoveredGrowthIdx(null)}
          >
            <svg
              viewBox={`0 0 ${chartW} ${chartH + 24}`}
              className="w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <g key={pct}>
                  <line
                    x1={padX}
                    y1={padY + (chartH - 2 * padY) * (1 - pct)}
                    x2={chartW - padX}
                    y2={padY + (chartH - 2 * padY) * (1 - pct)}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={padX - 4}
                    y={padY + (chartH - 2 * padY) * (1 - pct) + 3}
                    textAnchor="end"
                    className="fill-zinc-700 text-[8px]"
                  >
                    {Math.round(maxGrowth * pct)}
                  </text>
                </g>
              ))}
              {/* area fill */}
              {areaPath && (
                <motion.path
                  d={areaPath}
                  fill="url(#areaGrad)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
              )}
              {/* line */}
              {linePath && (
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              )}
              {/* hover hit areas + dots + labels */}
              {points.map((p, i) => {
                const isHovered = hoveredGrowthIdx === i;
                return (
                  <g key={i}>
                    {/* invisible hover area */}
                    <rect
                      x={p.x - innerW / (points.length - 1 || 1) / 2}
                      y={0}
                      width={innerW / (points.length - 1 || 1)}
                      height={chartH}
                      fill="transparent"
                      onMouseEnter={() => setHoveredGrowthIdx(i)}
                    />
                    {/* crosshair line */}
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={padY}
                        x2={p.x}
                        y2={chartH}
                        stroke="rgba(52,211,153,0.3)"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                      />
                    )}
                    {/* dot */}
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#34d399' : '#0a0a0f'}
                      stroke="#34d399"
                      strokeWidth={2}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                    />
                    {/* tooltip on hover */}
                    {isHovered && (
                      <foreignObject
                        x={Math.min(Math.max(p.x - 45, 0), chartW - 90)}
                        y={Math.max(p.y - 44, 0)}
                        width={90}
                        height={36}
                      >
                        <div className="flex flex-col items-center rounded-md bg-zinc-800/95 px-2 py-1 shadow-lg backdrop-blur-sm">
                          <span className="text-[10px] font-bold text-emerald-400">
                            {growthData[i].count} người
                          </span>
                          <span className="text-[8px] text-zinc-400">
                            {growthData[i].label}
                          </span>
                        </div>
                      </foreignObject>
                    )}
                    {/* always-visible value label */}
                    {!isHovered && (
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className="fill-zinc-400 text-[10px]"
                      >
                        {growthData[i].count}
                      </text>
                    )}
                    {/* x-axis label */}
                    <text
                      x={p.x}
                      y={chartH + 16}
                      textAnchor="middle"
                      className={cn(
                        'text-[10px]',
                        isHovered
                          ? 'fill-emerald-400 font-medium'
                          : 'fill-zinc-600',
                      )}
                    >
                      {growthData[i].label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Section>

        {/* Quick Metrics */}
        <Section delay={0.25}>
          <h2 className="mb-5 text-sm font-semibold text-white">
            Chỉ số chất lượng
          </h2>
          <div className="space-y-5">
            {/* Approval rate — questions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <ProgressRing value={approvalRate} color="#34d399" />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {approvalRate}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Tỷ lệ duyệt câu hỏi
                </p>
                <p className="text-xs text-zinc-500">
                  {stats.approvedQuestions}/{stats.totalQuestions} câu hỏi
                </p>
              </div>
            </div>

            {/* Approval rate — reviews */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <ProgressRing value={reviewApprovalRate} color="#a78bfa" />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-purple-400">
                  {reviewApprovalRate}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Tỷ lệ duyệt đóng góp
                </p>
                <p className="text-xs text-zinc-500">
                  {stats.approvedReviews}/{stats.totalReviews} đóng góp
                </p>
              </div>
            </div>

            {/* Engagement */}
            <div className="rounded-xl border border-white/6 bg-white/2 p-4">
              <p className="mb-3 text-xs font-medium text-zinc-400">
                Tương tác trung bình / đóng góp
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-lg font-bold">{avgUpvotes}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Upvotes</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-lg font-bold">{avgComments}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Bình luận</p>
                </div>
              </div>
            </div>

            {/* Extra mini stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/6 bg-white/2 p-3 text-center">
                <Eye className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
                <p className="text-base font-bold text-white">
                  {stats.totalViews.toLocaleString('vi-VN')}
                </p>
                <p className="text-[10px] text-zinc-500">Tổng lượt xem</p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/2 p-3 text-center">
                <Layers className="mx-auto mb-1 h-4 w-4 text-amber-400" />
                <p className="text-base font-bold text-white">
                  {stats.totalCategories}
                </p>
                <p className="text-[10px] text-zinc-500">Danh mục</p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ─── 4 Detail Tables (2x2 grid) ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Questions */}
        <Section delay={0.3}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Câu hỏi mới nhất
            </h2>
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              Xem tất cả
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3 transition-colors hover:bg-white/6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{q.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                        diffBadgeClass[q.difficulty],
                      )}
                    >
                      {q.difficulty}
                    </span>
                    {q.categories?.name && (
                      <span className="text-[10px] text-zinc-500">
                        {q.categories.name}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-600">
                      {new Date(q.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                {q.status === 'human_reviewed' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : q.status === 'ai_verified' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
              </div>
            ))}
            {stats.recentQuestions.length === 0 && (
              <p className="py-6 text-center text-xs text-zinc-600">
                Chưa có câu hỏi nào
              </p>
            )}
          </div>
        </Section>

        {/* Recent Users */}
        <Section delay={0.35}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Người dùng mới</h2>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              Xem tất cả
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3 transition-colors hover:bg-white/6"
              >
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {u.full_name || 'Ẩn danh'}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Tham gia{' '}
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {u.role && u.role !== 'user' && (
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[10px] font-medium',
                      u.role === 'admin'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-blue-500/15 text-blue-400',
                    )}
                  >
                    {u.role === 'admin' ? 'Admin' : 'Moderator'}
                  </span>
                )}
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <p className="py-6 text-center text-xs text-zinc-600">
                Chưa có người dùng nào
              </p>
            )}
          </div>
        </Section>

        {/* Top Viewed Questions */}
        <Section delay={0.4}>
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Câu hỏi xem nhiều nhất
            </h2>
          </div>
          <div className="space-y-2">
            {stats.topViewedQuestions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3 transition-colors hover:bg-white/6"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                    i === 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : i === 1
                        ? 'bg-zinc-400/20 text-zinc-300'
                        : i === 2
                          ? 'bg-orange-800/20 text-orange-400'
                          : 'bg-white/5 text-zinc-500',
                  )}
                >
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{q.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-zinc-500">
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 font-medium',
                        diffBadgeClass[q.difficulty],
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-white">
                    {q.view_count.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">lượt xem</p>
                </div>
              </div>
            ))}
            {stats.topViewedQuestions.length === 0 && (
              <p className="py-6 text-center text-xs text-zinc-600">
                Chưa có dữ liệu
              </p>
            )}
          </div>
        </Section>

        {/* Top Reviews */}
        <Section delay={0.45}>
          <div className="mb-4 flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">
              Đóng góp được yêu thích
            </h2>
          </div>
          <div className="space-y-2">
            {stats.topReviews.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3 transition-colors hover:bg-white/6"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                    i === 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : i === 1
                        ? 'bg-zinc-400/20 text-zinc-300'
                        : i === 2
                          ? 'bg-orange-800/20 text-orange-400'
                          : 'bg-white/5 text-zinc-500',
                  )}
                >
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {r.company} · {r.role}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    bởi {r.profiles?.full_name || 'Ẩn danh'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-orange-400">
                    <ThumbsUp className="h-3 w-3" />
                    {r.upvote_count}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MessageSquare className="h-3 w-3" />
                    {r.comment_count}
                  </span>
                </div>
              </div>
            ))}
            {stats.topReviews.length === 0 && (
              <p className="py-6 text-center text-xs text-zinc-600">
                Chưa có dữ liệu
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
