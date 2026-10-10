import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import {
  Heart,
  AlertTriangle,
  Phone,
  Printer,
  Copy,
  Check,
  Building2,
  ShieldAlert,
  Pill,
  User,
  Info,
} from 'lucide-react';

export default function EmergencyPage() {
  const { members, medications, settings } = useVault();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const memberMeds = selectedMember
    ? medications.filter((m) => m.memberId === selectedMember.id && m.status === 'active')
    : [];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopySummary = () => {
    if (!selectedMember) return;

    const summaryText = `EMERGENCY HEALTH SUMMARY: ${selectedMember.name.toUpperCase()}
Relationship: ${selectedMember.role} (${selectedMember.age} yrs)
Blood Type: ${selectedMember.bloodType}
Critical Allergies: ${selectedMember.allergies.length ? selectedMember.allergies.join(', ') : 'No known drug/food allergies'}
Conditions: ${selectedMember.chronicConditions.length ? selectedMember.chronicConditions.join(', ') : 'None'}

ACTIVE MEDICATIONS:
${memberMeds.length ? memberMeds.map((m) => `• ${m.name} (${m.dosage}) - ${m.frequency}`).join('\n') : 'None'}

EMERGENCY CONTACTS (ICE):
• ${selectedMember.emergencyContactName} (${selectedMember.emergencyContactRelation}): ${selectedMember.emergencyContactPhone}
• Primary Physician: ${selectedMember.primaryPhysician} - ${selectedMember.physicianPhone}
• Preferred Hospital: ${selectedMember.preferredHospital || 'Nearest Trauma Center'}

Special Instructions: ${selectedMember.notes || 'None'}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Emergency Health Card"
        description="Instant-access critical medical profiles, active prescriptions, and emergency contacts designed for EMTs, first responders, and school nurses."
        action={
          <div className="flex items-center gap-2">
            <Button onClick={handleCopySummary} variant="outline" size="sm">
              {copied ? <Check className="w-4 h-4 mr-1.5 text-teal-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text Summary'}
            </Button>
            <Button onClick={handlePrint} variant="primary" size="sm">
              <Printer className="w-4 h-4 mr-1.5" />
              Print Card
            </Button>
          </div>
        }
      />

      {/* Quick Member Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Select Member:
        </span>
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMemberId(member.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedMember?.id === member.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {member.name} ({member.bloodType})
          </button>
        ))}
      </div>

      {/* Main Printable Emergency Card */}
      {selectedMember ? (
        <div className="print:m-0 print:p-0">
          <div className="bg-white rounded-2xl border-2 border-rose-600/90 shadow-md overflow-hidden max-w-3xl mx-auto">
            {/* Top Red Header Strip */}
            <div className="bg-rose-600 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-white">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-rose-100">
                    Emergency Medical Profile
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {selectedMember.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="text-right sm:text-right">
                  <div className="text-[10px] text-rose-100 uppercase tracking-wider">Blood Group</div>
                  <div className="text-2xl font-black font-mono tracking-tight leading-none">
                    {selectedMember.bloodType}
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <div className="text-[10px] text-rose-100 uppercase tracking-wider">Age</div>
                  <div className="text-lg font-bold font-mono leading-none">
                    {selectedMember.age} yrs
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Allergy Alert Bar */}
            <div className="p-4 sm:p-5 bg-amber-50 border-b border-amber-200 text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Known Allergies & Drug Sensitivities
                  </div>
                  {selectedMember.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {selectedMember.allergies.map((allergy, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white border border-amber-300 font-bold text-sm text-amber-900 shadow-2xs"
                        >
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-800 mt-1 italic">
                      No known food, latex, or pharmaceutical allergies recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Details Body */}
            <div className="p-5 sm:p-6 space-y-6 text-sm">
              {/* Chronic Conditions & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Existing Medical Conditions
                  </div>
                  {selectedMember.chronicConditions.length > 0 ? (
                    <ul className="list-disc list-inside font-medium text-slate-900 space-y-1">
                      {selectedMember.chronicConditions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-xs italic">No chronic diagnoses documented.</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Special Care & Action Instructions
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    {selectedMember.notes ||
                      'Standard emergency protocol applies. Check airway, vitals, and alert primary contacts.'}
                  </p>
                </div>
              </div>

              {/* Active Daily Medications (Crucial for Responders) */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <Pill className="w-4 h-4 text-teal-700" />
                  <span>Current Active Medications & Dosages</span>
                </div>

                {memberMeds.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {memberMeds.map((med) => (
                      <div
                        key={med.id}
                        className="p-3 flex items-center justify-between text-xs sm:text-sm bg-white"
                      >
                        <div>
                          <strong className="text-slate-900">{med.name}</strong>
                          <span className="text-slate-500 ml-2 font-mono text-xs">{med.dosage}</span>
                          <div className="text-xs text-slate-500">{med.instructions}</div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {med.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 italic">
                    No daily continuous prescriptions recorded.
                  </div>
                )}
              </div>

              {/* In Case of Emergency Contacts (ICE) & Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/40">
                  <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                    Primary ICE Contact
                  </div>
                  <div className="font-semibold text-slate-900 mt-1">
                    {selectedMember.emergencyContactName || 'None listed'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {selectedMember.emergencyContactRelation}
                  </div>
                  {selectedMember.emergencyContactPhone && (
                    <a
                      href={`tel:${selectedMember.emergencyContactPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 mt-2 bg-white px-2 py-1 rounded border border-rose-200"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedMember.emergencyContactPhone}
                    </a>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Primary Physician
                  </div>
                  <div className="font-semibold text-slate-900 mt-1">
                    {selectedMember.primaryPhysician || 'Unassigned'}
                  </div>
                  {selectedMember.physicianPhone && (
                    <a
                      href={`tel:${selectedMember.physicianPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 mt-2 bg-white px-2 py-1 rounded border border-slate-200"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedMember.physicianPhone}
                    </a>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Preferred Emergency Hospital
                  </div>
                  <div className="font-semibold text-slate-900 mt-1 flex items-start gap-1">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedMember.preferredHospital || 'Nearest Hospital'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Transport here if medically stable.
                  </div>
                </div>
              </div>

              {/* Caregiver Authorization Note */}
              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 leading-relaxed border border-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Emergency Authorization Notice:</strong> In the event of an emergency where parents/guardians cannot be immediately reached, authorized personnel are requested to render immediate necessary care under medical supervision.
                </span>
              </div>
            </div>

            {/* Print Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
              Family Health Vault AI · Generated {new Date().toLocaleDateString()} for {selectedMember.name}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
