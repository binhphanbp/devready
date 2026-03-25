"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookmarkIcon, Share2, Eye, Building2, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.min.css";
import { cn } from "@/lib/utils";

interface QuestionDrawerProps {
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
  } | null;
  open: boolean;
  onClose: () => void;
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  intern: { label: "Intern", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  junior: { label: "Junior", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  senior: { label: "Senior", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
};

export function QuestionDrawer({ question, open, onClose }: QuestionDrawerProps) {
  if (!question) return null;
  const diff = difficultyConfig[question.difficulty] ?? difficultyConfig.intern;

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left px-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {question.categories && (
              <Badge variant="secondary">{question.categories.name}</Badge>
            )}
            <Badge variant="outline" className={cn(diff.className)}>
              {diff.label}
            </Badge>
          </div>
          <DrawerTitle className="text-xl leading-snug">
            {question.title}
          </DrawerTitle>
          <DrawerDescription className="flex items-center gap-4 text-xs mt-2">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {question.view_count} lượt xem
            </span>
            <span className="flex items-center gap-1">
              <BookmarkIcon className="h-3 w-3" /> {question.bookmark_count} đã lưu
            </span>
          </DrawerDescription>
        </DrawerHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* Tags */}
          {(question.tech_tags?.length > 0 || question.company_tags?.length > 0) && (
            <div className="mb-6 space-y-3">
              {question.tech_tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {question.tech_tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-primary/5 border border-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {question.company_tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  {question.company_tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Markdown content */}
          <article className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-a:text-primary prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {question.content}
            </ReactMarkdown>
          </article>
        </ScrollArea>

        <Separator />

        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <BookmarkIcon className="mr-1 h-3.5 w-3.5" />
              Lưu lại
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="mr-1 h-3.5 w-3.5" />
              Chia sẻ
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
