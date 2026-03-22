import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Flame, BookmarkIcon, User } from "lucide-react";

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

  const initials = (profile?.full_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Hồ sơ <span className="text-gradient">cá nhân</span>
      </h1>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.full_name || "Chưa cập nhật tên"}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile?.username || user.email?.split("@")[0]}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {profile?.role === "admin" ? "Admin" : "Người dùng"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-orange-400" />
                  {profile?.streak_count ?? 0} ngày streak
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
