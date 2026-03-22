"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookmarkIcon, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    difficulty: string;
    tech_tags: string[];
    company_tags: string[];
    view_count: number;
    bookmark_count: number;
    categories?: { name: string; color: string } | null;
  };
  onClick?: () => void;
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  intern: { label: "Intern", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  junior: { label: "Junior", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  senior: { label: "Senior", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
};

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const diff = difficultyConfig[question.difficulty] ?? difficultyConfig.intern;

  return (
    <Card
      className="group cursor-pointer border-border/50 bg-card/50 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Category & Difficulty */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {question.categories && (
                <Badge variant="secondary" className="text-xs">
                  {question.categories.name}
                </Badge>
              )}
              <Badge variant="outline" className={cn("text-xs", diff.className)}>
                {diff.label}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {question.title}
            </h3>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {question.tech_tags?.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {question.view_count}
              </span>
              <span className="flex items-center gap-1">
                <BookmarkIcon className="h-3 w-3" />
                {question.bookmark_count}
              </span>
              {question.company_tags?.[0] && (
                <span className="hidden sm:inline">
                  📍 {question.company_tags[0]}
                  {question.company_tags.length > 1 &&
                    ` +${question.company_tags.length - 1}`}
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
