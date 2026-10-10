import React from 'react';
import { Link, usePathname } from '@/lib/navigation';
import { RoutePath } from '@/types';
import { useVault } from '@/lib/vault-store';
import {
  LayoutDashboard,
  Users,
  FileText,
  Pill,
  Calendar,
  AlertCircle,
  Stethoscope,
  Settings,
  Home,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: RoutePath;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const currentPath = usePathname();
  const { settings, members, medications } = useVault();

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Family', href: '/family', icon: Users },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Medicines', href: '/medicines', icon: Pill },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Emergency', href: '/emergency', icon: AlertCircle, tag: 'Vital' },
    { name: 'Doctor Visit', href: '/doctor-summary', icon: Stethoscope },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Household Vault Badge */}
        <div className="px-3.5 py-3 rounded-xl bg-slate-100/80 border border-slate-200/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="truncate">{settings.familyName || 'Family Vault'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {members.length} {members.length === 1 ? 'member' : 'members'} · {medications.length} active meds
          </p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span
                    className={`text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-teal-800/80 text-teal-100'
                        : item.tag === 'Vital'
                        ? 'bg-rose-100 text-rose-700'
                        : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom helper */}
      <div className="pt-6 border-t border-slate-200/80 space-y-3">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Landing Page</span>
        </Link>
        <div className="px-3 text-[11px] text-slate-500 leading-tight">
          Phase 2 Interactive Vault
          <br />
          Private browser-persisted storage.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200/80 p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-4 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <span className="font-semibold text-slate-900 text-sm">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">{navContent}</div>
      </div>
    </>
  );
};
