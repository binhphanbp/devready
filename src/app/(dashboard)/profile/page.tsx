import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Calendar,
  Flame,
  BookmarkIcon,
  User,
  BookOpen,
  Brain,
  MessageSquare,
} from "lucide-react";
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

  const stats = [
    { label: "Câu hỏi đã lưu", value: bookmarkCount ?? 0, icon: BookmarkIcon, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Bộ flashcard", value: deckCount ?? 0, icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Reviews", value: reviewCount ?? 0, icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Streak", value: `${profile?.streak_count ?? 0} ngày`, icon: Flame, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Hồ sơ <span className="text-gradient">cá nhân</span>
      </h1>

      {/* Profile card */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#0066FF]/20 to-purple-500/20" />
        <CardContent className="p-6 -mt-10">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#0055DD] text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold">
                {profile?.full_name || "Chưa cập nhật tên"}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile?.username || user.email?.split("@")[0]}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs mb-1">
              {profile?.role === "admin" ? "👨‍💻 Admin" : "🎓 Người dùng"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} shrink-0`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account info */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator className="opacity-50" />
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Ngày tham gia</p>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" render={<Link href="/flashcards" />}>
          <Brain className="h-5 w-5 text-purple-400" />
          <span className="text-xs">Flashcards</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" render={<Link href="/explore" />}>
          <BookOpen className="h-5 w-5 text-blue-400" />
          <span className="text-xs">Khám phá</span>
        </Button>
      </div>
    </div>
  );
}
