import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/navigation';
import { useVault } from '@/lib/vault-store';
import {
  Users,
  FileText,
  Pill,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Shield,
  FileCheck,
  Stethoscope,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    members,
    documents,
    medications,
    appointments,
    settings,
    toggleMedicationTaken,
  } = useVault();

  const upcomingAppointments = appointments
    .filter((a) => !a.completed)
    .slice(0, 3);

  const activeMedications = medications.filter(
    (m) => m.status === 'active' || m.status === 'as-needed'
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        badge={<DemoBadge variant="subtle" />}
        title={`${settings.familyName || 'Family'} Health Overview`}
        description="A quiet, unified overview of your household's health records, active prescriptions, and upcoming checkups."
        action={
          <div className="flex items-center gap-2">
            <Link href="/emergency">
              <Button variant="danger" size="sm">
                <Heart className="w-3.5 h-3.5 mr-1.5 fill-white" />
                Emergency Card
              </Button>
            </Link>
          </div>
        }
      />

      {/* Prominent Demo Notice */}
      {settings.showDemoNotice && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              DEMO MODE — NOT REAL MEDICAL INFORMATION
            </span>
            <span className="hidden md:inline text-amber-800">
              · All names, dates, and dosages shown are fictional sample items. Changes persist in your browser vault.
            </span>
          </div>
          <span className="text-xs bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-mono">
            Interactive Vault
          </span>
        </div>
      )}

      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Family Members"
          value={members.length}
          label="Profiles"
          icon={<Users className="w-5 h-5 text-teal-700" />}
          href="/family"
          note={members.map((m) => m.name.split(' ')[0]).slice(0, 4).join(', ') || 'No members'}
          accentColor="teal"
        />

        <StatCard
          title="Documents"
          value={documents.length}
          label="Records"
          icon={<FileText className="w-5 h-5 text-sky-700" />}
          href="/documents"
          note="Immunizations, labs & notes"
          accentColor="sky"
        />

        <StatCard
          title="Medicines"
          value={activeMedications.length}
          label="Active"
          icon={<Pill className="w-5 h-5 text-amber-700" />}
          href="/medicines"
          note={`${medications.filter((m) => m.takenToday).length} taken today`}
          accentColor="amber"
        />

        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          label="Scheduled"
          icon={<Calendar className="w-5 h-5 text-indigo-700" />}
          href="/appointments"
          note={upcomingAppointments[0] ? `Next: ${upcomingAppointments[0].date}` : 'None scheduled'}
          accentColor="indigo"
        />
      </div>

      {/* Detailed Section: Family Profiles & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Member Cards (2 columns on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Family Profiles</CardTitle>
                <CardDescription>
                  Household members and basic health tags
                </CardDescription>
              </div>
              <Link href="/family">
                <Button variant="ghost" size="sm" className="text-teal-700">
                  Manage all
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${member.avatarColor}`}
                        >
                          {member.name.charAt(0)}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {member.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {member.role} · {member.age} yrs
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {member.bloodType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/50">
                      <span>
                        Allergies:{' '}
                        <strong className="text-slate-900">{member.allergies.length}</strong>
                      </span>
                      <span>
                        Conditions:{' '}
                        <strong className="text-slate-900">{member.chronicConditions.length}</strong>
                      </span>
                      <Link
                        href="/family"
                        className="text-teal-700 hover:text-teal-800 font-medium"
                      >
                        Profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sample Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Health Documents & Records</CardTitle>
                <CardDescription>
                  Recent laboratory records and clinical records
                </CardDescription>
              </div>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="text-teal-700">
                  Open Vault
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              {documents.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No documents added yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {documents.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {doc.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {doc.familyMemberName} · {doc.category} · {doc.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {doc.fileType} · {doc.size}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column: Appointments & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Visits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Visits</CardTitle>
              <CardDescription>Scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-slate-50 text-xs text-slate-500 border border-dashed border-slate-200">
                  No upcoming appointments scheduled.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-teal-800 mb-1">
                        <span>{apt.type}</span>
                        <span className="text-slate-500 font-normal">{apt.time}</span>
                      </div>
                      <div className="font-medium text-slate-900 text-sm">{apt.provider}</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        For: <strong className="text-slate-800">{apt.familyMemberName}</strong>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{apt.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link href="/appointments" className="w-full block">
                  <Button variant="outline" size="sm" fullWidth>
                    All Appointments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Active Medicines Summary with Quick Checkoff */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Today's Medicines</CardTitle>
              <CardDescription>Track daily doses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {activeMedications.slice(0, 4).map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-lg border border-slate-200/60 bg-white text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{med.name}</div>
                      <div className="text-slate-500 mt-0.5">
                        {med.familyMemberName} · {med.dosage}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMedicationTaken(med.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                        med.takenToday
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${med.takenToday ? 'text-teal-700' : 'text-slate-400'}`} />
                      {med.takenToday ? 'Taken' : 'Take'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link href="/medicines" className="w-full block">
                  <Button variant="outline" size="sm" fullWidth>
                    Manage Prescriptions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Doctor Summary Card */}
          <Card className="bg-teal-50/50 border-teal-200/70">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Preparing for a Doctor Visit?
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Generate a one-page clinical summary containing current meds, allergies, and recent symptoms.
                  </p>
                  <Link href="/doctor-summary" className="inline-block mt-3">
                    <Button variant="secondary" size="sm">
                      Doctor Visit Summary
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
