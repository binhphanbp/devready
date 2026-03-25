"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Clock,
  MessageSquareText,
  Zap,
  Brain,
  BookmarkCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.min.css";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AddToFlashcardDialog } from "./AddToFlashcardDialog";

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

const difficultyConfig: Record<
  string,
  { label: string; className: string; bgClassName: string; level: number }
> = {
  intern: {
    label: "Intern",
    className: "text-emerald-500 dark:text-emerald-400",
    bgClassName: "bg-emerald-500/10 border-emerald-500/20",
    level: 1,
  },
  fresher: {
    label: "Fresher",
    className: "text-teal-500 dark:text-teal-400",
    bgClassName: "bg-teal-500/10 border-teal-500/20",
    level: 2,
  },
  junior: {
    label: "Junior",
    className: "text-blue-500 dark:text-blue-400",
    bgClassName: "bg-blue-500/10 border-blue-500/20",
    level: 3,
  },
  middle: {
    label: "Middle",
    className: "text-amber-500 dark:text-amber-400",
    bgClassName: "bg-amber-500/10 border-amber-500/20",
    level: 4,
  },
  senior: {
    label: "Senior",
    className: "text-orange-500 dark:text-orange-400",
    bgClassName: "bg-orange-500/10 border-orange-500/20",
    level: 5,
  },
};

// Markdown components for rich rendering
const markdownComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-xl font-bold text-foreground mt-6 mb-3 pb-2 border-b border-border/50"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-lg font-semibold text-foreground mt-5 mb-2.5 flex items-center gap-2"
      {...props}
    >
      <span className="w-1 h-5 rounded-full bg-primary inline-block" />
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-base font-semibold text-foreground mt-4 mb-2"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-sm leading-relaxed text-muted-foreground mb-3" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="space-y-1.5 mb-4 ml-1 text-sm text-muted-foreground"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="space-y-1.5 mb-4 ml-1 text-sm text-muted-foreground list-decimal list-inside"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-2 text-sm" {...props}>
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
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
          className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[13px] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    // Code inside <pre> — force light text on dark bg
    return (
      <code
        className={cn("text-[13px] font-mono text-[#e6edf3]", className)}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mb-4 rounded-xl border border-border/50 bg-[#0d1117] p-4 overflow-x-auto text-[13px] leading-relaxed text-[#e6edf3] [&_code]:text-[#e6edf3] [&_.hljs-comment]:text-[#8b949e] [&_.hljs-keyword]:text-[#ff7b72] [&_.hljs-string]:text-[#a5d6ff] [&_.hljs-number]:text-[#79c0ff] [&_.hljs-function]:text-[#d2a8ff]"
      {...props}
    >
      {children}
    </pre>
  ),
  strong: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-3 border-primary/40 pl-4 py-1 my-3 bg-primary/5 rounded-r-lg"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-3 py-2 text-left font-medium text-foreground bg-muted/50 border-b border-border/50"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-3 py-2 text-muted-foreground border-b border-border/30"
      {...props}
    >
      {children}
    </td>
  ),
};

