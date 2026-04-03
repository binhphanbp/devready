'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Đã xảy ra lỗi!</h2>
          <p className="mb-6 text-zinc-400">{error.message || 'Vui lòng thử lại.'}</p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
