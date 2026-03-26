import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Brain,
  Flame,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { count: viewedCount } = await supabase
    .from('question_views')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: bookmarkCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: deckCount } = await supabase
    .from('flashcard_decks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const stats = [
    {
      title: 'Đã xem',
      value: viewedCount ?? 0,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Đã lưu',
      value: bookmarkCount ?? 0,
      icon: Star,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Bộ Flashcard',
      value: deckCount ?? 0,
      icon: Brain,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Streak',
      value: `${profile?.streak_count ?? 0} ngày`,
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ];

  const quickActions = [
    {
      title: 'Luyện phỏng vấn',
      description: 'Bắt đầu với câu hỏi ngẫu nhiên',
      href: '/explore',
      icon: Target,
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Flashcard hôm nay',
      description: 'Ôn tập theo lịch SRS',
      href: '/flashcards',
      icon: Brain,
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Đọc review',
      description: 'Trải nghiệm phỏng vấn thực tế',
      href: '/community',
      icon: TrendingUp,
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
  ];

  return (
    <div className="space-y-8 pt-8 lg:pt-0">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Xin chào,{' '}
          <span className="text-gradient">
            {profile?.full_name || user.email?.split('@')[0]}
          </span>
          ! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Hãy tiếp tục luyện tập và chinh phục buổi phỏng vấn IT tiếp theo.
        </p>
      </div>

      {/* Stats Grid (Bento) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-border/50 bg-card/50 hover:border-primary/20 transition-colors"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap
        userId={user.id}
        streakCount={profile?.streak_count ?? 0}
        lastActiveDate={profile?.last_active_date ?? null}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Bắt đầu nhanh</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group relative overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <CardContent className="relative p-6">
                  <action.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
