"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Flame, Calendar, TrendingUp } from "lucide-react";

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

const levelColors = [
  "bg-muted/40 dark:bg-muted/20",
  "bg-emerald-200 dark:bg-emerald-900/60",
  "bg-emerald-400 dark:bg-emerald-700/80",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-600 dark:bg-emerald-400",
];

const MONTHS_VI = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
const DAYS_VI = ["", "T2", "", "T4", "", "T6", ""];

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

  // Compute stats
  const totalActiveDays = data.filter(d => d.view_count > 0).length;
  const totalViews = data.reduce((sum, d) => sum + d.view_count, 0);

  // Build the grid: 53 weeks x 7 days
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  // Pad the first week with empty slots
  if (data.length > 0) {
    const firstDate = new Date(data[0].activity_date);
    const firstDayOfWeek = firstDate.getDay(); // 0=Sun
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ activity_date: "", view_count: -1 }); // placeholder
    }
  }

  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    for (const day of week) {
      if (day.activity_date) {
        const d = new Date(day.activity_date);
        const month = d.getMonth();
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
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = (e.target as HTMLElement).closest(".heatmap-container")?.getBoundingClientRect();
    if (!containerRect) return;
    const date = new Date(day.activity_date);
    const dateStr = date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const text = day.view_count === 0
      ? `Không có hoạt động — ${dateStr}`
      : `${day.view_count} câu hỏi đã xem — ${dateStr}`;
    setTooltip({
      text,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 bg-muted/50 rounded" />
          <div className="h-28 bg-muted/30 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
            <Flame className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Hoạt động học tập</h3>
            <p className="text-xs text-muted-foreground">
              {totalViews} câu hỏi đã xem trong 365 ngày qua
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="font-semibold text-foreground">{streakCount}</span>
            <span className="text-muted-foreground">ngày streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-foreground">{totalActiveDays}</span>
            <span className="text-muted-foreground">ngày hoạt động</span>
          </div>
          {totalActiveDays > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-semibold text-foreground">
                {Math.round(totalViews / Math.max(totalActiveDays, 1))}
              </span>
              <span className="text-muted-foreground">câu/ngày</span>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="px-6 py-4 heatmap-container relative overflow-x-auto">
        {/* Month labels */}
        <div className="flex ml-8 mb-1.5">
          {monthLabels.map((m, i) => (
            <div
              key={`${m.label}-${i}`}
              className="text-[10px] text-muted-foreground"
              style={{
                position: "absolute",
                left: `${m.weekIndex * 15 + 32}px`,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5 mt-5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1.5 shrink-0">
            {DAYS_VI.map((day, i) => (
              <div
                key={i}
                className="h-[11px] w-5 flex items-center justify-end text-[9px] text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-0.5">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={cn(
                    "h-[11px] w-[11px] rounded-[2px] transition-colors duration-150",
                    day.view_count < 0
                      ? "bg-transparent"
                      : levelColors[getLevel(day.view_count)],
                    day.view_count >= 0 && "hover:ring-1 hover:ring-foreground/20 cursor-pointer"
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
            className="absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap shadow-lg"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltip.text}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"
            />
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground">Ít</span>
          {levelColors.map((color, i) => (
            <div
              key={i}
              className={cn("h-[11px] w-[11px] rounded-[2px]", color)}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">Nhiều</span>
        </div>
      </div>
    </div>
  );
}
