"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookmarkIcon,
  Share2,
  Eye,
  Building2,
  Tag,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  Bot,
  Bookmark,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface QuestionDetailProps {
  question: {
    id: string;
    title: string;
    content: string;
    difficulty: string;
    tech_tags: string[];
    company_tags: string[];
    view_count: number;
    bookmark_count: number;
    categories?: { name: string; color: string } | null;
  };
  onBack: () => void;
}

type Answer = {
  id: string;
  content: string;
  is_official: boolean;
  upvote_count: number;
  author_id: string | null;
  created_at: string;
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  intern: {
    label: "Intern",
    className: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
  },
  fresher: {
    label: "Fresher",
    className: "bg-teal-500/10 text-teal-500 dark:text-teal-400 border-teal-500/20",
  },
  junior: {
    label: "Junior",
    className: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20",
  },
  middle: {
    label: "Middle",
    className: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
  },
  senior: {
    label: "Senior",
    className: "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20",
  },
};

const proseClasses = "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-a:text-primary prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground prose-li:text-muted-foreground";

export function QuestionDetail({ question, onBack }: QuestionDetailProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(true);

  const diff = difficultyConfig[question.difficulty] ?? difficultyConfig.intern;

  useEffect(() => {
    const fetchAnswers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", question.id)
        .order("is_official", { ascending: false })
        .order("upvote_count", { ascending: false });

      setAnswers((data as Answer[]) ?? []);
      setLoadingAnswers(false);
    };

    fetchAnswers();
  }, [question.id]);

  const officialAnswer = answers.find((a) => a.is_official);

  return (
    <div className="space-y-6 pt-8 lg:pt-0 pb-8">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {question.categories && (
            <Badge variant="secondary" className="text-xs">
              {question.categories.name}
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-xs", diff.className)}>
            {diff.label}
          </Badge>
        </div>
      </div>

      {/* Question Section */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6 sm:p-8">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-4">
            {question.title}
          </h1>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {question.view_count.toLocaleString()} lượt xem
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              {question.bookmark_count} đã lưu
            </span>
            {answers.length > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {answers.length} câu trả lời
              </span>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Question content */}
          <article className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {question.content}
            </ReactMarkdown>
          </article>

          {/* Tags */}
          <div className="mt-6 space-y-3">
            {question.tech_tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {question.tech_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {question.company_tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {question.company_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted/50 border border-border/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <BookmarkIcon className="mr-1.5 h-3.5 w-3.5" />
              Lưu câu hỏi
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Chia sẻ
            </Button>
            <Button variant="outline" size="sm">
              <Bot className="mr-1.5 h-3.5 w-3.5" />
              Hỏi ReadyBot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Answer Section */}
      <div className="space-y-4">
        {/* Toggle answer button */}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={cn(
            "w-full flex items-center justify-between rounded-xl border-2 border-dashed p-4 transition-all",
            showAnswer
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                showAnswer ? "bg-emerald-500/10" : "bg-primary/10"
              )}
            >
              <Lightbulb
                className={cn(
                  "h-4.5 w-4.5",
                  showAnswer ? "text-emerald-500" : "text-primary"
                )}
              />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">
                {showAnswer ? "Câu trả lời mẫu" : "💡 Đã suy nghĩ xong? Xem câu trả lời"}
              </p>
              <p className="text-xs text-muted-foreground">
                {showAnswer
                  ? "Đối chiếu với câu trả lời của bạn"
                  : "Hãy tự trả lời trước khi xem đáp án"}
              </p>
            </div>
          </div>
          {showAnswer ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Answer content */}
        {showAnswer && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {loadingAnswers ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-6">
                  <div className="h-32 animate-pulse bg-muted/50 rounded-lg" />
                </CardContent>
              </Card>
            ) : officialAnswer ? (
              <Card className="border-emerald-500/20 bg-card/50">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-500">
                      Câu trả lời mẫu (Official)
                    </span>
                  </div>
                  <article className={proseClasses}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {officialAnswer.content}
                    </ReactMarkdown>
                  </article>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Chưa có câu trả lời mẫu cho câu hỏi này.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Bot className="mr-1.5 h-3.5 w-3.5" />
                    Hỏi ReadyBot để nhận gợi ý
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
