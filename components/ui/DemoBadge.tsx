import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DemoBadgeProps {
  variant?: 'banner' | 'pill' | 'subtle';
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ variant = 'pill', className = '' }) => {
  if (variant === 'banner') {
    return (
      <aside
        aria-label="Demo status"
        className={`w-full bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-xs font-medium text-amber-900 flex items-center justify-center gap-2 ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
        <span>DEMO MODE — NOT REAL MEDICAL INFORMATION</span>
      </aside>
    );
  }

  if (variant === 'subtle') {
    return (
      <div
        role="status"
        aria-label="Demo information disclaimer"
        className={`inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60 font-medium ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
        <span>DEMO MODE — NOT REAL MEDICAL INFORMATION</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Demo information disclaimer"
      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-amber-800 bg-amber-100/70 border border-amber-200 px-2.5 py-0.5 rounded-md ${className}`}
    >
      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
      <span>DEMO MODE — NOT REAL MEDICAL INFORMATION</span>
    </div>
  );
};
