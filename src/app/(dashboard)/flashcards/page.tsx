import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FlashcardsPage() {
  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="text-gradient">Flashcards</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ôn tập với hệ thống Spaced Repetition thông minh.
          </p>
        </div>
        <Button size="sm" className="glow-blue">
          <Plus className="mr-1 h-4 w-4" />
          Tạo bộ mới
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 mb-4">
          <Brain className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold">Chưa có bộ flashcard nào</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Tạo bộ flashcard đầu tiên để bắt đầu ôn tập với hệ thống Spaced
          Repetition. Giúp ghi nhớ lâu dài hơn gấp 3 lần.
        </p>
        <Button variant="outline" className="mt-6" size="sm">
          <Sparkles className="mr-1 h-4 w-4" />
          Tạo bộ flashcard
        </Button>
      </div>
    </div>
  );
}
