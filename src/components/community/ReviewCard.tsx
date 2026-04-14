'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ThumbsUp,
  MessageSquare,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import MarkdownRenderer from './MarkdownRenderer';

export type CommunityReview = {
  id: string;
  company: string;
  role: string;
  difficulty: string | null;
  content: string;
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
};

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

interface ReviewCardProps {
  review: CommunityReview;
  currentUserId?: string;
  isUpvoted: boolean;
  onUpvote: (reviewId: string) => void;
  index?: number;
}

export default function ReviewCard({
  review,
  currentUserId,
  isUpvoted,
  onUpvote,
  index = 0,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const diff = review.difficulty ? difficultyConfig[review.difficulty] : null;

  const isOwn = currentUserId === review.author_id;
  const isPending = !review.is_approved;

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

  const timeAgo = getTimeAgo(review.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card
        className={cn(
          'group border-border/50 bg-card/50 transition-all hover:border-border hover:shadow-md',
          isPending && isOwn && 'border-yellow-500/20 bg-yellow-500/2',
        )}
      >
        <CardContent className="p-5">
          {/* Pending badge */}
          {isPending && isOwn && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
              <Clock className="h-3.5 w-3.5" />
              Đang chờ kiểm duyệt — chỉ bạn thấy bài viết này
            </div>
          )}

          {/* Header: Author + Time */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              {review.profiles?.avatar_url && (
                <AvatarImage src={review.profiles.avatar_url} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
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
                <span>{timeAgo}</span>
                {review.categories && (
                  <>
                    <span>·</span>
                    <span
                      className="font-medium"
                      style={{ color: review.categories.color || undefined }}
                    >
                      {review.categories.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badges: Company / Role / Difficulty */}
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

          {/* Question text - the main content */}
          {review.question_text && (
            <div className="mb-3 rounded-xl bg-muted/30 p-4 border border-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Câu hỏi phỏng vấn
              </p>
              <p className="text-sm font-medium leading-relaxed">
                {review.question_text}
              </p>
            </div>
          )}

          {/* Content / experience sharing */}
          {review.content && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
              {review.content}
            </p>
          )}

          {/* Answer - expandable */}
          {review.answer_text && (
            <div className="mb-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                {expanded ? 'Ẩn câu trả lời' : 'Xem câu trả lời mẫu'}
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 rounded-xl bg-emerald-500/3 border border-emerald-500/10 p-4"
                >
                  <p className="text-xs font-medium text-emerald-400 mb-1.5 uppercase tracking-wider">
                    Câu trả lời mẫu
                  </p>
                  <MarkdownRenderer content={review.answer_text} />
                </motion.div>
              )}
            </div>
          )}

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn('gap-1.5 text-xs h-8', isUpvoted && 'text-primary')}
              onClick={() => onUpvote(review.id)}
            >
              <ThumbsUp
                className={cn('h-3.5 w-3.5', isUpvoted && 'fill-primary')}
              />
              {review.upvote_count} Hữu ích
            </Button>
            <Link href={`/community/${review.id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                <MessageSquare className="h-3.5 w-3.5" />
                {review.comment_count} Bình luận
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString('vi-VN');
}
