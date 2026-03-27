'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/5',
    icon: 'bg-blue-500/20 text-blue-400',
    text: 'text-blue-400',
  },
  green: {
    bg: 'from-emerald-500/20 to-emerald-600/5',
    icon: 'bg-emerald-500/20 text-emerald-400',
    text: 'text-emerald-400',
  },
  orange: {
    bg: 'from-orange-500/20 to-orange-600/5',
    icon: 'bg-orange-500/20 text-orange-400',
    text: 'text-orange-400',
  },
  red: {
    bg: 'from-red-500/20 to-red-600/5',
    icon: 'bg-red-500/20 text-red-400',
    text: 'text-red-400',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/5',
    icon: 'bg-purple-500/20 text-purple-400',
    text: 'text-purple-400',
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br p-5',
        colors.bg,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs',
                trend.value >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5', colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
