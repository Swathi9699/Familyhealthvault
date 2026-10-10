import React from 'react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/lib/auth-context';
import { useVault } from '@/lib/vault-store';
import { Shield, Menu, X, Heart, Cloud, CloudCheck, LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { syncState } = useVault();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-800 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5">
                Family Health Vault AI
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-teal-500" />
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 font-normal">
                One simple place to organize your family's health information
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Cloud Sync Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Sync Status / Auth Action */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/80 text-xs text-teal-800">
                <Cloud className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-medium truncate max-w-[140px]">
                  {user.displayName || user.email?.split('@')[0] || 'Cloud Synced'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out of Cloud Vault"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer min-h-[36px]"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-700" />
              <span>Cloud Sign In</span>
            </button>
          )}

          <Link
            href="/emergency"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 transition-colors min-h-[36px]"
          >
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span className="hidden xs:inline">Emergency Info</span>
          </Link>
        </div>
      </div>

      {/* Mobile Demo Warning Banner */}
      <div className="sm:hidden bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 border-t border-amber-200/60 text-center">
        DEMO MODE — NOT REAL MEDICAL INFORMATION
      </div>
    </header>
  );
};
