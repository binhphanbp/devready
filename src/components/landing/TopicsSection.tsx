"use client";

import { motion } from "framer-motion";
import { Code2, Database, Server, Cloud, MessageCircle } from "lucide-react";

const topics = [
  {
    icon: Code2,
    name: "Frontend",
    questions: "350+",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Server,
    name: "Backend",
    questions: "280+",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Database,
    name: "Database",
    questions: "150+",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Cloud,
    name: "DevOps",
    questions: "120+",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: MessageCircle,
    name: "Soft Skills",
    questions: "100+",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

export function TopicsSection() {
  return (
    <section className="py-24 sm:py-32 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary"
          >
            Chủ đề phỏng vấn
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Bao phủ <span className="text-gradient">mọi lĩnh vực</span> IT
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
        >
          {topics.map((topic, i) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${topic.bg} transition-transform duration-300 group-hover:scale-110`}
              >
                <topic.icon className={`h-6 w-6 ${topic.color}`} />
              </div>
              <h3 className="font-semibold">{topic.name}</h3>
              <span className="text-xs text-muted-foreground">
                {topic.questions} câu hỏi
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
