import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Calendar,
  Flame,
  BookmarkIcon,
  BookOpen,
  Brain,
  MessageSquare,
  ArrowRight,
  Target,
  TrendingUp,
  Shield,
  Zap,
  School,
  Briefcase,
} from "lucide-react";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import {
  MAJOR_OPTIONS,
  TARGET_ROLE_OPTIONS,
  EDUCATION_YEARS_OPTIONS,
} from "@/lib/constants/profile-options";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: bookmarkCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: viewedCount } = await supabase
    .from("question_views")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: deckCount } = await supabase
    .from("flashcard_decks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: reviewCount } = await supabase
    .from("community_reviews")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id);

  const initials = (profile?.full_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(user.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Câu hỏi đã xem",
      value: viewedCount ?? 0,
      icon: BookOpen,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Câu hỏi đã lưu",
      value: bookmarkCount ?? 0,
      icon: BookmarkIcon,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Bộ flashcard",
      value: deckCount ?? 0,
      icon: Brain,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Bài review",
      value: reviewCount ?? 0,
      icon: MessageSquare,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  const quickActions = [
    {
      title: "Luyện phỏng vấn",
      description: "Khám phá 1000+ câu hỏi",
      href: "/explore",
      icon: Target,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Flashcards",
      description: "Ôn tập theo lịch SRS",
      href: "/flashcards",
      icon: Brain,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Cộng đồng",
      description: "Chia sẻ kinh nghiệm",
      href: "/community",
      icon: TrendingUp,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 lg:pt-0">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
        Hồ sơ <span className="text-gradient">cá nhân</span>
      </h1>

      {/* Profile Hero Card */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        {/* Banner gradient */}
        <div className="relative h-28 sm:h-36 bg-gradient-to-br from-[#0066FF]/30 via-purple-500/20 to-cyan-500/15 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.6_0.24_260_/_15%),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-card shadow-xl ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#0055DD] text-white text-lg sm:text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-1">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                  {profile?.full_name || "Chưa cập nhật tên"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{profile?.username || user.email?.split("@")[0]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {profile?.role === "admin" && (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {(profile?.streak_count ?? 0) > 0 && (
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
                    <Flame className="h-3 w-3 mr-1" />
                    {profile?.streak_count} ngày streak
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`border-border/50 ${stat.borderColor} bg-card/50 hover:border-opacity-50 transition-colors`}
          >
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} shrink-0`}
                >
                  <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Account Info */}
        <Card className="border-border/50 bg-card/50">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border/40 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Thông tin tài khoản</h3>
          </div>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                <Mail className="h-4 w-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
            <Separator className="opacity-30" />
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                <p className="text-sm font-medium">{joinDate}</p>
              </div>
            </div>
            <Separator className="opacity-30" />
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 shrink-0">
                <Flame className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak hiện tại</p>
                <p className="text-sm font-medium">
                  {profile?.streak_count ?? 0} ngày liên tiếp
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card/50">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border/40 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Truy cập nhanh</h3>
          </div>
          <CardContent className="p-3 sm:p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3.5 rounded-xl p-3 transition-all hover:bg-muted/50 active:scale-[0.98]"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shrink-0`}
                >
                  <action.icon className={`h-4.5 w-4.5 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
