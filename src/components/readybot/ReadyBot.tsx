'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.min.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function ReadyBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại!',
        },
      ]);
    }

    setLoading(false);
  };

  const quickPrompts = [
    'Giải thích React hooks',
    'Tips phỏng vấn Frontend',
    'SQL JOIN là gì?',
    'REST vs GraphQL',
  ];

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
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white shadow-lg shadow-[#0066FF]/25 hover:shadow-xl hover:shadow-[#0066FF]/30 transition-shadow"
            aria-label="Mở ReadyBot"
          >
            <Bot className="h-6 w-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[#0066FF]/20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[560px] flex flex-col rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-[#0066FF]/10 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0055DD]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold">ReadyBot</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-muted-foreground">
                      AI Mentor
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[300px] max-h-[380px]"
            >
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Welcome */}
                  <div className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed">
                      <p className="font-medium mb-1">
                        Xin chào! Mình là ReadyBot 🤖
                      </p>
                      <p className="text-muted-foreground text-xs">
                        AI Mentor giúp bạn luyện phỏng vấn IT. Hỏi mình bất cứ
                        điều gì!
                      </p>
                    </div>
                  </div>

                  {/* Quick prompts */}
                  <div className="flex flex-wrap gap-1.5 pl-9">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          setTimeout(() => {
                            const form = document.getElementById(
                              'chatbot-form',
                            ) as HTMLFormElement;
                            form?.requestSubmit();
                          }, 50);
                        }}
                        className="rounded-full border border-border/50 bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-2.5',
                      msg.role === 'user' && 'justify-end',
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-md'
                          : 'bg-muted/50 rounded-tl-md',
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-foreground prose-p:my-1 prose-headings:text-foreground prose-headings:my-2 prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted/80 prose-pre:text-xs prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
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
                  <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/50 px-3 py-3">
              <form
                id="chatbot-form"
                onSubmit={sendMessage}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  placeholder="Hỏi ReadyBot..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-9 text-sm bg-muted/30 border-border/50"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0"
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
