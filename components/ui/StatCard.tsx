import React, { ReactNode } from 'react';
import { Card } from './Card';
import { Link } from '@/lib/navigation';
import { RoutePath } from '@/types';
import { ChevronRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: ReactNode;
  href?: RoutePath;
  note?: string;
  accentColor?: 'teal' | 'sky' | 'amber' | 'rose' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  label,
  icon,
  href,
  note,
  accentColor = 'teal',
}) => {
  const accentStyles = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200/60',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  };

  const content = (
    <Card hoverEffect={!!href} className="p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs sm:text-sm font-medium text-slate-500">{title}</span>
          <div className={`p-2.5 rounded-xl border ${accentStyles[accentColor]} shrink-0`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
            {value}
          </span>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">{label}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-normal">{note || 'Demo preview'}</span>
        {href && (
          <span className="inline-flex items-center gap-1 font-medium text-teal-700 hover:text-teal-800">
            View details
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
};
