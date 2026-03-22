"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/explore/QuestionCard";
import { QuestionDrawer } from "@/components/explore/QuestionDrawer";
import { Search, Filter, X, BookOpen } from "lucide-react";
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
};

const difficulties = [
  { value: "intern", label: "Intern", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "junior", label: "Junior", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "senior", label: "Senior", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
];

export default function ExplorePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Fetch categories
    supabase
      .from("categories")
      .select("id, name, slug, color")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let query = supabase
        .from("questions")
        .select("id, title, content, difficulty, tech_tags, company_tags, view_count, bookmark_count, categories(name, color)")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      if (selectedDifficulty) {
        query = query.eq("difficulty", selectedDifficulty);
      }
      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data } = await query.limit(50);
      setQuestions((data as unknown as Question[]) ?? []);
      setLoading(false);
    };

    const debounce = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedCategory, selectedDifficulty]);

  const handleOpenQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setDrawerOpen(true);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearch("");
  };

  const hasFilters = selectedCategory || selectedDifficulty || search;

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Khám phá <span className="text-gradient">câu hỏi phỏng vấn</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tìm kiếm và luyện tập với hàng trăm câu hỏi từ các công ty IT Việt Nam.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm câu hỏi..."
          className="pl-9 h-11 bg-card/50 border-border/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {categories.map((cat) => (
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
              {cat.name}
            </Badge>
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Cấp độ:</span>
          {difficulties.map((d) => (
            <Badge
              key={d.value}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors",
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
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-6 px-2"
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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border/50 bg-card/50 animate-pulse"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              Không tìm thấy câu hỏi nào. Hãy thử thay đổi bộ lọc.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {questions.length} câu hỏi
            </p>
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onClick={() => handleOpenQuestion(q)}
              />
            ))}
          </>
        )}
      </div>

      {/* Drawer */}
      <QuestionDrawer
        question={selectedQuestion}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
