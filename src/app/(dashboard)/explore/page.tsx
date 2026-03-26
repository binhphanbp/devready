'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/explore/QuestionCard';
import { QuestionDetail } from '@/components/explore/QuestionDetail';
import {
  Search,
  X,
  BookOpen,
  Code2,
  Server,
  Database,
  Cloud,
  MessageCircle,
  Layers,
  Hash,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

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

const techStacksByCategory: Record<string, string[]> = {
  frontend: [
    'JavaScript',
    'TypeScript',
    'React',
    'Vue',
    'Angular',
    'Next.js',
    'HTML/CSS',
    'TailwindCSS',
    'Bootstrap',
    'Sass/SCSS',
    'Responsive',
    'Hooks',
    'ES6',
    'RSC',
    'Performance',
  ],
  backend: [
    'Node.js',
    'Java',
    'Python',
    'PHP',
    'C#',
    '.NET',
    'Spring Boot',
    'Express',
    'Laravel',
    'FastAPI',
    'Django',
    'REST',
    'GraphQL',
    'API Design',
    'Microservices',
    'Architecture',
    'Go',
  ],
  database: [
    'SQL',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'NoSQL',
    'SQLite',
    'Database Design',
    'Caching',
    'Transactions',
    'Performance',
  ],
  devops: [
    'Docker',
    'Kubernetes',
    'CI/CD',
    'AWS',
    'Cloud',
    'Azure',
    'GCP',
    'Linux',
    'Git',
    'GitHub',
    'Shell',
    'GitHub Actions',
    'Terraform',
  ],
  'soft-skills': [
    'Behavioral',
    'STAR',
    'Communication',
    'Teamwork',
    'Leadership',
    'Interview',
    'Time Management',
    'Productivity',
    'Agile',
    'Project Management',
  ],
};

const categoryMeta: Record<
  string,
  { icon: typeof Code2; color: string; bg: string }
> = {
  frontend: {
    icon: Code2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15',
  },
  backend: {
    icon: Server,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15',
  },
  database: {
    icon: Database,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/15',
  },
  devops: {
    icon: Cloud,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15',
  },
  'soft-skills': {
    icon: MessageCircle,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/15',
  },
};

const difficulties = [
  {
    value: 'intern',
    label: 'Intern',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    value: 'fresher',
    label: 'Fresher',
    color: 'bg-teal-500',
    textColor: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
  {
    value: 'junior',
    label: 'Junior',
    color: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    value: 'middle',
    label: 'Middle',
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    value: 'senior',
    label: 'Senior',
    color: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất', icon: Sparkles },
  { value: 'popular', label: 'Xem nhiều', icon: BarChart3 },
  { value: 'bookmarked', label: 'Lưu nhiều', icon: BookOpen },
];

// ---- Tech Stack Slider Sub-component ----
function TechStackSlider({
  techStacks,
  selectedTechTags,
  toggleTechTag,
}: {
  techStacks: string[];
  selectedTechTags: string[];
  toggleTechTag: (tag: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, techStacks]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const showArrows = canScrollLeft || canScrollRight;

  return (
    <div className="border-b border-border/30 bg-muted/10">
      <div className="flex items-center gap-2 px-5 py-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 shrink-0 pr-3 border-r border-border/50">
          <Hash className="h-3.5 w-3.5" />
          Tech
        </div>

        {/* Scrollable area with gradient edge */}
        <div className="relative flex-1 min-w-0">
          {/* Left gradient fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/60 to-transparent pointer-events-none z-10" />
          )}

          {/* Scrollable tech tags */}
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pr-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {techStacks.map((tech) => {
              const isActive = selectedTechTags.includes(tech);
              return (
                <button
                  key={tech}
                  onClick={() => toggleTechTag(tech)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap shrink-0',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-transparent text-muted-foreground border-dashed border-border/60 hover:border-primary/40 hover:text-foreground hover:bg-primary/5',
                  )}
                >
                  {isActive && <span className="mr-1">✓</span>}
                  {tech}
                </button>
              );
            })}
          </div>

          {/* Right gradient fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/60 to-transparent pointer-events-none z-10" />
          )}
        </div>

        {/* Arrow buttons grouped together */}
        {showArrows && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg border transition-all',
                canScrollLeft
                  ? 'bg-background border-border/60 shadow-sm hover:bg-muted/80 hover:shadow-md text-foreground'
                  : 'bg-muted/30 border-border/30 text-muted-foreground/30 cursor-not-allowed',
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg border transition-all',
                canScrollRight
                  ? 'bg-background border-border/60 shadow-sm hover:bg-muted/80 hover:shadow-md text-foreground'
                  : 'bg-muted/30 border-border/30 text-muted-foreground/30 cursor-not-allowed',
              )}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );
  const [sortBy, setSortBy] = useState('newest');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );

  const supabase = createClient();

  const selectedCategorySlug = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory)?.slug ?? null;
  }, [selectedCategory, categories]);

  const availableTechStacks = useMemo(() => {
    if (!selectedCategorySlug) return [];
    return techStacksByCategory[selectedCategorySlug] ?? [];
  }, [selectedCategorySlug]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug, color, icon')
      .order('sort_order')
      .then(({ data }) => setCategories((data as Category[]) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable
  }, []);

  // Reset tech tags when category changes
  const prevCategory = useRef(selectedCategory);
  useEffect(() => {
    if (prevCategory.current !== selectedCategory) {
      setSelectedTechTags([]);
      prevCategory.current = selectedCategory;
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let query = supabase
        .from('questions')
        .select(
          'id, title, content, difficulty, tech_tags, company_tags, view_count, bookmark_count, categories(name, color)',
        )
        .eq('is_approved', true);

      if (selectedCategory) query = query.eq('category_id', selectedCategory);
      if (selectedDifficulty)
        query = query.eq('difficulty', selectedDifficulty);
      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);
      if (selectedTechTags.length > 0)
        query = query.overlaps('tech_tags', selectedTechTags);

      switch (sortBy) {
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'bookmarked':
          query = query.order('bookmark_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query.limit(50);
      setQuestions((data as unknown as Question[]) ?? []);
      setLoading(false);
    };

    const debounce = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable
  }, [search, selectedCategory, selectedDifficulty, selectedTechTags, sortBy]);

  const toggleTechTag = (tag: string) => {
    setSelectedTechTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTechTags([]);
    setSelectedDifficulty(null);
    setSortBy('newest');
    setSearch('');
  };

  const hasFilters =
    selectedCategory ||
    selectedDifficulty ||
    search ||
    selectedTechTags.length > 0 ||
    sortBy !== 'newest';
  const activeFilterCount = [
    selectedCategory,
    selectedDifficulty,
    search,
    selectedTechTags.length > 0 ? true : null,
    sortBy !== 'newest' ? true : null,
  ].filter(Boolean).length;

  if (selectedQuestion) {
    return (
      <QuestionDetail
        question={selectedQuestion}
        onBack={() => setSelectedQuestion(null)}
      />
    );
  }

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Khám phá <span className="text-gradient">câu hỏi phỏng vấn</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tìm kiếm, lọc và luyện tập với hàng trăm câu hỏi IT thực tế
          </p>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-destructive hover:text-destructive shrink-0"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa lọc ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm câu hỏi... (React hooks, SQL join, Docker...)"
          className="pl-10 h-12 rounded-xl bg-card/60 border-border/50 text-sm focus:ring-2 focus:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ===== FILTER PANEL ===== */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        {/* Category row */}
        <div className="px-5 py-3.5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 shrink-0 pr-3 border-r border-border/50">
              <Layers className="h-3.5 w-3.5" />
              Danh mục
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* All button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  !selectedCategory
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-transparent text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground',
                )}
              >
                Tất cả
              </button>
              {/* Category buttons */}
              {categories.map((cat) => {
                const meta = categoryMeta[cat.slug] ?? {
                  icon: BookOpen,
                  color: 'text-gray-500',
                  bg: 'bg-gray-500/10 border-gray-500/20',
                };
                const Icon = meta.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(isActive ? null : cat.id)
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      isActive
                        ? cn(meta.bg, meta.color, 'shadow-sm')
                        : 'bg-transparent text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech stack row (shown only when category selected) */}
        {availableTechStacks.length > 0 && (
          <TechStackSlider
            techStacks={availableTechStacks}
            selectedTechTags={selectedTechTags}
            toggleTechTag={toggleTechTag}
          />
        )}

        {/* Level + Sort row */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Difficulty */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 shrink-0 pr-3 border-r border-border/50">
              <BarChart3 className="h-3.5 w-3.5" />
              Cấp độ
            </div>
            <div className="flex items-center gap-1">
              {difficulties.map((d) => {
                const isActive = selectedDifficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() =>
                      setSelectedDifficulty(isActive ? null : d.value)
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                      isActive
                        ? cn(d.bg, d.textColor, 'border shadow-sm')
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        d.color,
                        !isActive && 'opacity-40',
                      )}
                    />
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-0.5">
            {sortOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                    sortBy === opt.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {opt.label}
                </button>
              );
            })}
          </div>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
              Không tìm thấy câu hỏi nào
            </p>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm câu hỏi.
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{questions.length}</strong>{' '}
                câu hỏi
                {selectedCategory &&
                  categories.find((c) => c.id === selectedCategory) &&
                  ` trong ${categories.find((c) => c.id === selectedCategory)?.name}`}
                {selectedTechTags.length > 0 &&
                  ` · ${selectedTechTags.join(', ')}`}
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
