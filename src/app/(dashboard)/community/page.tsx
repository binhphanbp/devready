'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  PenLine,
  MessageSquare,
  ThumbsUp,
  Building2,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Review = {
  id: string;
  company: string;
  role: string;
  difficulty: string | null;
  content: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  profiles: { full_name: string; username: string; avatar_url: string } | null;
};

const difficultyOptions = [
  {
    value: 'easy',
    label: 'Dễ',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    value: 'medium',
    label: 'Trung bình',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  {
    value: 'hard',
    label: 'Khó',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
];

export default function CommunityPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [content, setContent] = useState('');

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadData() {
      const [reviewsRes, userRes] = await Promise.all([
        supabase
          .from('community_reviews')
          .select('*, profiles(full_name, username, avatar_url)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.auth.getUser(),
      ]);

      if (cancelled) return;
      setReviews((reviewsRes.data as unknown as Review[]) ?? []);
      setLoading(false);

      const user = userRes.data.user;
      if (user) {
        const { data } = await supabase
          .from('upvotes')
          .select('review_id')
          .eq('user_id', user.id);
        if (!cancelled && data) {
          setUpvotedIds(new Set(data.map((u) => u.review_id)));
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }

    const { error } = await supabase.from('community_reviews').insert({
      author_id: user.id,
      company: company.trim(),
      role: role.trim(),
      difficulty,
      content: content.trim(),
    });

    if (!error) {
      setCompany('');
      setRole('');
      setDifficulty('medium');
      setContent('');
      setDialogOpen(false);
      // Reload reviews
      const { data } = await supabase
        .from('community_reviews')
        .select('*, profiles(full_name, username, avatar_url)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(50);
      setReviews((data as unknown as Review[]) ?? []);
    }
    setCreating(false);
  };

  const handleUpvote = async (reviewId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (upvotedIds.has(reviewId)) {
      // Remove upvote
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
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, upvote_count: r.upvote_count - 1 } : r,
        ),
      );
    } else {
      // Add upvote
      await supabase.from('upvotes').insert({
        user_id: user.id,
        review_id: reviewId,
      });

      setUpvotedIds((prev) => new Set(prev).add(reviewId));
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, upvote_count: r.upvote_count + 1 } : r,
        ),
      );
    }
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dev<span className="text-gradient">Community</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Chia sẻ và đọc trải nghiệm phỏng vấn từ cộng đồng IT Việt Nam.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
              />
            }
          >
            <PenLine className="mr-1 h-4 w-4" />
            Viết review
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Chia sẻ trải nghiệm phỏng vấn</DialogTitle>
              <DialogDescription>
                Giúp cộng đồng chuẩn bị tốt hơn bằng cách chia sẻ kinh nghiệm
                thực tế.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReview} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Công ty</label>
                  <Input
                    placeholder="VD: FPT Software"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vị trí</label>
                  <Input
                    placeholder="VD: Frontend Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Độ khó</label>
                <div className="flex gap-2">
                  {difficultyOptions.map((d) => (
                    <Badge
                      key={d.value}
                      variant="outline"
                      className={cn(
                        'cursor-pointer transition-all',
                        difficulty === d.value
                          ? d.className + ' font-medium'
                          : 'hover:bg-muted/50',
                      )}
                      onClick={() => setDifficulty(d.value)}
                    >
                      {d.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nội dung chia sẻ</label>
                <Textarea
                  placeholder="Chia sẻ quy trình phỏng vấn, câu hỏi được hỏi, tips cho bạn đọc..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    creating ||
                    !company.trim() ||
                    !role.trim() ||
                    !content.trim()
                  }
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Đăng review
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-border/50 bg-card/50 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 mb-4">
            <MessageSquare className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold">Chưa có review nào</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Hãy là người đầu tiên chia sẻ trải nghiệm phỏng vấn của bạn!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => {
            const diff = difficultyOptions.find(
              (d) => d.value === review.difficulty,
            );
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
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-border/50 bg-card/50 hover:border-border transition-colors">
                  <CardContent className="p-5">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                          {review.profiles?.full_name ||
                            review.profiles?.username ||
                            'Ẩn danh'}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {new Date(review.created_at).toLocaleDateString(
                              'vi-VN',
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Company & role */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Building2 className="h-3 w-3" />
                        {review.company}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Briefcase className="h-3 w-3" />
                        {review.role}
                      </Badge>
                      {diff && (
                        <Badge
                          variant="outline"
                          className={cn('text-xs', diff.className)}
                        >
                          {diff.label}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {review.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'gap-1.5 text-xs h-8',
                          upvotedIds.has(review.id) && 'text-primary',
                        )}
                        onClick={() => handleUpvote(review.id)}
                      >
                        <ThumbsUp
                          className={cn(
                            'h-3.5 w-3.5',
                            upvotedIds.has(review.id) && 'fill-primary',
                          )}
                        />
                        {review.upvote_count} Hữu ích
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {review.comment_count} Bình luận
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
