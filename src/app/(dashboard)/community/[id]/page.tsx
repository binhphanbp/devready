'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ThumbsUp,
  Building2,
  Briefcase,
  ArrowLeft,
  Clock,
  Loader2,
  Share2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import CommentSection from '@/components/community/CommentSection';
import Link from 'next/link';

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: {
    label: 'Dễ',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  medium: {
    label: 'Trung bình',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  hard: {
    label: 'Khó',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

interface ReviewDetail {
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
  author_id: string | null;
  categories: { name: string; slug: string; color: string } | null;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  } | null;
}

interface RelatedReview {
  id: string;
  question_text: string | null;
  company: string;
  difficulty: string | null;
  upvote_count: number;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [related, setRelated] = useState<RelatedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const loadReview = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('community_reviews')
      .select(
        '*, categories:category_id(name, slug, color), profiles:author_id(full_name, username, avatar_url)',
      )
      .eq('id', reviewId)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    const r = data as unknown as ReviewDetail;
    setReview(r);
    setLoading(false);

    // Load user + upvote status
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: uvData } = await supabase
        .from('upvotes')
        .select('id')
        .eq('user_id', user.id)
        .eq('review_id', reviewId)
        .maybeSingle();
      setIsUpvoted(!!uvData);
    }

    // Load related (same category)
    if (r.categories) {
      const { data: relData } = await supabase
        .from('community_reviews')
        .select('id, question_text, company, difficulty, upvote_count')
        .eq('is_approved', true)
        .eq('category_id', data.category_id)
        .neq('id', reviewId)
        .order('upvote_count', { ascending: false })
        .limit(5);
      if (relData) setRelated(relData);
    }
  }, [reviewId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleUpvote = async () => {
    if (!review) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isUpvoted) {
      await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', user.id)
        .eq('review_id', review.id);
      setIsUpvoted(false);
      setReview((prev) =>
        prev ? { ...prev, upvote_count: prev.upvote_count - 1 } : prev,
      );
    } else {
      await supabase.from('upvotes').insert({
        user_id: user.id,
        review_id: review.id,
      });
      setIsUpvoted(true);
      setReview((prev) =>
        prev ? { ...prev, upvote_count: prev.upvote_count + 1 } : prev,
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: review?.question_text || 'Câu hỏi phỏng vấn',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold mb-2">Không tìm thấy bài viết</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Bài viết có thể đã bị xóa hoặc chưa được duyệt.
        </p>
        <Button variant="outline" onClick={() => router.push('/community')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Community
        </Button>
      </div>
    );
  }

  const diff = review.difficulty ? difficultyConfig[review.difficulty] : null;
  const isPending = !review.is_approved;
  const isOwn = currentUserId === review.author_id;
  const initials = (
    review.profiles?.full_name ||
    review.profiles?.username ||
    'U'
  )
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-8 lg:pt-0">
      {/* Back */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại Community
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card
          className={cn(
            'border-border/50 bg-card/50',
            isPending && isOwn && 'border-yellow-500/20',
          )}
        >
          <CardContent className="p-6 sm:p-8">
            {isPending && isOwn && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-400">
                <Clock className="h-3.5 w-3.5" />
                Đang chờ kiểm duyệt — chỉ bạn thấy bài viết này
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                {review.profiles?.avatar_url && (
                  <AvatarImage src={review.profiles.avatar_url} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {review.profiles?.full_name ||
                    review.profiles?.username ||
                    'Ẩn danh'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {review.categories && (
                    <>
                      {' · '}
                      <span
                        className="font-medium"
                        style={{ color: review.categories.color || undefined }}
                      >
                        {review.categories.name}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <Badge variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {review.company}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Briefcase className="h-3 w-3" />
                {review.role}
              </Badge>
              {diff && (
                <Badge variant="outline" className={diff.className}>
                  {diff.label}
                </Badge>
              )}
            </div>

            {/* Question */}
            {review.question_text && (
              <div className="mb-5 rounded-2xl bg-muted/30 p-5 border border-border/30">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Câu hỏi phỏng vấn
                </p>
                <p className="text-base font-medium leading-relaxed">
                  {review.question_text}
                </p>
              </div>
            )}

            {/* Context */}
            {review.content && (
              <div className="mb-5">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Bối cảnh & mô tả
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              </div>
            )}

            {/* Answer */}
            {review.answer_text && (
              <div className="mb-5 rounded-2xl bg-emerald-500/3 border border-emerald-500/10 p-5">
                <p className="text-xs font-medium text-emerald-400 mb-2 uppercase tracking-wider">
                  Câu trả lời mẫu
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {review.answer_text}
                </p>
              </div>
            )}

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1.5',
                  isUpvoted && 'text-primary border-primary/30',
                )}
                onClick={handleUpvote}
              >
                <ThumbsUp
                  className={cn('h-4 w-4', isUpvoted && 'fill-primary')}
                />
                {review.upvote_count} Hữu ích
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Chia sẻ
              </Button>
            </div>

            {/* Comments */}
            <div className="mt-5 pt-5 border-t border-border/50">
              <h3 className="text-sm font-medium mb-3">
                Bình luận ({review.comment_count})
              </h3>
              <CommentSection
                reviewId={review.id}
                commentCount={review.comment_count}
                onCommentCountChange={(delta) =>
                  setReview((prev) =>
                    prev
                      ? { ...prev, comment_count: prev.comment_count + delta }
                      : prev,
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Câu hỏi liên quan</h3>
          <div className="space-y-2">
            {related.map((r) => (
              <Link key={r.id} href={`/community/${r.id}`}>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4 hover:border-border transition-colors cursor-pointer">
                  <p className="text-sm font-medium line-clamp-2 mb-1.5">
                    {r.question_text || 'Câu hỏi phỏng vấn'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{r.company}</span>
                    {r.difficulty && (
                      <span
                        className={difficultyConfig[r.difficulty]?.className}
                      >
                        {difficultyConfig[r.difficulty]?.label}
                      </span>
                    )}
                    <span>👍 {r.upvote_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
