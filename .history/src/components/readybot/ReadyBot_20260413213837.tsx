'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.min.css';

type Message = { role: 'user' | 'assistant'; content: string };

/* ── Recursively extract plain text for Copy ── */
function extractText(node: ReactNode): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in (node as object))
    return extractText(
      (node as React.ReactElement<{ children?: ReactNode }>).props?.children,
    );
  return '';
}

/* ── Copy button ── */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/20 hover:text-white transition-colors select-none"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/* ── Custom <pre> with language label + copy + horizontal scroll ── */
function PreBlock({ children, ...props }: ComponentProps<'pre'>) {
  const child = children as React.ReactElement<{
    className?: string;
    children?: ReactNode;
  }>;
  const rawLang = child?.props?.className ?? '';
  const lang =
    rawLang.replace('hljs language-', '').replace('language-', '') || 'code';
  const codeText = extractText(child?.props?.children).replace(/\n$/, '');
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/3">
        <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase">
          {lang}
        </span>
        <CopyButton code={codeText} />
      </div>
      <pre
        {...props}
        className="overflow-x-auto p-4 text-[13px] leading-relaxed m-0 bg-transparent"
      >
        {children}
      </pre>
    </div>
  );
}

/* ── Full explicit markdown component renderers ── */
const mdComponents = {
  /* ── Block: paragraph ── */
  p: ({ children, ...p }: ComponentProps<'p'>) => (
    <p
      {...p}
      className="text-[13.5px] leading-[1.75] text-foreground my-2.5 first:mt-0 last:mb-0"
    >
      {children}
    </p>
  ),
  /* ── Headings ── */
  h1: ({ children, ...p }: ComponentProps<'h1'>) => (
    <h1
      {...p}
      className="text-[15px] font-bold text-foreground mt-5 mb-2 first:mt-0 leading-tight"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...p }: ComponentProps<'h2'>) => (
    <h2
      {...p}
      className="text-[14px] font-semibold text-foreground mt-4 mb-1.5 pb-1.5 border-b border-border/25 first:mt-0 leading-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...p }: ComponentProps<'h3'>) => (
    <h3
      {...p}
      className="text-[13px] font-semibold text-foreground mt-3 mb-1 first:mt-0 leading-tight"
    >
      {children}
    </h3>
  ),
  /* ── Inline ── */
  strong: ({ children, ...p }: ComponentProps<'strong'>) => (
    <strong {...p} className="font-semibold text-foreground">
      {children}
    </strong>
  ),
  em: ({ children, ...p }: ComponentProps<'em'>) => (
    <em {...p} className="italic text-foreground/80">
      {children}
    </em>
  ),
  code: ({ children, className, ...p }: ComponentProps<'code'>) => {
    if (className)
      return (
        <code {...p} className={className}>
          {children}
        </code>
      );
    return (
      <code
        {...p}
        className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[12px] font-mono"
      >
        {children}
      </code>
    );
  },
  a: ({ children, ...p }: ComponentProps<'a'>) => (
    <a
      {...p}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),
  /* ── Lists ── */
  ul: ({ children, ...p }: ComponentProps<'ul'>) => (
    <ul
      {...p}
      className="my-2.5 pl-5 space-y-1.5 list-disc marker:text-primary/50 first:mt-0 last:mb-0"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...p }: ComponentProps<'ol'>) => (
    <ol
      {...p}
      className="my-2.5 pl-5 space-y-1.5 list-decimal marker:text-primary/50 first:mt-0 last:mb-0"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...p }: ComponentProps<'li'>) => (
    <li {...p} className="text-[13.5px] leading-[1.7] text-foreground">
      {children}
    </li>
  ),
  /* ── Block: quote & rule ── */
  blockquote: ({ children, ...p }: ComponentProps<'blockquote'>) => (
    <blockquote
      {...p}
      className="border-l-2 border-primary/40 pl-3.5 my-3 text-muted-foreground italic text-[13px]"
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border/25 my-4" />,
  /* ── Code block ── */
  pre: PreBlock,
  /* ── Table ── */
  table: ({ children, ...p }: ComponentProps<'table'>) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-border/30">
      <table {...p} className="w-full border-collapse text-[12.5px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...p }: ComponentProps<'thead'>) => (
    <thead {...p} className="bg-muted/60">
      {children}
    </thead>
  ),
  tbody: ({ children, ...p }: ComponentProps<'tbody'>) => (
    <tbody {...p} className="divide-y divide-border/20">
      {children}
    </tbody>
  ),
  tr: ({ children, ...p }: ComponentProps<'tr'>) => (
    <tr
      {...p}
      className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
    >
      {children}
    </tr>
  ),
  th: ({ children, ...p }: ComponentProps<'th'>) => (
    <th
      {...p}
      className="px-3 py-2 font-semibold text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/30"
    >
      {children}
    </th>
  ),
  td: ({ children, ...p }: ComponentProps<'td'>) => (
    <td {...p} className="px-3 py-2">
      {children}
    </td>
  ),
};

