import {
  BookOpen,
  Brain,
  MessageSquareCode,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Thư viện câu hỏi thông minh",
    description:
      "1000+ câu hỏi phỏng vấn thực tế, phân loại theo FE, BE, Database, DevOps. Hỗ trợ Markdown & Syntax Highlighting.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    span: "sm:col-span-2 md:col-span-2",
  },
  {
    icon: Brain,
    title: "Flashcard SRS",
    description:
      "Hệ thống lặp lại ngắt quãng giúp ghi nhớ lâu dài. Thuật toán SM-2 tối ưu.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
    span: "sm:col-span-1 md:col-span-1",
  },
  {
    icon: MessageSquareCode,
    title: "ReadyBot — AI Mentor",
    description:
      "Chatbot AI giải thích code, luyện kỹ năng trả lời, tips phỏng vấn 24/7.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    span: "sm:col-span-1 md:col-span-1",
  },
  {
    icon: Users,
    title: "DevCommunity",
    description:
      "Chia sẻ trải nghiệm phỏng vấn thực tế. Đọc review từ các công ty IT Việt Nam.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400",
    span: "sm:col-span-2 md:col-span-2",
  },
  {
    icon: TrendingUp,
    title: "Theo dõi tiến độ",
    description:
      "Dashboard cá nhân hiển thị streak, tiến độ học, và chủ đề cần cải thiện.",
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-400",
    span: "sm:col-span-1 md:col-span-1",
  },
  {
    icon: Sparkles,
    title: "Mức độ phù hợp",
    description:
      "Phân cấp Intern → Junior → Senior. Phù hợp với mọi giai đoạn sự nghiệp.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-400",
    span: "sm:col-span-1 md:col-span-1",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <span className="text-sm font-medium text-primary">
            Tính năng nổi bật
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Mọi thứ bạn cần để{" "}
            <span className="text-gradient">ace phỏng vấn</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Từ ngân hàng câu hỏi khổng lồ đến AI mentor cá nhân — DevReady là
            bạn đồng hành hoàn hảo cho hành trình phỏng vấn IT.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${feature.span}`}
            >
              {/* Gradient bg */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
