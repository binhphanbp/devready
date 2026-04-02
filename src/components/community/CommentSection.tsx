'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, CornerDownRight, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  review_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  } | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  reviewId: string;
  commentCount: number;
  onCommentCountChange?: (delta: number) => void;
}

export default function CommentSection({
  reviewId,
  commentCount,
  onCommentCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('*, profiles:author_id(full_name, username, avatar_url)')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (data) {
      // Build tree structure
      const topLevel: Comment[] = [];
      const childMap = new Map<string, Comment[]>();

      for (const c of data as unknown as Comment[]) {
        if (c.parent_id) {
          const existing = childMap.get(c.parent_id) || [];
          existing.push(c);
          childMap.set(c.parent_id, existing);
        } else {
          topLevel.push(c);
        }
      }

      for (const c of topLevel) {
        c.replies = childMap.get(c.id) || [];
      }

      setComments(topLevel);
    }
    setLoading(false);
  }, [reviewId]);

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [expanded, loadComments]);

  const handleSubmit = async (parentId: string | null = null) => {
    const text = parentId ? replyText.trim() : newComment.trim();
    if (!text) return;

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        review_id: reviewId,
        author_id: user.id,
        content: text,
        parent_id: parentId,
      })
      .select('*, profiles:author_id(full_name, username, avatar_url)')
      .single();

    if (!error && data) {
      const newC = data as unknown as Comment;

      if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), newC] };
            }
            return c;
          }),
        );
        setReplyTo(null);
        setReplyText('');
      } else {
        newC.replies = [];
        setComments((prev) => [...prev, newC]);
        setNewComment('');
      }

      // Update comment_count
      await supabase
        .from('community_reviews')
        .update({ comment_count: commentCount + 1 })
        .eq('id', reviewId);

      onCommentCountChange?.(1);
    }

    setSubmitting(false);
  };

  const getInitials = (c: Comment) =>
    (c.profiles?.full_name || c.profiles?.username || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return `${mins}p`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {commentCount} bình luận
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-border/30 pt-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      {/* Top-level comment */}
                      <CommentBubble
                        comment={comment}
                        initials={getInitials(comment)}
                        timeAgo={getTimeAgo(comment.created_at)}
                        onReply={() =>
                          setReplyTo(replyTo === comment.id ? null : comment.id)
                        }
                      />

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {comment.replies.map((reply) => (
                            <CommentBubble
                              key={reply.id}
                              comment={reply}
                              initials={getInitials(reply)}
                              timeAgo={getTimeAgo(reply.created_at)}
                              isReply
                            />
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {replyTo === comment.id && (
                        <div className="ml-8 flex gap-2">
                          <CornerDownRight className="h-4 w-4 shrink-0 text-muted-foreground mt-2" />
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Viết trả lời..."
                              rows={1}
                              className="resize-none text-xs min-h-[36px]"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0 shrink-0"
                              onClick={() => handleSubmit(comment.id)}
                              disabled={submitting || !replyText.trim()}
                            >
                              {submitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* New comment input */}
                  <div className="flex gap-2 pt-1">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận..."
                      rows={1}
                      className="resize-none text-xs min-h-[36px]"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 shrink-0"
                      onClick={() => handleSubmit(null)}
                      disabled={submitting || !newComment.trim()}
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommentBubble({
  comment,
  initials,
  timeAgo,
  isReply = false,
  onReply,
}: {
  comment: Comment;
  initials: string;
  timeAgo: string;
  isReply?: boolean;
  onReply?: () => void;
}) {
  return (
    <div className={cn('flex gap-2.5', isReply && 'ml-0')}>
      <Avatar className="h-6 w-6 shrink-0">
        {comment.profiles?.avatar_url && (
          <AvatarImage src={comment.profiles.avatar_url} />
        )}
        <AvatarFallback className="text-[9px] bg-muted">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">
            {comment.profiles?.full_name ||
              comment.profiles?.username ||
              'Ẩn danh'}
          </span>
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {comment.content}
        </p>
        {onReply && (
          <button
            onClick={onReply}
            className="text-[10px] text-primary/70 hover:text-primary mt-1 font-medium"
          >
            Trả lời
          </button>
        )}
      </div>
    </div>
  );
}
