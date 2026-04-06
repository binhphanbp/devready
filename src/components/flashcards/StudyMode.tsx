"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  calculateSRS,
  qualityLabels,
  type ReviewQuality,
} from "@/lib/srs";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.min.css";
import {
  Bot,
  User,
  BookOpen,
  ExternalLink,
  PenLine,
  Flame,
  ShieldAlert,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { AIReviewSheet } from "./AIReviewSheet";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  interval: number;
  repetitions: number;
  next_review: string;
  question_id?: string | null;
}

interface QuestionContent {
  title: string;
  sample_answer: string | null;
  bonus_tip: string | null;
  common_pitfalls: string | null;
  official_source: string | null;
  category_name: string | null;
}

interface UserAnswer {
  question_id: string;
  custom_content: string;
}

interface StudyModeProps {
  cards: FlashcardData[];
  deckTitle: string;
  onComplete: () => void;
}

// ─── Rich Markdown Components (consistent with QuestionDetail) ───
const markdownComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-base font-bold text-foreground mt-4 mb-2 pb-1.5 border-b border-border/50"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-sm font-semibold text-foreground mt-3 mb-2 flex items-center gap-1.5"
      {...props}
    >
      <span className="w-0.5 h-4 rounded-full bg-primary inline-block" />
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-sm font-semibold text-foreground mt-3 mb-1.5"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-[13px] leading-relaxed text-muted-foreground mb-2"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="space-y-1 mb-3 ml-1 text-[13px] text-muted-foreground"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="space-y-1 mb-3 ml-1 text-[13px] text-muted-foreground list-decimal list-inside"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-1.5 text-[13px]" {...props}>
      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/50 shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  ),
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="px-1 py-0.5 rounded-md bg-primary/10 text-primary text-[12px] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn("text-[12px] font-mono text-[#e6edf3]", className)}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mb-3 rounded-lg border border-border/50 bg-[#0d1117] p-3 overflow-x-auto text-[12px] leading-relaxed text-[#e6edf3] [&_code]:text-[#e6edf3] [&_.hljs-comment]:text-[#8b949e] [&_.hljs-keyword]:text-[#ff7b72] [&_.hljs-string]:text-[#a5d6ff] [&_.hljs-number]:text-[#79c0ff] [&_.hljs-function]:text-[#d2a8ff]"
      {...props}
    >
      {children}
    </pre>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-primary/40 pl-3 py-0.5 my-2 bg-primary/5 rounded-r-lg"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full text-[13px]" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-2.5 py-1.5 text-left font-medium text-foreground bg-muted/50 border-b border-border/50 text-[12px]"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-2.5 py-1.5 text-muted-foreground border-b border-border/30 text-[12px]"
      {...props}
    >
      {children}
    </td>
  ),
};

