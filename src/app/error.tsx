'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error internally
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center text-foreground relative bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/10 blur-[100px]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20 shadow-lg"
      >
        <AlertTriangle size={48} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="max-w-md"
      >
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
          Đã xảy ra sự cố!
        </h2>
        <p className="mb-8 text-muted-foreground">
          Rất xin lỗi, hệ thống của chúng tôi vừa gặp một lỗi nhỏ. Vui lòng tải lại phần này để tiếp tục trải nghiệm.
        </p>

        <Button
          onClick={() => reset()}
          size="lg"
          className="group rounded-full glow-blue"
        >
          <RotateCcw size={18} className="transition-transform group-hover:-rotate-90" />
          Thử lại
        </Button>
      </motion.div>
    </div>
  );
}