export function QuestionDetail({ question, onBack }: QuestionDetailProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);

  const diff = difficultyConfig[question.difficulty] ?? difficultyConfig.intern;

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      // Fetch answers
      const { data } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", question.id)
        .order("is_official", { ascending: false })
        .order("upvote_count", { ascending: false });
      setAnswers((data as Answer[]) ?? []);
      setLoadingAnswers(false);

      // Check bookmark status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: bm } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", user.id)
          .eq("question_id", question.id)
          .maybeSingle();
        setIsBookmarked(!!bm);
      }
    };
    fetchData();
  }, [question.id]);

  // Record view + update streak when user views the answer
  const recordView = useCallback(async () => {
    if (viewRecorded) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.rpc("record_question_view", { p_question_id: question.id });
    setViewRecorded(true);
  }, [question.id, viewRecorded]);

  // Toggle bookmark
  const toggleBookmark = async () => {
    setBookmarkLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBookmarkLoading(false); return; }

    if (isBookmarked) {
      await supabase.from("bookmarks").delete()
        .eq("user_id", user.id).eq("question_id", question.id);
      setIsBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id, question_id: question.id,
      });
      setIsBookmarked(true);
    }
    setBookmarkLoading(false);
  };

  const officialAnswer = answers.find((a) => a.is_official);

  // Difficulty level bar
  const DifficultyBar = () => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-5 rounded-full transition-colors",
            i <= diff.level ? "bg-current" : "bg-muted/50"
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-5 pt-8 lg:pt-0 pb-8 max-w-4xl">
      {/* Top bar navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8", isBookmarked && "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400")}
            onClick={toggleBookmark}
            disabled={bookmarkLoading}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <BookmarkIcon className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isBookmarked ? "Đã lưu" : "Lưu"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
            onClick={() => setFlashcardOpen(true)}
          >
            <Brain className="h-3.5 w-3.5 mr-1.5" />
            Flashcard
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* ===== QUESTION CARD ===== */}
      <div className="rounded-2xl border border-border/50 bg-card/80 overflow-hidden">
        {/* Question header bar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3.5 bg-muted/30 border-b border-border/40">
          {question.categories && (
            <Badge
              variant="secondary"
              className="font-medium"
            >
              {question.categories.name}
            </Badge>
          )}
          <div className={cn("flex items-center gap-2 text-xs font-medium", diff.className)}>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", diff.bgClassName, diff.className)}
            >
              {diff.label}
            </Badge>
            <DifficultyBar />
          </div>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {question.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="h-3 w-3" /> {question.bookmark_count}
            </span>
            {answers.length > 0 && (
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="h-3 w-3" /> {answers.length} đáp án
              </span>
            )}
          </div>
        </div>

        {/* Question title */}
        <div className="px-6 pt-5 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
            {question.title}
          </h1>
        </div>

        <Separator />

        {/* Question body — structured content */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquareText className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Nội dung câu hỏi
            </h2>
          </div>
          <div className="pl-9">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {question.content}
            </ReactMarkdown>
          </div>
        </div>

        <Separator />

        {/* Tags & companies */}
        <div className="px-6 py-4 space-y-3 bg-muted/20">
          {question.tech_tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {question.tech_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-primary/8 border border-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
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
                  className="rounded-lg bg-muted/60 border border-border/50 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== PRACTICE PROMPT ===== */}
      <div className="rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
            <Zap className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              💡 Mẹo luyện tập
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hãy tự trả lời câu hỏi bằng cách nói to hoặc viết ra trước khi xem đáp án.
              Điều này giúp bạn nhớ lâu hơn và phát hiện lỗ hổng kiến thức.
            </p>
          </div>
        </div>
      </div>

      {/* ===== ANSWER TOGGLE ===== */}
      <button
        onClick={() => {
          if (!showAnswer) recordView();
          setShowAnswer(!showAnswer);
        }}
        className={cn(
          "w-full flex items-center justify-between rounded-2xl border-2 p-5 transition-all duration-300",
          showAnswer
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              showAnswer ? "bg-emerald-500/10" : "bg-primary/10"
            )}
          >
            {showAnswer ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Lightbulb className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">
              {showAnswer ? "Câu trả lời mẫu" : "Xem câu trả lời mẫu"}
            </p>
            <p className="text-xs text-muted-foreground">
              {showAnswer
                ? "So sánh với câu trả lời của bạn"
                : "Bấm để hiện đáp án chi tiết"}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            showAnswer ? "bg-emerald-500/10" : "bg-primary/10"
          )}
        >
          {showAnswer ? (
            <ChevronUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-primary" />
          )}
        </div>
      </button>

      {/* ===== ANSWER CONTENT ===== */}
      {showAnswer && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {loadingAnswers ? (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-8">
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse bg-muted/50 rounded" />
                <div className="h-4 w-full animate-pulse bg-muted/50 rounded" />
                <div className="h-4 w-2/3 animate-pulse bg-muted/50 rounded" />
                <div className="h-24 animate-pulse bg-muted/30 rounded-lg mt-4" />
              </div>
            </div>
          ) : officialAnswer ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-card/80 overflow-hidden">
              {/* Answer header */}
              <div className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500/5 border-b border-emerald-500/15">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Câu trả lời mẫu (Official Answer)
                </span>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  👍 {officialAnswer.upvote_count} lượt thích
                </span>
              </div>
              {/* Answer body */}
              <div className="px-6 py-5">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {officialAnswer.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mx-auto mb-3">
                <MessageSquareText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Chưa có câu trả lời mẫu
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Bạn có thể hỏi ReadyBot AI để nhận gợi ý trả lời
              </p>
              <Button variant="outline" size="sm">
                <Bot className="mr-1.5 h-3.5 w-3.5" />
                Hỏi ReadyBot
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ===== BOTTOM ACTION BAR ===== */}
      <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/30 px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Câu hỏi trước
        </Button>
        <Button variant="outline" size="sm">
          <Bot className="h-4 w-4 mr-1.5" />
          Hỏi ReadyBot về câu hỏi này
        </Button>
      </div>

      {/* AddToFlashcard Dialog */}
      <AddToFlashcardDialog
        open={flashcardOpen}
        onOpenChange={setFlashcardOpen}
        questionTitle={question.title}
        answerContent={officialAnswer?.content ?? ""}
      />
    </div>
  );
}
