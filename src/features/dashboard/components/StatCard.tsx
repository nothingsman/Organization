import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-xl border border-outline-variant", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">{label}</span>
        <div className="p-2 bg-surface-container rounded-lg">
          <Icon className="w-5 h-5 text-primary-navy" />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-bold tracking-tight text-primary-navy">{value}</h4>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
