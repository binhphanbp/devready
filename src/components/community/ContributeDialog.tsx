'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  PenLine,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Briefcase,
  Tag,
  MessageSquareText,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Eye,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const difficultyOptions = [
  {
    value: 'easy',
    label: 'Dễ',
    desc: 'Kiến thức cơ bản, fresher',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  {
    value: 'medium',
    label: 'Trung bình',
    desc: 'Junior đến Mid-level',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
  {
    value: 'hard',
    label: 'Khó',
    desc: 'Senior, System Design',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
];

const STEPS = [
  { icon: Building2, label: 'Thông tin' },
  { icon: HelpCircle, label: 'Câu hỏi' },
  { icon: Lightbulb, label: 'Trả lời' },
  { icon: Eye, label: 'Xem lại' },
];

interface ContributeDialogProps {
  onSubmitted?: () => void;
}

export default function ContributeDialog({
  onSubmitted,
}: ContributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [success, setSuccess] = useState(false);

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [content, setContent] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const loadCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, color')
      .order('sort_order');
    if (data) setCategories(data);
  }, []);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  const resetForm = () => {
    setStep(0);
    setCompany('');
    setRole('');
    setDifficulty('medium');
    setCategoryId('');
    setQuestionText('');
    setContent('');
    setAnswerText('');
    setTags([]);
    setTagInput('');
    setSuccess(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const canProceed = (s: number) => {
    switch (s) {
      case 0:
        return company.trim() && role.trim() && categoryId;
      case 1:
        return questionText.trim().length >= 10;
      case 2:
        return true; // answer is optional but encouraged
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setCreating(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }

    const { error } = await supabase.from('community_reviews').insert({
      author_id: user.id,
      company: company.trim(),
      role: role.trim(),
      difficulty,
      category_id: categoryId || null,
      question_text: questionText.trim(),
      content: content.trim() || null,
      answer_text: answerText.trim() || null,
      tags: tags.length > 0 ? tags : [],
    });

    setCreating(false);

    if (!error) {
      setSuccess(true);
      onSubmitted?.();
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setTimeout(resetForm, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="glow-blue bg-linear-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
          />
        }
      >
        <PenLine className="mr-1.5 h-4 w-4" />
        Đóng góp câu hỏi
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-xl h-dvh sm:h-auto max-h-dvh sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg p-4 sm:p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Đã gửi thành công!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Bài đóng góp của bạn đang được kiểm duyệt. Admin sẽ xem xét và phê
              duyệt sớm nhất có thể.
            </p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Đóng góp câu hỏi phỏng vấn</DialogTitle>
              <DialogDescription>
                Chia sẻ câu hỏi phỏng vấn thực tế để giúp cộng đồng chuẩn bị tốt
                hơn.
              </DialogDescription>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center gap-0.5 sm:gap-1 py-2 sm:py-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex flex-1 items-center justify-center sm:justify-start gap-1 sm:gap-1.5 rounded-lg px-1.5 sm:px-2.5 py-2 text-[11px] sm:text-xs font-medium transition-all',
                      i === step
                        ? 'bg-primary/10 text-primary'
                        : i < step
                          ? 'text-emerald-400'
                          : 'text-muted-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Step 0: Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Công ty *</label>
                    <Input
                      placeholder="VD: FPT Software"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vị trí *</label>
                    <Input
                      placeholder="VD: Frontend Developer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={cn(
                          'rounded-xl border px-3 py-3 sm:py-2.5 text-left text-sm transition-all active:scale-[0.97]',
                          categoryId === cat.id
                            ? 'border-primary/50 bg-primary/5 shadow-sm'
                            : 'border-border/50 hover:border-border hover:bg-muted/30',
                        )}
                      >
                        <span className="font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Độ khó</label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficultyOptions.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDifficulty(d.value)}
                        className={cn(
                          'rounded-xl border p-3 sm:p-3 text-center transition-all active:scale-[0.97]',
                          difficulty === d.value
                            ? d.className + ' shadow-sm'
                            : 'border-border/50 text-muted-foreground hover:border-border',
                        )}
                      >
                        <span className="text-sm font-medium block">
                          {d.label}
                        </span>
                        <span className="text-[10px] opacity-70">{d.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Question */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Câu hỏi phỏng vấn *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Ghi lại chính xác câu hỏi bạn được hỏi trong buổi phỏng vấn.
                  </p>
                  <Textarea
                    placeholder="VD: Giải thích sự khác nhau giữa useEffect và useLayoutEffect trong React?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {questionText.length} ký tự (tối thiểu 10)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mô tả thêm{' '}
                    <span className="text-muted-foreground font-normal">
                      (tùy chọn)
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Bối cảnh phỏng vấn, vòng nào, format, thời gian...
                  </p>
                  <Textarea
                    placeholder="VD: Vòng technical round 2, phỏng vấn online qua Google Meet..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Answer */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Câu trả lời mẫu
                    <span className="text-muted-foreground font-normal ml-1">
                      (khuyến khích)
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Viết câu trả lời chuẩn chỉnh hoặc chia sẻ cách bạn đã trả
                    lời. Nội dung càng chi tiết càng giúp ích cho cộng đồng.
                  </p>
                  <Textarea
                    placeholder="VD: useEffect chạy sau khi browser paint xong (asynchronous), trong khi useLayoutEffect chạy synchronous sau DOM mutations nhưng trước khi browser paint..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tags{' '}
                    <span className="text-muted-foreground font-normal">
                      (tối đa 5)
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tag rồi Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      disabled={tags.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 5}
                    >
                      <Tag className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 text-xs"
                        >
                          #{tag}
                          <button
                            onClick={() =>
                              setTags(tags.filter((t) => t !== tag))
                            }
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/50 bg-card/50 p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Building2 className="h-3 w-3" />
                      {company}
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Briefcase className="h-3 w-3" />
                      {role}
                    </Badge>
                    {difficulty && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          difficultyOptions.find((d) => d.value === difficulty)
                            ?.className,
                        )}
                      >
                        {
                          difficultyOptions.find((d) => d.value === difficulty)
                            ?.label
                        }
                      </Badge>
                    )}
                  </div>

                  {questionText && (
                    <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                        Câu hỏi phỏng vấn
                      </p>
                      <p className="text-sm font-medium">{questionText}</p>
                    </div>
                  )}

                  {content && (
                    <p className="text-sm text-muted-foreground">{content}</p>
                  )}

                  {answerText && (
                    <div className="rounded-xl bg-emerald-500/3 border border-emerald-500/10 p-4">
                      <p className="text-xs font-medium text-emerald-400 mb-1 uppercase tracking-wider">
                        Câu trả lời mẫu
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {answerText}
                      </p>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-3">
                  <p className="text-xs text-yellow-400 flex items-start gap-2">
                    <MessageSquareText className="h-4 w-4 shrink-0 mt-0.5" />
                    Bài đóng góp sẽ được admin kiểm duyệt trước khi hiển thị
                    công khai. Vui lòng đảm bảo nội dung chính xác và hữu ích
                    cho cộng đồng.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 sm:pt-2 mt-auto">
              <Button
                type="button"
                variant="ghost"
                size="default"
                className="sm:size-sm h-10 sm:h-9 text-sm"
                onClick={() =>
                  step > 0 ? setStep(step - 1) : handleOpenChange(false)
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {step === 0 ? 'Hủy' : 'Quay lại'}
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  size="default"
                  className="h-10 sm:h-9 text-sm"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed(step)}
                >
                  Tiếp theo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="default"
                  className="h-10 sm:h-9 text-sm"
                  onClick={handleSubmit}
                  disabled={creating || !questionText.trim()}
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Gửi đóng góp
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
