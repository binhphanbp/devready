"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIReviewSheetProps {
  userAnswer: string;
  sampleAnswer: string;
  questionTitle: string;
  onClose: () => void;
}

export function AIReviewSheet({
  userAnswer,
  sampleAnswer,
  questionTitle,
  onClose,
}: AIReviewSheetProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch on mount
  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/review-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAnswer, sampleAnswer, questionTitle }),
        });

        if (!res.ok) {
          throw new Error("Failed to get review");
        }

        const data = await res.json();
        setFeedback(data.feedback);
      } catch {
        setError("Không thể lấy đánh giá từ AI. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[85vh] bg-background border border-border/50 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-card/80">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#0066FF] to-[#00AAFF] shadow-md">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">ReadyBot Review</h3>
                <p className="text-xs text-muted-foreground">
                  Đánh giá câu trả lời của bạn
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-65px)] p-5">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-[#0066FF]/20 to-[#00AAFF]/20 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-[#0066FF] animate-pulse" />
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin text-[#00AAFF] absolute -bottom-1 -right-1" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    ReadyBot đang đánh giá...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    So sánh câu trả lời với đáp án mẫu
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <X className="h-7 w-7 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            )}

            {feedback && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* AI Badge */}
                <Badge
                  variant="outline"
                  className="mb-4 text-xs bg-[#0066FF]/5 text-[#0066FF] border-[#0066FF]/20"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Đánh giá bởi ReadyBot AI
                </Badge>

                {/* Feedback Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2 prose-ul:my-2 prose-li:my-0.5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {feedback}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
