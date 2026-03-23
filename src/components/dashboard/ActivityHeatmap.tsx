"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Flame, Zap, Eye, CalendarDays } from "lucide-react";

type DayData = {
  activity_date: string;
  view_count: number;
};

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const levelStyles = [
  "bg-muted/30 dark:bg-white/[0.04]",
  "bg-blue-200/70 dark:bg-blue-900/40",
  "bg-blue-400/60 dark:bg-blue-700/60",
  "bg-blue-500 dark:bg-blue-500/80",
  "bg-[#0055DD] dark:bg-blue-400",
];

const MONTHS_VI = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

interface ActivityHeatmapProps {
  userId: string;
  streakCount: number;
  lastActiveDate: string | null;
}

export function ActivityHeatmap({ userId, streakCount, lastActiveDate }: ActivityHeatmapProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: result } = await supabase.rpc("get_activity_heatmap", {
        p_user_id: userId,
      });
      setData((result as DayData[]) ?? []);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const totalActiveDays = data.filter(d => d.view_count > 0).length;
  const totalViews = data.reduce((sum, d) => sum + d.view_count, 0);

  // Build weeks grid
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  if (data.length > 0) {
    const firstDate = new Date(data[0].activity_date);
    const firstDayOfWeek = firstDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ activity_date: "", view_count: -1 });
    }
  }

  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    for (const day of week) {
      if (day.activity_date) {
        const month = new Date(day.activity_date).getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS_VI[month], weekIndex: weekIdx });
          lastMonth = month;
        }
        break;
      }
    }
  });

  const handleMouseEnter = (day: DayData, e: React.MouseEvent) => {
    if (!day.activity_date || day.view_count < 0) return;
    const target = e.target as HTMLElement;
    const container = target.closest(".heatmap-grid");
    if (!container) return;
    const rect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const date = new Date(day.activity_date);
    const dateStr = date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const text = day.view_count === 0
      ? `Chưa học — ${dateStr}`
      : `${day.view_count} câu đã ôn — ${dateStr}`;
    setTooltip({
      text,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 6,
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 bg-muted/50 rounded" />
          <div className="h-32 bg-muted/30 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak + Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak card */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-card/80 to-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 animate-pulse" />
              <Flame className="relative h-5.5 w-5.5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">
                {streakCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                ngày streak
              </p>
            </div>
          </div>
          {streakCount > 0 && (
            <div className="absolute -right-2 -bottom-2 opacity-[0.06]">
              <Flame className="h-20 w-20 text-orange-500" />
            </div>
          )}
        </div>

        {/* Views card */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card/80 to-cyan-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">
                {totalViews}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                câu đã ôn tập
              </p>
            </div>
          </div>
        </div>

        {/* Active days card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card/80 to-teal-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <CalendarDays className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">
                {totalActiveDays}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                ngày hoạt động
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap card */}
      <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Lịch ôn tập 365 ngày
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Ít</span>
            {levelStyles.map((style, i) => (
              <div
                key={i}
                className={cn("h-[10px] w-[10px] rounded-[3px]", style)}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">Nhiều</span>
          </div>
        </div>

        {/* Grid */}
        <div className="px-5 py-4 heatmap-grid relative overflow-x-auto">
          {/* Month labels */}
          <div className="relative h-4 ml-7 mb-1">
            {monthLabels.map((m, i) => (
              <span
                key={`${m.label}-${i}`}
                className="absolute text-[10px] font-medium text-muted-foreground"
                style={{ left: `${m.weekIndex * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1 shrink-0 pt-0">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, i) => (
                <div
                  key={i}
                  className="h-[10px] w-5 flex items-center justify-end text-[8px] text-muted-foreground/60 leading-none"
                >
                  {i % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={cn(
                      "h-[10px] w-[10px] rounded-[3px] transition-all duration-150",
                      day.view_count < 0
                        ? "bg-transparent"
                        : levelStyles[getLevel(day.view_count)],
                      day.view_count >= 0 && "hover:scale-[1.6] hover:rounded-[4px] hover:z-10 cursor-pointer"
                    )}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-50 pointer-events-none px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap shadow-xl"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              {tooltip.text}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
