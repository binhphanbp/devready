"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Bot, User, BookOpen } from "lucide-react";
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

export function StudyMode({ cards, deckTitle, onComplete }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);

  // New state for answer sources
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

      // Fetch question sample_answers
      const { data: questions } = await supabase
        .from("questions")
        .select("id, title, sample_answer")
        .in("id", questionIds);

      if (questions) {
        const map: Record<string, QuestionContent> = {};
        questions.forEach((q: { id: string; title: string; sample_answer: string | null }) => {
          map[q.id] = { title: q.title, sample_answer: q.sample_answer };
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

  // Can AI review? Need both user answer and sample answer
  const canReview = hasUserAnswer && hasSampleAnswer;

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
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold truncate">{deckTitle}</h2>
          <p className="text-sm text-muted-foreground">
            Thẻ {currentIndex + 1} / {cards.length}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          ✅ {correct} / {reviewed} đúng
        </Badge>
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

      {/* Flashcard */}
      <div className="perspective-1000 mx-auto sm:max-w-lg">
        <motion.div
          className="relative cursor-pointer min-h-[220px] sm:min-h-[300px]"
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
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm min-h-[220px] sm:min-h-[300px]">
                <CardContent className="p-5 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[300px]">
                  {!flipped ? (
                    /* ===== FRONT SIDE ===== */
                    <>
                      <Badge variant="outline" className="mb-4 text-xs">
                        Câu hỏi
                      </Badge>
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {currentCard.front}
                        </ReactMarkdown>
                      </div>
                      <p className="mt-6 text-xs text-muted-foreground">
                        Nhấn để xem câu trả lời
                      </p>
                    </>
                  ) : (
                    /* ===== BACK SIDE ===== */
                    <div className="w-full text-left">
                      {/* Answer source toggle — only for linked questions */}
                      {hasLinkedQuestion && (hasUserAnswer || hasSampleAnswer) ? (
                        <div className="mb-4 flex flex-col items-center gap-3">
                          <Tabs
                            value={answerSource}
                            onValueChange={(v) => setAnswerSourceOverride(v as "sample" | "user")}
                            className="w-full"
                          >
                            <TabsList className="grid grid-cols-2 w-full h-9 bg-muted/50">
                              <TabsTrigger
                                value="sample"
                                className="text-xs gap-1.5 data-[state=active]:bg-[#0066FF]/10 data-[state=active]:text-[#0066FF]"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                Đáp án mẫu
                              </TabsTrigger>
                              <TabsTrigger
                                value="user"
                                disabled={!hasUserAnswer}
                                className="text-xs gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
                              >
                                <User className="h-3.5 w-3.5" />
                                Câu trả lời của tôi
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>

                          {/* Active source badge */}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              answerSource === "user"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20"
                            )}
                          >
                            {answerSource === "user" ? (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                Câu trả lời của bạn
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-3 w-3 mr-1" />
                                Đáp án mẫu
                              </>
                            )}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="mb-4 text-xs mx-auto block w-fit">
                          Câu trả lời
                        </Badge>
                      )}

                      {/* Answer content */}
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none max-h-[200px] sm:max-h-[240px] overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {getBackContent()}
                        </ReactMarkdown>
                      </div>

                      {/* AI Review button */}
                      {canReview && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 flex justify-center"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/10 hover:text-[#0066FF]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAIReview(true);
                            }}
                          >
                            <Bot className="h-3.5 w-3.5" />
                            Review câu trả lời
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
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