export function StudyMode({ cards, deckTitle, onComplete }: StudyModeProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Answer source state
  const [answerSourceOverride, setAnswerSourceOverride] = useState<"sample" | "user" | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [questionContents, setQuestionContents] = useState<Record<string, QuestionContent>>({});
  const [showAIReview, setShowAIReview] = useState(false);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

  // Fetch user answers and question content for linked cards
  useEffect(() => {
    const fetchLinkedData = async () => {
      const linkedCards = cards.filter((c) => c.question_id);
      if (linkedCards.length === 0) return;

      const supabase = createClient();
      const questionIds = linkedCards.map((c) => c.question_id!);

      // Fetch user answers
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: answers } = await supabase
          .from("user_answers")
          .select("question_id, custom_content")
          .eq("user_id", user.id)
          .in("question_id", questionIds);

        if (answers) {
          const map: Record<string, string> = {};
          (answers as UserAnswer[]).forEach((a) => {
            map[a.question_id] = a.custom_content;
          });
          setUserAnswers(map);
        }
      }

      // Fetch question content including bonus_tip, common_pitfalls, official_source
      const { data: questions } = await supabase
        .from("questions")
        .select("id, title, sample_answer, bonus_tip, common_pitfalls, official_source, categories(name)")
        .in("id", questionIds);

      if (questions) {
        const map: Record<string, QuestionContent> = {};
        questions.forEach((q: Record<string, unknown>) => {
          map[q.id as string] = {
            title: q.title as string,
            sample_answer: q.sample_answer as string | null,
            bonus_tip: q.bonus_tip as string | null,
            common_pitfalls: q.common_pitfalls as string | null,
            official_source: q.official_source as string | null,
            category_name: (q.categories as { name: string } | null)?.name ?? null,
          };
        });
        setQuestionContents(map);
      }
    };

    fetchLinkedData();
  }, [cards]);

  // Derived: default to user answer if available, otherwise sample
  const answerSource = useMemo(() => {
    if (answerSourceOverride) return answerSourceOverride;
    if (currentCard?.question_id && userAnswers[currentCard.question_id]) {
      return "user";
    }
    return "sample";
  }, [answerSourceOverride, currentCard, userAnswers]);

  const handleRate = useCallback(
    async (quality: ReviewQuality) => {
      if (!currentCard) return;

      const srsResult = calculateSRS(
        {
          difficulty: currentCard.difficulty,
          interval: currentCard.interval,
          repetitions: currentCard.repetitions,
          next_review: currentCard.next_review,
        },
        quality
      );

      // Update card in database
      const supabase = createClient();
      await supabase
        .from("flashcards")
        .update({
          difficulty: srsResult.difficulty,
          interval: srsResult.interval,
          repetitions: srsResult.repetitions,
          next_review: srsResult.next_review,
        })
        .eq("id", currentCard.id);

      setReviewed((r) => r + 1);
      if (quality >= 3) setCorrect((c) => c + 1);
      setFlipped(false);
      setShowAIReview(false);
      setAnswerSourceOverride(null);

      // Small delay for transition
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 200);
    },
    [currentCard]
  );

  // Get the content to display on the back of the card
  const getBackContent = (): string => {
    if (!currentCard) return "";

    const qId = currentCard.question_id;
    if (!qId) return currentCard.back; // Standalone card

    if (answerSource === "user" && userAnswers[qId]) {
      return userAnswers[qId];
    }

    // Sample answer from questions table, fallback to card.back
    const qContent = questionContents[qId];
    return qContent?.sample_answer || currentCard.back;
  };

  // Check if current card has linked question data
  const hasLinkedQuestion = currentCard?.question_id && questionContents[currentCard.question_id];
  const hasUserAnswer = currentCard?.question_id && userAnswers[currentCard.question_id];
  const hasSampleAnswer =
    currentCard?.question_id &&
    questionContents[currentCard.question_id]?.sample_answer;

  // Enhanced content from the linked question
  const bonusTip = hasLinkedQuestion
    ? questionContents[currentCard.question_id!]?.bonus_tip
    : null;
  const commonPitfalls = hasLinkedQuestion
    ? questionContents[currentCard.question_id!]?.common_pitfalls
    : null;
  const officialSource = hasLinkedQuestion
    ? questionContents[currentCard.question_id!]?.official_source
    : null;
  const categoryName = hasLinkedQuestion
    ? questionContents[currentCard.question_id!]?.category_name
    : null;

  // Can AI review? Need both user answer and sample answer
  const canReview = hasUserAnswer && hasSampleAnswer;

  // Navigate to the question in explore page
  const goToQuestion = useCallback(() => {
    if (!currentCard?.question_id) return;
    router.push(`/explore?question=${currentCard.question_id}`);
  }, [currentCard, router]);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center space-y-5 sm:space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Hoàn thành!</h2>
          <p className="mt-2 text-muted-foreground">
            Bạn đã ôn tập <strong>{reviewed}</strong> thẻ
          </p>
        </div>
        <div className="flex gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{correct}</div>
            <div className="text-xs text-muted-foreground">Đúng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-400">
              {reviewed - correct}
            </div>
            <div className="text-xs text-muted-foreground">Cần ôn lại</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gradient">
              {reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Chính xác</div>
          </div>
        </div>
        <Button onClick={onComplete} variant="outline" className="w-full sm:w-auto h-10 sm:h-9">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold truncate">{deckTitle}</h2>
          <p className="text-sm text-muted-foreground">
            Thẻ {currentIndex + 1} / {cards.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {categoryName && (
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
              {categoryName}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            ✅ {correct} / {reviewed} đúng
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#00AAFF]"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIndex + 1) / cards.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ===== FLASHCARD ===== */}
      <div className="perspective-1000 mx-auto w-full">
        <motion.div
          className="relative cursor-pointer"
          onClick={() => !flipped && setFlipped(true)}
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={flipped ? "back" : "front"}
              initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!flipped ? (
                /* ===== FRONT SIDE ===== */
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm min-h-[220px] sm:min-h-[280px]">
                  <CardContent className="p-5 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[280px]">
                    <Badge variant="outline" className="mb-4 text-xs">
                      Câu hỏi
                    </Badge>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentCard.front}
                      </ReactMarkdown>
                    </div>
                    <p className="mt-6 text-xs text-muted-foreground animate-pulse">
                      Nhấn để xem câu trả lời
                    </p>
                  </CardContent>
                </Card>
              ) : (
                /* ===== BACK SIDE — REDESIGNED ===== */
                <div className="space-y-3">
                  {/* Answer source toggle card */}
                  {hasLinkedQuestion && (hasUserAnswer || hasSampleAnswer) ? (
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                      {/* Tab toggle header */}
                      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-0">
                        <Tabs
                          value={answerSource}
                          onValueChange={(v) => setAnswerSourceOverride(v as "sample" | "user")}
                          className="w-full"
                        >
                          <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/50">
                            <TabsTrigger
                              value="sample"
                              className="text-xs gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              Đáp án mẫu
                            </TabsTrigger>
                            <TabsTrigger
                              value="user"
                              disabled={!hasUserAnswer}
                              className="text-xs gap-1.5 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-500"
                            >
                              <User className="h-3.5 w-3.5" />
                              {hasUserAnswer ? "Câu trả lời của tôi" : "Chưa có câu trả lời"}
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Source indicator bar */}
                      <div className="px-3 sm:px-4 py-2">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                            answerSource === "user"
                              ? "bg-violet-500/8 text-violet-500 border border-violet-500/15"
                              : "bg-emerald-500/8 text-emerald-500 border border-emerald-500/15"
                          )}
                        >
                          {answerSource === "user" ? (
                            <>
                              <User className="h-3 w-3" />
                              Đang xem câu trả lời của bạn
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Đang xem đáp án mẫu
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Answer content */}
                      <div className="px-3 sm:px-4 py-3 sm:py-4 max-h-[240px] sm:max-h-[320px] overflow-y-auto scrollbar-thin">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={markdownComponents}
                        >
                          {getBackContent()}
                        </ReactMarkdown>
                      </div>

                      {/* Action footer */}
                      <Separator />
                      <div className="px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2 bg-muted/20">
                        {/* AI Review button */}
                        {canReview && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] gap-1 border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAIReview(true);
                            }}
                          >
                            <Bot className="h-3 w-3" />
                            AI Review
                          </Button>
                        )}

                        {/* Go to question */}
                        {currentCard?.question_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToQuestion();
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Xem câu hỏi gốc
                          </Button>
                        )}

                        {/* Add/edit your answer */}
                        {!hasUserAnswer && currentCard?.question_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] gap-1 border-violet-500/30 text-violet-500 hover:bg-violet-500/10 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToQuestion();
                            }}
                          >
                            <PenLine className="h-3 w-3" />
                            Thêm câu trả lời của bạn
                          </Button>
                        )}
                      </div>
                    </Card>
                  ) : (
                    /* Standalone card (no linked question) */
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm min-h-[220px] sm:min-h-[280px]">
                      <CardContent className="p-5 sm:p-8 flex flex-col min-h-[220px] sm:min-h-[280px]">
                        <Badge variant="outline" className="mb-4 text-xs w-fit mx-auto">
                          Câu trả lời
                        </Badge>
                        <div className="flex-1 max-h-[200px] sm:max-h-[260px] overflow-y-auto scrollbar-thin">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={markdownComponents}
                          >
                            {getBackContent()}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* ===== ENHANCED CONTENT SECTIONS ===== */}
                  {hasLinkedQuestion && answerSource === "sample" && (
                    <AnimatePresence>
                      {/* Bonus Tip */}
                      {bonusTip && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <Card className="border-amber-500/25 bg-amber-500/5 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500/8 border-b border-amber-500/15">
                              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15">
                                <Flame className="h-3 w-3 text-amber-500" />
                              </div>
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                Bonus Tip
                              </span>
                            </div>
                            <div className="px-3 sm:px-4 py-3 max-h-[140px] overflow-y-auto scrollbar-thin">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={markdownComponents}
                              >
                                {bonusTip}
                              </ReactMarkdown>
                            </div>
                          </Card>
                        </motion.div>
                      )}

                      {/* Common Pitfalls */}
                      {commonPitfalls && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <Card className="border-red-500/25 bg-red-500/5 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-red-500/8 border-b border-red-500/15">
                              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500/15">
                                <ShieldAlert className="h-3 w-3 text-red-500" />
                              </div>
                              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                Lỗi thường gặp
                              </span>
                            </div>
                            <div className="px-3 sm:px-4 py-3 max-h-[140px] overflow-y-auto scrollbar-thin">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={markdownComponents}
                              >
                                {commonPitfalls}
                              </ReactMarkdown>
                            </div>
                          </Card>
                        </motion.div>
                      )}

                      {/* Official Source */}
                      {officialSource && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <a
                            href={officialSource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 rounded-xl border border-blue-500/25 bg-blue-500/5 px-3 sm:px-4 py-2.5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 shrink-0 group-hover:bg-blue-500/25 transition-colors">
                              <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                📚 Tài liệu tham khảo
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {officialSource}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* User answer encouragement when viewing sample & no user answer */}
                  {hasLinkedQuestion && !hasUserAnswer && answerSource === "sample" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToQuestion();
                        }}
                        className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-violet-500/25 bg-violet-500/5 px-3 sm:px-4 py-3 hover:border-violet-500/40 hover:bg-violet-500/8 transition-all text-left group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 shrink-0 group-hover:bg-violet-500/20 transition-colors">
                          <Lightbulb className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                            💡 Viết câu trả lời của riêng bạn
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Tự viết câu trả lời giúp ghi nhớ tốt hơn 3x. Bấm để bắt đầu viết.
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-violet-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Rating buttons — show only when flipped */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-3"
          >
            <p className="text-center text-sm text-muted-foreground">
              Bạn nhớ câu trả lời tốt thế nào?
            </p>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:justify-center gap-2">
              {([0, 1, 2, 3, 4, 5] as ReviewQuality[]).map((q) => {
                const { label, emoji } = qualityLabels[q];
                return (
                  <Button
                    key={q}
                    variant={q >= 3 ? "default" : "outline"}
                    size="default"
                    onClick={() => handleRate(q)}
                    className={cn(
                      "h-9 sm:h-8 text-xs sm:text-sm px-2 sm:px-3",
                      q >= 3
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        : q <= 1
                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : ""
                    )}
                  >
                    {emoji} {label}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Review Sheet */}
      {showAIReview && currentCard?.question_id && (
        <AIReviewSheet
          userAnswer={userAnswers[currentCard.question_id] || ""}
          sampleAnswer={
            questionContents[currentCard.question_id]?.sample_answer || ""
          }
          questionTitle={
            questionContents[currentCard.question_id]?.title || currentCard.front
          }
          onClose={() => setShowAIReview(false)}
        />
      )}
    </div>
  );
}
