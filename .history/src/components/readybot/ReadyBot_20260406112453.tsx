'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot, X, Send, Loader2, Sparkles, Copy, Check,
  Trash2, Maximize2, Minimize2,
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
    return extractText((node as React.ReactElement).props?.children);
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
  const child = children as React.ReactElement<{ className?: string; children?: ReactNode }>;
  const rawLang = child?.props?.className ?? '';
  const lang = rawLang.replace('hljs language-', '').replace('language-', '') || 'code';
  const codeText = extractText(child?.props?.children).replace(/\n$/, '');
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/3">
        <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase">{lang}</span>
        <CopyButton code={codeText} />
      </div>
      <pre {...props} className="overflow-x-auto p-4 text-[13px] leading-relaxed m-0 bg-transparent">
        {children}
      </pre>
    </div>
  );
}

const mdComponents = {
  pre: PreBlock,
  table: ({ children, ...p }: ComponentProps<'table'>) => (
    <div className="overflow-x-auto my-2">
      <table {...p} className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children, ...p }: ComponentProps<'th'>) => (
    <th {...p} className="border border-border/30 px-2 py-1 bg-muted/60 font-semibold text-left">{children}</th>
  ),
  td: ({ children, ...p }: ComponentProps<'td'>) => (
    <td {...p} className="border border-border/30 px-2 py-1">{children}</td>
  ),
};

const PROSE =
  'prose prose-sm dark:prose-invert max-w-none ' +
  'prose-p:text-foreground prose-p:my-1.5 ' +
  'prose-headings:text-foreground prose-headings:font-semibold prose-headings:my-2 prose-headings:leading-snug ' +
  'prose-strong:text-foreground ' +
  'prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded ' +
  'prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none ' +
  'prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent ' +
  'prose-ul:my-1.5 prose-li:my-0.5 prose-ol:my-1.5';

/* ── MessageBubble defined OUTSIDE ReadyBot to prevent remount ── */
function MessageBubble({
  msg,
  compact,
  onExpand,
}: {
  msg: Message;
  compact: boolean;
  onExpand: () => void;
}) {
  const isLong = msg.content.length > 280 || msg.content.includes('```');

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-start">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
        <Bot className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-muted/50 px-3.5 py-2.5 overflow-hidden">
        {compact && isLong ? (
          /* Truncated with gradient fade + expand button */
          <div className="relative">
            <div className="max-h-48 overflow-hidden">
              <div className={PROSE}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={mdComponents}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
            {/* Gradient curtain */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-muted to-transparent pointer-events-none rounded-b-xl" />
            {/* Expand button floats above gradient */}
            <div className="absolute inset-x-0 bottom-2 flex justify-center">
              <button
                onClick={onExpand}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-md hover:bg-muted hover:border-primary/40 transition-all active:scale-95"
              >
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                Mở rộng để đọc dễ hơn
              </button>
            </div>
          </div>
        ) : (
          <div className={PROSE}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={mdComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
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
      <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = ['Giải thích React hooks', 'Tips phỏng vấn Frontend', 'SQL JOIN là gì?', 'REST vs GraphQL'];

export function ReadyBot() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const compactScrollRef = useRef<HTMLDivElement>(null);
  const expandedScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Scroll to bottom when new messages arrive */
  useEffect(() => {
    compactScrollRef.current?.scrollTo({ top: compactScrollRef.current.scrollHeight, behavior: 'smooth' });
    expandedScrollRef.current?.scrollTo({ top: expandedScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, expanded]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại!' },
      ]);
    }
    setLoading(false);
  }, [input, loading, messages]);

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
          <p className="text-muted-foreground text-xs">AI Mentor giúp bạn luyện phỏng vấn IT. Hỏi mình bất cứ điều gì!</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setInput(prompt);
              setTimeout(() => (document.getElementById('rb-form') as HTMLFormElement)?.requestSubmit(), 50);
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
      <form id="rb-form" onSubmit={sendMessage} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Hỏi ReadyBot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-10 sm:h-9 text-sm bg-muted/30 border-border/50"
          disabled={loading}
        />
        <Button type="submit" size="sm" className="h-10 w-10 sm:h-9 sm:w-9 p-0 shrink-0" disabled={!input.trim() || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-105 sm:h-145 flex flex-col sm:rounded-2xl border-0 sm:border border-border/50 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-border/50 bg-linear-to-r from-[#0066FF]/10 to-transparent">
              <HeaderInfo subtitle="AI Mentor" />
              <div className="flex items-center gap-0.5">
                {messages.length > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Mở full screen">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMessages([])}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Xoá chat">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={compactScrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} compact={true} onExpand={handleExpand} />
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
                    <Button variant="ghost" size="sm" onClick={() => setMessages([])}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Xoá chat">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Thu nhỏ">
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setOpen(false); }}
                    className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages — no truncation in expanded view */}
              <div ref={expandedScrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">
                {messages.length === 0 ? (
                  <WelcomeScreen />
                ) : (
                  messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} compact={false} onExpand={handleExpand} />
                  ))
                )}
                {loading && <TypingIndicator />}
              </div>

              {inputBar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot, X, Send, Loader2, Sparkles, Copy, Check,
  Trash2, Maximize2, Minimize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.min.css';

type Message = { role: 'user' | 'assistant'; content: string };

/* --- Recursively extract plain text from React node tree (for copy) --- */
function extractText(node: ReactNode): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in (node as object)) {
    return extractText((node as React.ReactElement).props?.children);
  }
  return '';
}

/* --- Copy button --- */
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

