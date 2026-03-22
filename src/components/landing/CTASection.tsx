"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-8 text-center sm:p-14"
        >
          {/* Dot grid */}
          <div className="absolute inset-0 bg-grid opacity-30" />

          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Rocket className="h-6 w-6 text-primary" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sẵn sàng{" "}
              <span className="text-gradient">chinh phục phỏng vấn</span>?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
              Tham gia cùng hàng nghìn bạn sinh viên và Junior Developer đang sử
              dụng DevReady để chuẩn bị cho sự nghiệp IT. Hoàn toàn miễn phí.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="glow-blue text-base px-8 h-12"
                render={<Link href="/register" />}
              >
                Tạo tài khoản miễn phí
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-base px-6 h-12"
                render={<Link href="/explore" />}
              >
                Xem câu hỏi mẫu
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
