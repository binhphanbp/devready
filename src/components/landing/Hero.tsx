"use client";

import { motion } from "framer-motion";
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
          className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.08]"
        >
          Sẵn sàng cho{" "}
          <br className="hidden sm:block" />
          <span className="text-gradient">buổi phỏng vấn</span>{" "}
          <br className="hidden sm:block" />
          tiếp theo của bạn
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed sm:text-lg"
        >
          Luyện tập phỏng vấn IT với{" "}
          <strong className="text-foreground">1000+ câu hỏi thực tế</strong>,
          Flashcard thông minh (SRS), và AI Mentor hỗ trợ 24/7.
          <br className="hidden sm:block" />
          Được thiết kế riêng cho thị trường IT Việt Nam.
        </motion.p>

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
