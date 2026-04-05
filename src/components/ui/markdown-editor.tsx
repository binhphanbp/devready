'use client';

import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Heading2,
  Code,
  List,
  Quote,
  Eye,
  PenLine,
  Minus,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

type Tab = 'edit' | 'preview';

interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
  separator?: boolean;
}

const TOOLBAR: (ToolbarAction | { separator: true })[] = [
  {
    icon: <Heading2 className="h-4 w-4" />,
    label: 'Tiêu đề (H2)',
    prefix: '## ',
    suffix: '',
    block: true,
  },
  { separator: true },
  {
    icon: <Bold className="h-4 w-4" />,
    label: 'In đậm (Ctrl+B)',
    prefix: '**',
    suffix: '**',
  },
  {
    icon: <Italic className="h-4 w-4" />,
    label: 'In nghiêng (Ctrl+I)',
    prefix: '_',
    suffix: '_',
  },
  { separator: true },
  {
    icon: <Code className="h-4 w-4" />,
    label: 'Code block',
    prefix: '```js\n',
    suffix: '\n```',
    block: true,
  },
  {
    icon: <span className="font-mono text-[11px] font-bold">`·`</span>,
    label: 'Inline code',
    prefix: '`',
    suffix: '`',
  },
  { separator: true },
  {
    icon: <List className="h-4 w-4" />,
    label: 'Danh sách',
    prefix: '- ',
    suffix: '',
    block: true,
  },
  {
    icon: <Quote className="h-4 w-4" />,
    label: 'Trích dẫn',
    prefix: '> ',
    suffix: '',
    block: true,
  },
  {
    icon: <Minus className="h-4 w-4" />,
    label: 'Đường kẻ ngang',
    prefix: '\n---\n',
    suffix: '',
    block: true,
  },
];

const previewComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-lg font-bold text-foreground mt-4 mb-2 pb-1.5 border-b border-border/50" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-base font-semibold text-foreground mt-3 mb-2 flex items-center gap-2" {...props}>
      <span className="w-1 h-4 rounded-full bg-violet-500 inline-block shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-sm font-semibold text-foreground mt-3 mb-1.5" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-sm leading-relaxed text-muted-foreground mb-2.5" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="space-y-1 mb-3 ml-1 text-sm text-muted-foreground" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="space-y-1 mb-3 ml-4 text-sm text-muted-foreground list-decimal" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-2 text-sm" {...props}>
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400/70 shrink-0" />
      <span>{children}</span>
    </li>
  ),
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isBlock = !!className;
    if (!isBlock) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[12.5px] font-mono" {...props}>
          {children}
        </code>
      );
    }
    return <code className={cn('text-[12.5px] font-mono', className)} {...props}>{children}</code>;
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="mb-3 rounded-lg border border-border/50 bg-[#0d1117] p-3 overflow-x-auto text-[12.5px] leading-relaxed" {...props}>
      {children}
    </pre>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-muted-foreground" {...props}>{children}</em>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-violet-400/50 pl-3 py-1 my-2 bg-violet-500/5 rounded-r-lg" {...props}>
      {children}
    </blockquote>
  ),
  hr: ({ ...props }) => <hr className="border-border/40 my-3" {...props} />,
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-3 py-2 text-left font-medium text-foreground bg-muted/50 border-b border-border/50" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3 py-2 text-muted-foreground border-b border-border/30" {...props}>{children}</td>
  ),
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Viết câu trả lời bằng Markdown...',
  minHeight = 200,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<Tab>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (action: ToolbarAction) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.slice(start, end);

      let newText: string;
      let cursorStart: number;
      let cursorEnd: number;

      if (action.block) {
        // Block-level: prepend prefix to beginning of selection / line
        const before = value.slice(0, start);
        const after = value.slice(end);
        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const prefix = needsNewline ? '\n' + action.prefix : action.prefix;
        newText = before + prefix + selected + action.suffix + after;
        cursorStart = start + prefix.length;
        cursorEnd = cursorStart + selected.length;
      } else {
        // Inline wrap
        const before = value.slice(0, start);
        const after = value.slice(end);
        const insertion = action.prefix + (selected || 'text') + action.suffix;
        newText = before + insertion + after;
        cursorStart = start + action.prefix.length;
        cursorEnd = cursorStart + (selected || 'text').length;
      }

      onChange(newText);
      // Restore selection after state update
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [value, onChange],
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault();
          applyFormat({ icon: null, label: '', prefix: '**', suffix: '**' });
        } else if (e.key === 'i') {
          e.preventDefault();
          applyFormat({ icon: null, label: '', prefix: '_', suffix: '_' });
        } else if (e.key === 'e') {
          e.preventDefault();
          applyFormat({ icon: null, label: '', prefix: '`', suffix: '`' });
        }
      }
      // Auto-indent with Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        const el = textareaRef.current!;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newVal = value.slice(0, start) + '  ' + value.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => {
          el.setSelectionRange(start + 2, start + 2);
        });
      }
    },
    [applyFormat, value, onChange],
  );

  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 overflow-hidden bg-background/60 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all',
        className,
      )}
    >
      {/* ===== TOOLBAR ===== */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/40 bg-muted/20 flex-wrap">
        {TOOLBAR.map((item, idx) => {
          if ('separator' in item && item.separator) {
            return <div key={idx} className="w-px h-5 bg-border/50 mx-1 shrink-0" />;
          }
          const action = item as ToolbarAction;
          return (
            <button
              key={idx}
              type="button"
              title={action.label}
              onClick={() => {
                setTab('edit');
                applyFormat(action);
              }}
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 transition-colors shrink-0"
            >
              {action.icon}
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Tab switcher */}
        <div className="flex items-center rounded-lg border border-border/40 overflow-hidden bg-muted/30 shrink-0">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors',
              tab === 'edit'
                ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <PenLine className="h-3 w-3" />
            Viết
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors',
              tab === 'preview'
                ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Eye className="h-3 w-3" />
            Xem trước
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {tab === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full resize-y bg-transparent px-4 py-3 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          spellCheck={false}
        />
      ) : (
        <div
          className="px-4 py-3 overflow-y-auto"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={previewComponents}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              Chưa có nội dung để xem trước...
            </p>
          )}
        </div>
      )}

      {/* ===== FOOTER HINT ===== */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border/30 bg-muted/10">
        <span className="text-[10px] text-muted-foreground/60 font-mono">
          **đậm** · _nghiêng_ · `code` · ```block``` · ## heading · &gt; quote
        </span>
        <span className="flex-1" />
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {value.length} ký tự
        </span>
      </div>
    </div>
  );
}
