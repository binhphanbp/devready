"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Terminal,
  Braces,
  Database,
  Globe,
  BookOpen,
  Brain,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const floatingIcons = [
  { icon: Terminal, x: "8%", y: "25%", delay: 0, color: "text-blue-400/20" },
  { icon: Braces, x: "88%", y: "18%", delay: 0.5, color: "text-purple-400/20" },
  { icon: Database, x: "82%", y: "72%", delay: 1, color: "text-emerald-400/20" },
  { icon: Globe, x: "12%", y: "75%", delay: 1.5, color: "text-orange-400/20" },
];

const features = [
  {
    icon: BookOpen,
    title: "1000+ câu hỏi",
    desc: "Thực tế từ phỏng vấn",
    gradient: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-500",
    position: "left-[2%] top-[30%] lg:left-[5%]",
    floatDelay: 0,
  },
  {
    icon: Brain,
    title: "Flashcard SRS",
    desc: "Ôn tập thông minh",
    gradient: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-500/20",
    iconColor: "text-purple-500",
    position: "right-[2%] top-[25%] lg:right-[5%]",
    floatDelay: 0.8,
  },
  {
    icon: MessageSquare,
    title: "AI Mentor",
    desc: "Hỗ trợ 24/7",
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500",
    position: "left-[5%] bottom-[18%] lg:left-[10%]",
    floatDelay: 1.2,
  },
  {
    icon: Sparkles,
    title: "50+ công ty",
    desc: "Câu hỏi thực tế",
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-500",
    position: "right-[5%] bottom-[22%] lg:right-[10%]",
    floatDelay: 1.6,
  },
];

const interviewQuestions = [
  {
    q: "Giải thích sự khác nhau giữa let, const và var trong JavaScript?",
    tag: "JavaScript",
    difficulty: "Easy",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    hint: "// Scope, hoisting, và reassignment",
    code: `let x = 1;    // block-scoped, reassignable
const y = 2;  // block-scoped, immutable ref
var z = 3;    // function-scoped, hoisted`,
  },
  {
    q: "React Virtual DOM hoạt động như thế nào?",
    tag: "React",
    difficulty: "Medium",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    hint: "// Reconciliation & Diffing Algorithm",
    code: `// 1. State changes → new Virtual DOM
// 2. Diff old vs new VDOM (O(n))
// 3. Batch update real DOM`,
  },
  {
    q: "REST API và GraphQL khác nhau ở điểm nào?",
    tag: "Backend",
    difficulty: "Medium",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    hint: "// Data fetching approach",
    code: `// REST: Multiple endpoints, fixed data
// GraphQL: Single endpoint, flexible
//   → No over/under-fetching`,
  },
  {
    q: "Indexing trong Database cải thiện performance ra sao?",
    tag: "Database",
    difficulty: "Hard",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    hint: "// B-Tree, Hash Index, Composite",
    code: `CREATE INDEX idx_user_email
  ON users(email);
-- O(n) → O(log n) lookup time`,
  },
];

const topicSidebar = [
  { label: "JavaScript", count: 120, active: true },
  { label: "React", count: 95 },
  { label: "Node.js", count: 78 },
  { label: "SQL", count: 65 },
  { label: "System Design", count: 42 },
];