/* ── Consistent markdown content wrapper ── */
function MdContent({ children }: { children: string }) {
  return (
    <div className="text-[13.5px] leading-[1.75] text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={mdComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/* ── MessageBubble defined OUTSIDE ReadyBot to prevent remount ── */
function MessageBubble({
  msg,
  compact,
  onExpand,
  isStreaming = false,
}: {
  msg: Message;
  compact: boolean;
  onExpand: () => void;
  isStreaming?: boolean;
}) {
  const isLong =
    !isStreaming && (msg.content.length > 280 || msg.content.includes('```'));

  /* ── User message (both views) ── */
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  /* ── AI message — EXPANDED full-screen view ── */
  if (!compact) {
    return (
      <div className="flex gap-2.5 items-start">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-primary/10 bg-primary/5 px-4 py-3.5">
          {msg.content ? (
            <MdContent>{msg.content}</MdContent>
          ) : (
            <span className="inline-block h-3.5 w-0.5 rounded-full bg-primary/60 animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  /* ── AI message — COMPACT floating panel ── */
  return (
    <div className="flex gap-2.5 items-start">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
        <Bot className="h-3.5 w-3.5 text-primary" />
      </div>

      {isLong ? (
        /* Truncated with fade + expand CTA */
        <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-border/60 bg-card overflow-hidden">
          <div className="relative px-4 pt-3">
            <div className="max-h-36 overflow-hidden">
              <MdContent>{msg.content}</MdContent>
            </div>
            {/* Gradient — matches bg-card */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent pointer-events-none" />
          </div>
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-border/20">
            <span className="text-[11px] text-muted-foreground/60">
              Nội dung bị rút gọn
            </span>
            <button
              onClick={onExpand}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors active:scale-95"
            >
              <Maximize2 className="h-3 w-3" />
              Xem đầy đủ
            </button>
          </div>
        </div>
      ) : (
        /* Short message — clean card bubble */
        <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3 overflow-hidden">
          {msg.content ? (
            <MdContent>{msg.content}</MdContent>
          ) : (
            <span className="inline-block h-3.5 w-0.5 rounded-full bg-muted-foreground/60 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Typing indicator defined OUTSIDE ReadyBot ── */
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Bot className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  'Giải thích React hooks',
  'Tips phỏng vấn Frontend',
  'SQL JOIN là gì?',
  'REST vs GraphQL',
];

export function ReadyBot() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    /* Restore from localStorage on first render (client-only) */
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('readybot_history');
      return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const compactScrollRef = useRef<HTMLDivElement>(null);
  const expandedScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Persist messages — debounced, keep latest 50, skip during streaming */
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (streaming) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const toSave = messages.slice(-50);
        localStorage.setItem('readybot_history', JSON.stringify(toSave));
      } catch {
        /* quota exceeded — silent fail */
      }
    }, 2000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [messages, streaming]);

  /* Scroll to bottom when new messages arrive */
  useEffect(() => {
    compactScrollRef.current?.scrollTo({
      top: compactScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
    expandedScrollRef.current?.scrollTo({
      top: expandedScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading, streaming]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, expanded]);

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading || streaming) return;
      const userMessage = input.trim();
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: userMessage }],
          }),
        });
        if (!res.ok || !res.body) {
          let errMsg = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!';
          try {
            const d = await res.json();
            if (d.error) errMsg = d.error;
          } catch {}
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: errMsg },
          ]);
          setLoading(false);
          return;
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
        setLoading(false);
        setStreaming(true);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (!last || last.role !== 'assistant') return prev;
              return [
                ...prev.slice(0, -1),
                { role: 'assistant' as const, content: last.content + chunk },
              ];
            });
          }
        }
      } catch {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const errMsg =
            'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại!';
          if (last?.role === 'assistant' && last.content === '') {
            return [
              ...prev.slice(0, -1),
              { role: 'assistant' as const, content: errMsg },
            ];
          }
          return [...prev, { role: 'assistant' as const, content: errMsg }];
        });
      } finally {
        setLoading(false);
        setStreaming(false);
      }
    },
    [input, loading, streaming, messages],
  );

  const handleExpand = useCallback(() => setExpanded(true), []);

  /* Shared header info block */
  const HeaderInfo = ({ subtitle }: { subtitle: string }) => (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0066FF] to-[#0055DD]">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none mb-0.5">ReadyBot</p>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-muted-foreground">{subtitle}</span>
        </div>
      </div>
    </div>
  );

  /* Shared welcome screen + quick prompts */
  const WelcomeScreen = () => (
    <div className="space-y-4">
      <div className="flex gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed">
          <p className="font-medium mb-1">Xin chào! Mình là ReadyBot 🤖</p>
          <p className="text-muted-foreground text-xs">
            AI Mentor giúp bạn luyện phỏng vấn IT. Hỏi mình bất cứ điều gì!
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setInput(prompt);
              setTimeout(
                () =>
                  (
                    document.getElementById('rb-form') as HTMLFormElement
                  )?.requestSubmit(),
                50,
              );
            }}
            className="rounded-full border border-border/50 bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );

  /* Input bar */
  const inputBar = (
    <div className="shrink-0 border-t border-border/50 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-card">
      <form
        id="rb-form"
        onSubmit={sendMessage}
        className="flex items-center gap-2"
      >
        <Input
          ref={inputRef}
          placeholder="Hỏi ReadyBot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-10 sm:h-9 text-sm bg-muted/30 border-border/50"
          disabled={loading || streaming}
        />
        <Button
          type="submit"
          size="sm"
          className="h-10 w-10 sm:h-9 sm:w-9 p-0 shrink-0"
          disabled={!input.trim() || loading || streaming}
        >
          {loading || streaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );

  return (
    <>
      {/* ── Floating button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-[#0066FF] to-[#0055DD] text-white shadow-lg shadow-[#0066FF]/25 hover:shadow-xl hover:shadow-[#0066FF]/30 transition-shadow active:scale-95"
            aria-label="Mở ReadyBot"
          >
            <Bot className="h-6 w-6" />
            <span className="absolute inset-0 rounded-full animate-ping bg-[#0066FF]/20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Compact panel ── */}
      <AnimatePresence>
        {open && !expanded && (
          <motion.div
            key="compact"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-105 h-[85svh] sm:h-150 flex flex-col rounded-t-2xl sm:rounded-2xl border-t sm:border border-border/50 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-linear-to-r from-[#0066FF]/10 to-transparent">
              <HeaderInfo subtitle="AI Mentor" />
              <div className="flex items-center gap-0.5">
                {messages.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(true)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Mở full screen"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMessages([]);
                        localStorage.removeItem('readybot_history');
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Xoá chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={compactScrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
            >
              {messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    compact={true}
                    onExpand={handleExpand}
                    isStreaming={streaming && i === messages.length - 1}
                  />
                ))
              )}
              {loading && <TypingIndicator />}
            </div>

            {inputBar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen expanded panel ── */}
      <AnimatePresence>
        {open && expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setExpanded(false)}
            />
            {/* Panel */}
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 sm:inset-6 z-50 flex flex-col rounded-none sm:rounded-2xl border-0 sm:border border-border/50 bg-card shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-border/50 bg-linear-to-r from-[#0066FF]/10 to-transparent">
                <HeaderInfo subtitle="AI Mentor — Full view" />
                <div className="flex items-center gap-0.5">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMessages([]);
                        localStorage.removeItem('readybot_history');
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Xoá chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(false)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Thu nhỏ"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExpanded(false);
                      setOpen(false);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages — no truncation in expanded view */}
              <div
                ref={expandedScrollRef}
                className="flex-1 overflow-y-auto px-6 py-5 min-h-0"
              >
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.length === 0 ? (
                    <WelcomeScreen />
                  ) : (
                    messages.map((msg, i) => (
                      <MessageBubble
                        key={i}
                        msg={msg}
                        compact={false}
                        onExpand={handleExpand}
                      />
                    ))
                  )}
                  {loading && <TypingIndicator />}
                </div>
              </div>

              {inputBar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
