'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Lightbulb,
  Bug,
  Sparkles,
  BookOpen,
  HelpCircle,
  Wrench,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const feedbackTypes = [
  {
    value: 'bug',
    label: 'Báo lỗi',
    desc: 'Tính năng bị hỏng hoặc hoạt động sai',
    icon: Bug,
    className: 'border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20',
    activeClass: 'border-red-500/60 bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
  },
  {
    value: 'feature',
    label: 'Đề xuất tính năng',
    desc: 'Tính năng mới bạn muốn thấy',
    icon: Sparkles,
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-400 hover:border-violet-500/60 hover:bg-violet-500/20',
    activeClass: 'border-violet-500/60 bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30',
  },
  {
    value: 'improvement',
    label: 'Cải thiện',
    desc: 'Chức năng hiện tại có thể tốt hơn',
    icon: Wrench,
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/20',
    activeClass: 'border-blue-500/60 bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30',
  },
  {
    value: 'content',
    label: 'Nội dung',
    desc: 'Câu hỏi sai, thiếu, hoặc cần bổ sung',
    icon: BookOpen,
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/20',
    activeClass: 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
  },
  {
    value: 'other',
    label: 'Khác',
    desc: 'Ý kiến hoặc câu hỏi khác',
    icon: HelpCircle,
    className: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400 hover:border-zinc-500/60 hover:bg-zinc-500/20',
    activeClass: 'border-zinc-500/60 bg-zinc-500/20 text-zinc-400 ring-1 ring-zinc-500/30',
  },
] as const;

type FeedbackType = (typeof feedbackTypes)[number]['value'];

interface FeedbackDialogProps {
  collapsed?: boolean;
}

export default function FeedbackDialog({ collapsed = false }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<FeedbackType>('improvement');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  const resetForm = () => {
    setType('improvement');
    setTitle('');
    setContent('');
    setTitleError(null);
    setContentError(null);
    setError(null);
    setSuccess(false);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setTimeout(resetForm, 300);
    }
  };

  const validate = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Vui lòng nhập tiêu đề');
      valid = false;
    } else {
      setTitleError(null);
    }
    if (!content.trim()) {
      setContentError('Vui lòng mô tả chi tiết ý kiến của bạn');
      valid = false;
    } else {
      setContentError(null);
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Bạn cần đăng nhập để gửi góp ý');
      setSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from('feedback').insert({
      user_id: user.id,
      type,
      title: title.trim(),
      content: content.trim(),
    });

    setSubmitting(false);

    if (dbError) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } else {
      setSuccess(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            title="Góp ý & Đề xuất"
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl px-3 py-3 lg:py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200 min-h-11',
            )}
          />
        }
      >
        <Lightbulb className="h-4.5 w-4.5 shrink-0 transition-colors group-hover:text-foreground" />
        {!collapsed && <span>Góp ý</span>}
      </DialogTrigger>

      <DialogContent className="max-w-lg p-0 flex flex-col max-h-[85vh]">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-5 px-8 py-12 text-center min-w-0"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold">Cảm ơn bạn đã góp ý!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Phản hồi của bạn rất có giá trị với chúng tôi.{' '}
                  <span className="text-foreground font-medium">Đội ngũ DevReady</span> sẽ
                  xem xét và cải thiện website trong thời gian sớm nhất.
                </p>
              </div>

              <Button
                onClick={() => setOpen(false)}
                className="mt-2 w-full max-w-50"
              >
                Đóng
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0 overflow-hidden"
            >
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <Lightbulb className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">Góp ý & Đề xuất</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Giúp DevReady ngày càng tốt hơn</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="overflow-y-auto overscroll-contain px-6 py-5 space-y-5">
                {/* Type selector */}
                <div className="space-y-2.5">
                  <label className="text-sm font-medium">Loại góp ý</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {feedbackTypes.map((ft) => {
                      const Icon = ft.icon;
                      const isActive = type === ft.value;
                      return (
                        <button
                          key={ft.value}
                          onClick={() => setType(ft.value)}
                          className={cn(
                            'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-200',
                            isActive ? ft.activeClass : cn('border-border/50 bg-muted/20 text-muted-foreground', ft.className.split(' ').filter(c => c.startsWith('hover:')).join(' ')),
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-semibold leading-tight">{ft.label}</span>
                          <span className="text-[10px] leading-tight opacity-70">{ft.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input
                    placeholder="Mô tả ngắn gọn vấn đề hoặc đề xuất..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError(null);
                    }}
                    className={cn('w-full', titleError && 'border-red-500/60 focus-visible:ring-red-500/20')}
                  />
                  {titleError && (
                    <p className="text-xs text-red-400">{titleError}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Chi tiết</label>
                  <Textarea
                    placeholder="Mô tả chi tiết hơn để chúng tôi có thể hiểu và xử lý tốt nhất..."
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (contentError) setContentError(null);
                    }}
                    rows={4}
                    className={cn('w-full resize-none break-words', contentError && 'border-red-500/60 focus-visible:ring-red-500/20')}
                  />
                  {contentError && (
                    <p className="text-xs text-red-400">{contentError}</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi góp ý'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
