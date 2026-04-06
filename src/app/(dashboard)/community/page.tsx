'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
  HelpCircle,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import ReviewCard, {
  type CommunityReview,
} from '@/components/community/ReviewCard';
import ContributeDialog from '@/components/community/ContributeDialog';
import CommentSection from '@/components/community/CommentSection';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Stats {
  total: number;
  approved: number;
  contributors: number;
}

type SortOption = 'newest' | 'upvotes';

export default function CommunityPage() {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    contributors: 0,
  });
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sort, setSort] = useState<SortOption>('newest');

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Build query
    let query = supabase
      .from('community_reviews')
      .select(
        '*, categories:category_id(name, slug, color), profiles:author_id(full_name, username, avatar_url)',
        { count: 'exact' },
      )
      .order(sort === 'upvotes' ? 'upvote_count' : 'created_at', {
        ascending: false,
      })
      .limit(30);

    // Filters (approved reviews + user's own are handled by RLS)
    if (selectedCategory) query = query.eq('category_id', selectedCategory);
    if (selectedDifficulty) query = query.eq('difficulty', selectedDifficulty);
    if (search) {
      query = query.or(
        `question_text.ilike.%${search}%,company.ilike.%${search}%,content.ilike.%${search}%`,
      );
    }

    const [reviewsRes, userRes] = await Promise.all([
      query,
      supabase.auth.getUser(),
    ]);

    setReviews((reviewsRes.data as unknown as CommunityReview[]) ?? []);
    setLoading(false);

    const user = userRes.data.user;
    if (user) {
      setCurrentUserId(user.id);
      const { data: uvData } = await supabase
        .from('upvotes')
        .select('review_id')
        .eq('user_id', user.id);
      if (uvData) {
        setUpvotedIds(new Set(uvData.map((u) => u.review_id)));
      }
    }
  }, [search, selectedCategory, selectedDifficulty, sort]);

  const loadMeta = useCallback(async () => {
    const supabase = createClient();

    const [catRes, statsRes] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, slug, color')
        .order('sort_order'),
      supabase
        .from('community_reviews')
        .select('id, is_approved, author_id'),
    ]);

    if (catRes.data) setCategories(catRes.data);
    if (statsRes.data) {
      const uniqueAuthors = new Set(statsRes.data.map((r) => r.author_id));
      setStats({
        total: statsRes.data.length,
        approved: statsRes.data.filter((r) => r.is_approved).length,
        contributors: uniqueAuthors.size,
      });
    }
  }, []);

  // Load meta (categories + stats) on mount
  const metaLoadedRef = useRef<boolean | null>(null);

  if (metaLoadedRef.current === null) {
    metaLoadedRef.current = true;
    loadMeta();
  }

  // Load data initially and on filter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpvote = async (reviewId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (upvotedIds.has(reviewId)) {
      await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', user.id)
        .eq('review_id', reviewId);

      setUpvotedIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, upvote_count: r.upvote_count - 1 } : r,
        ),
      );

      try {
        await supabase.rpc('decrement_upvote', { rid: reviewId });
      } catch {}
    } else {
      await supabase.from('upvotes').insert({
        user_id: user.id,
        review_id: reviewId,
      });

      setUpvotedIds((prev) => new Set(prev).add(reviewId));
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, upvote_count: r.upvote_count + 1 } : r,
        ),
      );

      try {
        await supabase.rpc('increment_upvote', { rid: reviewId });
      } catch {}
    }
  };

  const handleCommentCountChange = (reviewId: string, delta: number) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, comment_count: r.comment_count + delta }
          : r,
      ),
    );
  };

  const difficultyFilters = [
    { value: '', label: 'Tất cả' },
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 lg:pt-0">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-linear-to-br from-primary/5 via-card to-card p-4 sm:p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                Dev<span className="text-gradient">Community</span>
              </h1>
              <p className="mt-1 sm:mt-1.5 text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg">
                Cộng đồng chia sẻ câu hỏi phỏng vấn thực tế từ các developer có
                kinh nghiệm. Được kiểm duyệt bởi admin.
              </p>
            </div>
            <ContributeDialog onSubmitted={() => loadData()} />
          </div>

          {/* Stats */}
          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="rounded-lg sm:rounded-xl border border-border/30 bg-card/50 px-2 sm:px-4 py-2 sm:py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                <HelpCircle className="h-4 w-4" />
              </div>
              <p className="text-base sm:text-lg font-bold">{stats.total}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Câu hỏi</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border/30 bg-card/50 px-2 sm:px-4 py-2 sm:py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-base sm:text-lg font-bold">{stats.approved}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Đã duyệt</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-border/30 bg-card/50 px-2 sm:px-4 py-2 sm:py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-base sm:text-lg font-bold">{stats.contributors}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                Đóng góp
              </p>
            </div>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm câu hỏi, công ty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Sort */}
          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
            <button
              onClick={() => setSort('newest')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                sort === 'newest'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Mới nhất
            </button>
            <button
              onClick={() => setSort('upvotes')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                sort === 'upvotes'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Hữu ích nhất
            </button>
          </div>
        </div>

        {/* Category + Difficulty filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />

          {/* Categories */}
          <Badge
            variant={selectedCategory === '' ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer text-xs transition-all',
              selectedCategory === '' && 'bg-primary text-primary-foreground',
            )}
            onClick={() => setSelectedCategory('')}
          >
            Tất cả
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs transition-all',
                selectedCategory === cat.id &&
                  'bg-primary text-primary-foreground',
              )}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)
              }
            >
              {cat.name}
            </Badge>
          ))}

          <span className="text-border">|</span>

          {/* Difficulty */}
          {difficultyFilters.map((d) => (
            <Badge
              key={d.value}
              variant={selectedDifficulty === d.value ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs transition-all',
                selectedDifficulty === d.value &&
                  'bg-primary text-primary-foreground',
              )}
              onClick={() => setSelectedDifficulty(d.value)}
            >
              {d.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 mb-4">
            <MessageSquare className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold">Chưa có câu hỏi nào</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {search || selectedCategory || selectedDifficulty
              ? 'Không tìm thấy kết quả phù hợp. Thử thay đổi bộ lọc.'
              : 'Hãy là người đầu tiên đóng góp câu hỏi phỏng vấn thực tế cho cộng đồng!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div key={review.id}>
              <ReviewCard
                review={review}
                currentUserId={currentUserId}
                isUpvoted={upvotedIds.has(review.id)}
                onUpvote={handleUpvote}
                index={idx}
              />
              {/* Inline comment section */}
              <div className="ml-0 sm:ml-5 mt-1 mb-2">
                <CommentSection
                  reviewId={review.id}
                  commentCount={review.comment_count}
                  onCommentCountChange={(delta) =>
                    handleCommentCountChange(review.id, delta)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