/* --- Custom <pre> renderer --- */
function PreBlock({ children, ...props }: ComponentProps<'pre'>) {
  const child = children as React.ReactElement<{ className?: string; children?: ReactNode }>;
  const rawLang = child?.props?.className ?? '';
  const lang = rawLang.replace('hljs language-', '').replace('language-', '') || 'code';
  const codeText = extractText(child?.props?.children).replace(/\n$/, '');
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] text-left">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/3">
        <span className="text-[10px] font-mono tracking-wider text-white/35 uppercase">{lang}</span>
        <CopyButton code={codeText} />
      </div>
      <pre {...props} className="overflow-x-auto p-4 text-[13px] leading-relaxed m-0 bg-transparent">
        {children}
      </pre>
    </div>
  );
}

/* --- Shared Markdown renderer --- */
const markdownComponents = {
  pre: PreBlock,
  table: ({ children, ...props }: ComponentProps<'table'>) => (
    <div className="overflow-x-auto my-2">
      <table {...props} className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children, ...props }: ComponentProps<'th'>) => (
    <th {...props} className="border border-border/30 px-2 py-1 bg-muted/60 font-semibold text-left">{children}</th>
  ),
  td: ({ children, ...props }: ComponentProps<'td'>) => (
    <td {...props} className="border border-border/30 px-2 py-1">{children}</td>
  ),
};

const PROSE_CLASS =
  'prose prose-sm dark:prose-invert max-w-none ' +
  'prose-p:text-foreground prose-p:my-1.5 ' +
  'prose-headings:text-foreground prose-headings:font-semibold prose-headings:my-2 prose-headings:leading-snug ' +
  'prose-strong:text-foreground ' +
  'prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded ' +
  'prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none ' +
  'prose-pre:m-0 prose-pre:p-0 prose-pre:bg-transparent ' +
  'prose-ul:my-1.5 prose-li:my-0.5 prose-ol:my-1.5';

/* ---- Detect if message is "long" and warrants expand ---- */
const isLongMessage = (content: string) =>
  content.length > 350 || content.includes('```');

export function ReadyBot() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const expandScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !expanded && inputRef.current) inputRef.current.focus();
  }, [open, expanded]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (expandScrollRef.current) {
      expandScrollRef.current.scrollTop = expandScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply ?? 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại!' },
      ]);
    }
    setLoading(false);
  };

  const quickPrompts = ['Giải thích React hooks', 'Tips phỏng vấn Frontend', 'SQL JOIN là gì?', 'REST vs GraphQL'];

  /* ---- Shared input bar ---- */
  const InputBar = () => (
    <div className="border-t border-border/50 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-card">
      <form id="chatbot-form" onSubmit={sendMessage} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Hỏi ReadyBot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-10 sm:h-9 text-sm bg-muted/30 border-border/50"
          disabled={loading}
          autoFocus
        />
        <Button
          type="submit"
          size="sm"
          className="h-10 w-10 sm:h-9 sm:w-9 p-0 shrink-0"
          disabled={!input.trim() || loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );

  /* ---- Message list ---- */
  const MessageList = ({ ref: listRef }: { ref: React.RefObject<HTMLDivElement | null> }) => (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
      {messages.length === 0 ? (
        <div className="space-y-4">
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed">
              <p className="font-medium mb-1">Xin chào! Mình là ReadyBot 🤖</p>
              <p className="text-muted-foreground text-xs">AI Mentor giúp bạn luyện phỏng vấn IT. Hỏi mình bất cứ điều gì!</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  setTimeout(() => {
                    (document.getElementById('chatbot-form') as HTMLFormElement)?.requestSubmit();
                  }, 50);
                }}
                className="rounded-full border border-border/50 bg-background px-3 py-1.5 sm:py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2.5', msg.role === 'user' && 'justify-end')}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div className={cn(
              'min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'max-w-[78%] bg-primary text-primary-foreground rounded-tr-sm'
                : 'flex-1 bg-muted/50 rounded-tl-sm overflow-hidden',
            )}>
              {msg.role === 'assistant' ? (
                <>
                  <div className={PROSE_CLASS}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={markdownComponents}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {isLongMessage(msg.content) && !expanded && (
                    <button
                      onClick={() => setExpanded(true)}
                      className="mt-2 flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
                    >
                      <Maximize2 className="h-3 w-3" />
                      Mở rộng để đọc dễ hơn
                    </button>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))
      )}
      {loading && (
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Floating button */}
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

      {/* ---- Compact chat panel ---- */}
      <AnimatePresence>
        {open && !expanded && (
          <motion.div
            key="compact"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-105 sm:h-145 flex flex-col sm:rounded-2xl border-0 sm:border border-border/50 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-border/50 bg-linear-to-r from-[#0066FF]/10 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0066FF] to-[#0055DD]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold">ReadyBot</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-muted-foreground">AI Mentor</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {messages.length > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Mở rộng">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMessages([])}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Xoá chat">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <MessageList ref={scrollRef} />
            <InputBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Full-screen expanded view ---- */}
      <AnimatePresence>
        {open && expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setExpanded(false)}
            />
            {/* Expanded panel */}
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 sm:inset-6 z-50 flex flex-col rounded-none sm:rounded-2xl border-0 sm:border border-border/50 bg-card shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-border/50 bg-linear-to-r from-[#0066FF]/10 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0066FF] to-[#0055DD]">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">ReadyBot</span>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-muted-foreground">AI Mentor — Full view</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {messages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setMessages([])}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Xoá chat">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Thu nhỏ">
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setOpen(false); }}
                    className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <MessageList ref={expandScrollRef} />
              <InputBar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
