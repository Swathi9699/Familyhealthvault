import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  badge,
  className = '',
}) => {
  return (
    <header className={`pb-6 border-b border-slate-200/80 mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            {action}
          </div>
        )}
      </div>
    </header>
  );
};
