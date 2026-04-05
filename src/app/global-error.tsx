'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground antialiased relative">
        <div className="absolute top-1/2 left-1/2 -z-10 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/10 blur-[100px]" />

        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20 shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        <div className="max-w-md">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">Đã xảy ra sự cố nghiêm trọng!</h2>
          <p className="mb-8 text-muted-foreground">
            Hệ thống gặp lỗi ở cấp độ toàn cục. Vui lòng tải lại trang.
          </p>

          <button
            onClick={() => reset()}
            className="glow-blue gap-1.5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Tải lại trang
          </button>
        </div>
      </body>
    </html>
  );
}
