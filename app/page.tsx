import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { Link } from '@/lib/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Shield,
  Users,
  FileText,
  Pill,
  Calendar,
  AlertCircle,
  ArrowRight,
  Lock,
  HeartHandshake,
  CheckCircle,
  Cloud,
} from 'lucide-react';
import { DEMO_FAMILY_MEMBERS, DEMO_DOCUMENTS, DEMO_MEDICATIONS, DEMO_APPOINTMENTS } from '@/lib/demo-data';

export default function LandingPage() {
  const scrollToPreview = () => {
    const el = document.getElementById('dashboard-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { user, openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Banner Disclaimer */}
      <DemoBadge variant="banner" />

      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              Family Health Vault AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <Button onClick={openAuthModal} variant="ghost" size="sm">
                Cloud Sign In
              </Button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/80 text-xs text-teal-800">
                <Cloud className="w-3.5 h-3.5 text-teal-600" />
                <span>{user.displayName || user.email?.split('@')[0]}</span>
              </span>
            )}
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Open Vault
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-medium text-teal-800 mb-6">
            <HeartHandshake className="w-4 h-4 text-teal-700" />
            <span>One simple place to organize your family's health information.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 text-balance leading-tight sm:leading-tight">
            Your family's health information, organized in one place.
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
            Keep important health information organized in one simple place.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToPreview}
              className="w-full sm:w-auto"
            >
              See How It Works
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-700" /> Private household vault
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-teal-700" /> Clean, accessible design
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-700" /> Prepared for emergencies
            </span>
          </div>
        </section>

        {/* Core Pillars / Value Points (Honest, trustworthy, no fake stats/testimonials) */}
        <section className="py-12 bg-white border-y border-slate-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Designed for everyday family caregiving
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                A single calm space replacing scattered binders, text threads, and doctor portals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Profiles for Everyone
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Keep profiles for kids, partners, or aging parents with allergies, blood type, and primary care contacts at a glance.
                </p>
              </Card>

              <Card className="p-6 border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Central Health Records
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Organize vaccination records, school medical forms, and lab reports without rummaging through filing cabinets.
                </p>
              </Card>

              <Card className="p-6 border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center mb-4">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Emergency Readiness
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Quick access to vital numbers, medication dosages, and allergies when a doctor or caregiver needs them immediately.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="dashboard-preview" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <DemoBadge variant="subtle" className="mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Modern Dashboard Preview
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Preview how Family Health Vault AI organizes health records using sample fictional records.
            </p>
          </div>

          {/* Interactive Preview Container */}
          <div className="rounded-2xl border border-slate-300/80 bg-slate-100 p-2 sm:p-4 shadow-sm">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 lg:p-8">
              {/* Dashboard Preview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    Household Overview
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Vance Family Health Vault
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Demo Mode · Sample records for Eleanor, David, Maya, and Leo
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button size="sm" variant="secondary">
                    Open Full Dashboard
                  </Button>
                </Link>
              </div>

              {/* Sample Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Family Members</span>
                    <Users className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {DEMO_FAMILY_MEMBERS.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Active profiles</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Documents</span>
                    <FileText className="w-4 h-4 text-sky-700" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {DEMO_DOCUMENTS.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Sample records</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Medicines</span>
                    <Pill className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {DEMO_MEDICATIONS.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Prescriptions tracked</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Upcoming</span>
                    <Calendar className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {DEMO_APPOINTMENTS.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Visits scheduled</div>
                </div>
              </div>

              {/* Sample Two-Column Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    Family Profiles (Fictional Demo)
                  </h4>
                  <div className="space-y-2">
                    {DEMO_FAMILY_MEMBERS.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${member.avatarColor}`}
                          >
                            {member.name.charAt(0)}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800">{member.name}</span>
                            <span className="text-slate-600 ml-1.5 text-[11px]">· {member.role} ({member.age}y)</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {member.bloodType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    Next Upcoming Visits
                  </h4>
                  <div className="space-y-2">
                    {DEMO_APPOINTMENTS.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{apt.type}</span>
                          <span className="text-teal-700 font-medium">{apt.date}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {apt.familyMemberName} · {apt.provider}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enter Button */}
              <div className="mt-6 text-center">
                <Link href="/dashboard">
                  <Button variant="primary" size="md">
                    Explore Interactive Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-700" />
            <span className="font-semibold text-slate-800">Family Health Vault AI</span>
            <span className="text-slate-400">·</span>
            <span>Phase 2 Interactive Vault</span>
          </div>
          <div>
            DEMO MODE — NOT REAL MEDICAL INFORMATION. Intended for demonstration purposes only.
          </div>
        </div>
      </footer>
    </div>
  );
}