function InterviewPreview() {
  const [currentQ, setCurrentQ] = useState(0);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCode(false);
      setTimeout(() => {
        setCurrentQ((prev) => (prev + 1) % interviewQuestions.length);
      }, 100);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Show code hint after 1.5s of each question
  useEffect(() => {
    const timer = setTimeout(() => setShowCode(true), 1500);
    return () => clearTimeout(timer);
  }, [currentQ]);

  const question = interviewQuestions[currentQ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="mt-10 mx-auto max-w-4xl"
    >
      <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-2xl shadow-black/8 dark:shadow-black/25 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="ml-2 text-[11px] text-muted-foreground font-mono">
              devready — interview-session
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400/80 font-medium">Live</span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar — topics */}
          <div className="hidden sm:flex flex-col w-[140px] border-r border-border/30 bg-muted/10 py-2">
            {topicSidebar.map((topic) => (
              <div
                key={topic.label}
                className={`flex items-center justify-between px-3 py-1.5 text-[11px] transition-colors ${
                  topic.active
                    ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{topic.label}</span>
                <span className="text-[9px] text-muted-foreground/60">{topic.count}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Question area */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono text-muted-foreground/50">
                  Q{currentQ + 1}/{interviewQuestions.length}
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {question.tag}
                </span>
                <span
                  className={`inline-flex items-center rounded-full ${question.bgColor} px-2 py-0.5 text-[10px] font-semibold ${question.color}`}
                >
                  {question.difficulty}
                </span>
              </div>

              <div className="min-h-[28px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`q-${currentQ}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="text-sm sm:text-[15px] font-semibold text-foreground leading-snug"
                  >
                    {question.q}
                    <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Code hint area — fixed height to prevent layout shift */}
            <div className="px-5 pb-4">
              <div className="h-[90px] relative">
                <AnimatePresence>
                  {showCode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <div className="rounded-lg bg-muted/40 border border-border/30 p-3">
                        <p className="text-[10px] text-muted-foreground/60 font-mono mb-1.5">
                          {question.hint}
                        </p>
                        <pre className="text-[11px] sm:text-xs font-mono text-muted-foreground leading-relaxed">
                          {question.code.split("\n").map((line, i) => (
                            <motion.div
                              key={`${currentQ}-${i}`}
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1, duration: 0.2 }}
                            >
                              {line}
                            </motion.div>
                          ))}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/30 bg-muted/10">
              <div className="flex items-center gap-1.5">
                {interviewQuestions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentQ ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  Xem đáp án
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">
                  Flashcard
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">
                  Tiếp →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-[#0066FF]/[0.06] blur-[140px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[300px] w-[400px] rounded-full bg-purple-500/[0.04] blur-[100px]" />
        <div className="absolute top-[30%] right-[10%] h-[250px] w-[250px] rounded-full bg-[#00AAFF]/[0.04] blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Floating tech icons */}
      {floatingIcons.map(({ icon: Icon, x, y, delay, color }) => (
        <motion.div
          key={color}
          className={`absolute hidden lg:block ${color}`}
          style={{ left: x, top: y }}
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon className="h-7 w-7" />
        </motion.div>
      ))}

      {/* Floating feature cards */}
      {features.map((feature) => (
        <motion.div
          key={feature.title}
          className={`absolute hidden lg:flex ${feature.position}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 + feature.floatDelay }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4 + feature.floatDelay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`flex items-center gap-3 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-md px-4 py-3 shadow-lg`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-background/60 ${feature.iconColor}`}>
              <feature.icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">
                {feature.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Main content — centered */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
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
          className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl !leading-[1.1]"
        >
          Sẵn sàng cho <span className="text-gradient">buổi phỏng vấn</span>
          <br className="hidden sm:block" />
          tiếp theo của bạn
        </motion.h1>

        {/* Interactive Interview Preview */}
        <InterviewPreview />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] hover:from-[#0055DD] hover:to-[#0044CC] text-white border-0 text-base px-8 h-12 font-semibold shadow-lg shadow-[#0066FF]/20"
            render={<Link href="/register" />}
          >
            Bắt đầu miễn phí
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 h-12 font-medium"
            render={<Link href="/explore" />}
          >
            Khám phá câu hỏi
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 inline-flex items-center gap-6 sm:gap-10 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm px-8 py-4 shadow-sm"
        >
          {[
            { value: "1000+", label: "Câu hỏi" },
            { value: "6", label: "Chủ đề" },
            { value: "24/7", label: "AI Mentor" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-4">
              {i > 0 && <div className="h-8 w-px bg-border/50" />}
              <div className={i > 0 ? "pl-2" : ""}>
                <div className="text-xl sm:text-2xl font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
