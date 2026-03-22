"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Terminal, Braces, Database, Globe } from "lucide-react";
import Link from "next/link";

const floatingIcons = [
  { icon: Terminal, x: "10%", y: "20%", delay: 0, color: "text-blue-400/30" },
  { icon: Braces, x: "85%", y: "15%", delay: 0.5, color: "text-purple-400/30" },
  { icon: Database, x: "80%", y: "75%", delay: 1, color: "text-emerald-400/30" },
  { icon: Globe, x: "15%", y: "80%", delay: 1.5, color: "text-orange-400/30" },
];

const codeSnippet = `// DevReady — Ace your interview 🚀
function prepare(topic: string) {
  const questions = getQuestions(topic);
  const flashcards = generateSRS(topic);
  
  return {
    questions,    // 1000+ câu hỏi
    flashcards,   // Spaced Repetition
    aiMentor: true // 24/7 support
  };
}`;

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orb */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#0066FF]/[0.07] blur-[120px]" />
        {/* Secondary orb */}
        <div className="absolute bottom-[5%] right-[10%] h-[400px] w-[400px] rounded-full bg-[#00AAFF]/[0.05] blur-[100px]" />
        <div className="absolute top-[40%] left-[5%] h-[300px] w-[300px] rounded-full bg-purple-500/[0.04] blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Floating tech icons */}
      {floatingIcons.map(({ icon: Icon, x, y, delay, color }) => (
        <motion.div
          key={color}
          className={`absolute hidden lg:block ${color}`}
          style={{ left: x, top: y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        >
          <Icon className="h-8 w-8" />
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/5 px-4 py-1.5 text-xs font-semibold text-[#0066FF] dark:text-[#4D9FFF]">
                <Zap className="h-3 w-3" />
                Miễn phí cho sinh viên
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl !leading-[1.1]"
            >
              Sẵn sàng cho{" "}
              <span className="text-gradient">buổi phỏng vấn</span>{" "}
              tiếp theo của bạn
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg lg:mx-0 mx-auto"
            >
              Luyện tập phỏng vấn IT với{" "}
              <strong className="text-foreground">1000+ câu hỏi thực tế</strong>,
              Flashcard thông minh (SRS), và AI Mentor hỗ trợ 24/7. Được thiết kế
              riêng cho thị trường IT Việt Nam.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center"
            >
              <Button
                size="lg"
                className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] hover:from-[#0055DD] hover:to-[#0044CC] text-white border-0 text-base px-7 h-12 font-semibold"
                render={<Link href="/register" />}
              >
                Bắt đầu miễn phí
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-7 h-12 font-medium"
                render={<Link href="/explore" />}
              >
                Khám phá câu hỏi
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex items-center gap-8 lg:justify-start justify-center"
            >
              {[
                { value: "1000+", label: "Câu hỏi" },
                { value: "50+", label: "Công ty" },
                { value: "24/7", label: "AI Mentor" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3">
                  {i > 0 && (
                    <div className="h-8 w-px bg-border/50" />
                  )}
                  <div className={i > 0 ? "pl-3" : ""}>
                    <div className="text-2xl font-bold text-gradient">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Code preview card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            {/* Main card */}
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  interview-prep.ts
                </span>
              </div>
              {/* Code content */}
              <div className="p-5">
                <pre className="text-sm font-mono leading-relaxed text-muted-foreground overflow-hidden">
                  <code>
                    {codeSnippet.split("\n").map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                        className="whitespace-pre"
                      >
                        <span className="text-muted-foreground/40 select-none mr-4 inline-block w-4 text-right">
                          {i + 1}
                        </span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(line),
                          }}
                        />
                      </motion.div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Floating badges around the card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm px-3 py-2 shadow-lg"
            >
              <span className="text-sm font-semibold flex items-center gap-1.5">
                🎯 <span className="text-gradient">Frontend</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                350+ câu hỏi
              </span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-3 -left-4 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm px-3 py-2 shadow-lg"
            >
              <span className="text-sm font-semibold flex items-center gap-1.5">
                🤖 <span className="text-gradient">AI Mentor</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                Hỗ trợ 24/7
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

function highlightCode(line: string): string {
  return line
    .replace(/\/\/.*/g, (m) => `<span style="color: oklch(0.55 0.02 260)">${m}</span>`)
    .replace(
      /\b(function|const|return|true)\b/g,
      (m) => `<span style="color: oklch(0.7 0.2 300)">${m}</span>`
    )
    .replace(
      /\b(string)\b/g,
      (m) => `<span style="color: oklch(0.7 0.15 180)">${m}</span>`
    )
    .replace(
      /(["'`])(.*?)\1/g,
      (m) => `<span style="color: oklch(0.7 0.18 140)">${m}</span>`
    );
}
