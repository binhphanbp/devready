"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import {
  calculateSRS,
  qualityLabels,
  type ReviewQuality,
  type SRSCard,
} from "@/lib/srs";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  interval: number;
  repetitions: number;
  next_review: string;
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

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

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

      // Small delay for transition
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 200);
    },
    [currentCard]
  );

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold">Hoàn thành!</h2>
          <p className="mt-2 text-muted-foreground">
            Bạn đã ôn tập <strong>{reviewed}</strong> thẻ
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{correct}</div>
            <div className="text-xs text-muted-foreground">Đúng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">
              {reviewed - correct}
            </div>
            <div className="text-xs text-muted-foreground">Cần ôn lại</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient">
              {reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Chính xác</div>
          </div>
        </div>
        <Button onClick={onComplete} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{deckTitle}</h2>
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
      <div className="perspective-1000 mx-auto max-w-lg">
        <motion.div
          className="relative cursor-pointer min-h-[300px]"
          onClick={() => setFlipped(!flipped)}
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
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm min-h-[300px]">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <Badge
                    variant="outline"
                    className="mb-4 text-xs"
                  >
                    {flipped ? "Câu trả lời" : "Câu hỏi"}
                  </Badge>
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {flipped ? currentCard.back : currentCard.front}
                    </ReactMarkdown>
                  </div>
                  {!flipped && (
                    <p className="mt-6 text-xs text-muted-foreground">
                      Nhấn để xem câu trả lời
                    </p>
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
            <div className="flex flex-wrap justify-center gap-2">
              {([0, 1, 2, 3, 4, 5] as ReviewQuality[]).map((q) => {
                const { label, emoji } = qualityLabels[q];
                return (
                  <Button
                    key={q}
                    variant={q >= 3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRate(q)}
                    className={
                      q >= 3
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        : q <= 1
                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : ""
                    }
                  >
                    {emoji} {label}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
