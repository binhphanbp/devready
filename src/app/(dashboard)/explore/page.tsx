"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/explore/QuestionCard";
import { QuestionDetail } from "@/components/explore/QuestionDetail";
import {
  Search,
  X,
  BookOpen,
  SlidersHorizontal,
  ArrowUpDown,
  Code2,
  Server,
  Database,
  Cloud,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  title: string;
  content: string;
  difficulty: string;
  tech_tags: string[];
  company_tags: string[];
  view_count: number;
  bookmark_count: number;
  categories: { name: string; color: string } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
};

// Tech stacks mapped to categories
const techStacksByCategory: Record<string, string[]> = {
  frontend: ["JavaScript", "TypeScript", "React", "Vue", "Angular", "Next.js", "HTML/CSS", "Responsive", "Hooks", "ES6", "RSC", "Performance"],
  backend: ["Node.js", "Java", "Python", "C#", ".NET", "Spring Boot", "Express", "FastAPI", "Django", "REST", "GraphQL", "API Design", "Microservices", "Architecture", "Go"],
  database: ["SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "NoSQL", "Database Design", "Caching", "Transactions", "Performance"],
  devops: ["Docker", "Kubernetes", "CI/CD", "AWS", "Cloud", "Azure", "Linux", "Git", "GitHub", "Shell", "GitHub Actions", "Workflow"],
  "soft-skills": ["Behavioral", "STAR", "Communication", "Teamwork", "Leadership", "Interview", "Time Management", "Productivity", "Agile", "Project Management"],
};

const categoryIcons: Record<string, typeof Code2> = {
  frontend: Code2,
  backend: Server,
  database: Database,
  devops: Cloud,
  "soft-skills": MessageCircle,
};

const difficulties = [
  { value: "intern", label: "Intern", className: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20" },
  { value: "fresher", label: "Fresher", className: "bg-teal-500/10 text-teal-500 dark:text-teal-400 border-teal-500/20" },
  { value: "junior", label: "Junior", className: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20" },
  { value: "middle", label: "Middle", className: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20" },
  { value: "senior", label: "Senior", className: "bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20" },
];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Xem nhiều" },
  { value: "bookmarked", label: "Lưu nhiều" },
];

export default function ExplorePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const supabase = createClient();

  // Get the selected category slug for tech stack filtering
  const selectedCategorySlug = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory)?.slug ?? null;
  }, [selectedCategory, categories]);

  // Available tech stacks based on selected category
  const availableTechStacks = useMemo(() => {
    if (!selectedCategorySlug) return [];
    return techStacksByCategory[selectedCategorySlug] ?? [];
  }, [selectedCategorySlug]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug, color, icon")
      .order("sort_order")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  // Clear tech tags when category changes
  useEffect(() => {
    setSelectedTechTags([]);
  }, [selectedCategory]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let query = supabase
        .from("questions")
        .select(
          "id, title, content, difficulty, tech_tags, company_tags, view_count, bookmark_count, categories(name, color)"
        )
        .eq("is_approved", true);

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      if (selectedDifficulty) {
        query = query.eq("difficulty", selectedDifficulty);
      }
      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }
      if (selectedTechTags.length > 0) {
        query = query.overlaps("tech_tags", selectedTechTags);
      }

      // Sort
      switch (sortBy) {
        case "popular":
          query = query.order("view_count", { ascending: false });
          break;
        case "bookmarked":
          query = query.order("bookmark_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data } = await query.limit(50);
      setQuestions((data as unknown as Question[]) ?? []);
      setLoading(false);
    };

    const debounce = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedCategory, selectedDifficulty, selectedTechTags, sortBy]);

  const toggleTechTag = (tag: string) => {
    setSelectedTechTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTechTags([]);
    setSelectedDifficulty(null);
    setSortBy("newest");
    setSearch("");
  };

  const hasFilters =
    selectedCategory || selectedDifficulty || search || selectedTechTags.length > 0 || sortBy !== "newest";

  // If a question is selected, show detail panel
  if (selectedQuestion) {
    return (
      <QuestionDetail
        question={selectedQuestion}
        onBack={() => setSelectedQuestion(null)}
      />
    );
  }

  return (
    <div className="space-y-5 pt-8 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Khám phá <span className="text-gradient">câu hỏi phỏng vấn</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          {questions.length > 0
            ? `${questions.length} câu hỏi • Lọc theo danh mục, tech stack và cấp độ`
            : "Tìm kiếm và luyện tập với hàng trăm câu hỏi từ các công ty IT Việt Nam."}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm câu hỏi... (ví dụ: React hooks, SQL join, Docker...)"
          className="pl-9 h-11 bg-card/50 border-border/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-border/50 bg-card/30 p-4">
        {/* Row 1: Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 w-16">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Danh mục
          </span>
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50"
            )}
            onClick={() => setSelectedCategory(null)}
          >
            Tất cả
          </Badge>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] ?? BookOpen;
            return (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )
                }
              >
                <Icon className="h-3 w-3 mr-1" />
                {cat.name}
              </Badge>
            );
          })}
        </div>

        {/* Row 2: Tech Stack (dynamic) */}
        {availableTechStacks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 w-16">
              <Code2 className="h-3.5 w-3.5" />
              Tech
            </span>
            {availableTechStacks.map((tech) => (
              <Badge
                key={tech}
                variant={selectedTechTags.includes(tech) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors text-xs",
                  selectedTechTags.includes(tech)
                    ? "bg-[#0066FF] text-white border-[#0066FF]"
                    : "hover:bg-muted/50 border-dashed"
                )}
                onClick={() => toggleTechTag(tech)}
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Row 3: Difficulty */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 w-16">
            📊 Cấp độ
          </span>
          <Badge
            variant={!selectedDifficulty ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors text-xs",
              !selectedDifficulty
                ? "bg-primary/10 text-primary border-primary/20"
                : "hover:bg-muted/50"
            )}
            onClick={() => setSelectedDifficulty(null)}
          >
            Tất cả
          </Badge>
          {difficulties.map((d) => (
            <Badge
              key={d.value}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors text-xs",
                selectedDifficulty === d.value
                  ? d.className + " font-medium"
                  : "hover:bg-muted/50"
              )}
              onClick={() =>
                setSelectedDifficulty(
                  selectedDifficulty === d.value ? null : d.value
                )
              }
            >
              {d.label}
            </Badge>
          ))}
        </div>

        {/* Row 4: Sort + Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 w-16">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sắp xếp
            </span>
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md transition-colors",
                  sortBy === opt.value
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-7 px-2 text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border/50 bg-card/50 animate-pulse"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">
              Không tìm thấy câu hỏi nào
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị <strong>{questions.length}</strong> câu hỏi
                {selectedCategory &&
                  categories.find((c) => c.id === selectedCategory) &&
                  ` trong ${categories.find((c) => c.id === selectedCategory)?.name}`}
              </p>
            </div>
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onClick={() => setSelectedQuestion(q)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
