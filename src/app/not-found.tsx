'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-6 text-center text-foreground relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative"
      >
        <h1 className="text-[120px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-primary to-electric md:text-[180px]">
          404
        </h1>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-primary/80"
        >
          <Compass size={64} strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 max-w-md"
      >
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
          Lạc đường rồi dev ơi!
        </h2>
        <p className="mb-8 text-muted-foreground">
          Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi đường dẫn hoặc hoàn toàn không tồn tại.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <Button render={<Link href="/" />} size="lg" className="group rounded-full glow-blue">
          <Home size={18} className="transition-transform group-hover:-translate-y-1" />
          Về trang chủ
        </Button>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="lg"
          className="group rounded-full bg-background/50 backdrop-blur-md"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Quay lại
        </Button>
      </motion.div>
    </div>
  );
}
