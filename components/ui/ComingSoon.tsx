import React, { ReactNode } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { DemoBadge } from './DemoBadge';
import { Link } from '@/lib/navigation';
import { LayoutDashboard, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  category: string;
  description: string;
  plannedFeatures: string[];
  icon: ReactNode;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  category,
  description,
  plannedFeatures,
  icon,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <DemoBadge variant="pill" />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 pb-8 border-b border-slate-100">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 shrink-0">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Phase 2 Feature Roadmap · {category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-5 sm:p-6 border border-slate-200/70 mb-8">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Planned Functionality for Upcoming Phases:
            </h2>
            <ul className="space-y-2.5">
              {plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              <span>Foundation shell active</span>
              <span className="mx-2">·</span>
              <span>Cloud storage & Auth in Phase 2</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto" size="md">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
