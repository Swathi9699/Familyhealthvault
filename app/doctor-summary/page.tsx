import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import { DoctorVisitSummary } from '@/types';
import {
  Stethoscope,
  Plus,
  Printer,
  Copy,
  Check,
  Calendar,
  Pill,
  AlertTriangle,
  FileQuestion,
  Trash2,
  FileText,
  User,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function DoctorSummaryPage() {
  const { members, medications, visitSummaries, addVisitSummary, deleteVisitSummary } = useVault();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);

  // New Summary Form State
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || '',
    visitDate: new Date().toISOString().split('T')[0],
    doctorName: '',
    clinic: '',
    chiefComplaint: '',
    symptoms: '',
    questions: '',
    notes: '',
  });

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const memberMeds = selectedMember
    ? medications.filter((m) => m.memberId === selectedMember.id && m.status === 'active')
    : [];

  const handleGenerateAiBriefing = async () => {
    if (!selectedMember) return;
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/clinical-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: selectedMember.name,
          age: selectedMember.age,
          allergies: selectedMember.allergies,
          chronicConditions: selectedMember.chronicConditions,
          medications: memberMeds.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`),
          chiefComplaint: formData.chiefComplaint || 'Pre-visit clinical preparation & health record check',
          symptoms: formData.symptoms,
          visitNotes: formData.notes,
        }),
      });
      const data = await res.json();
      if (data?.briefing) {
        setAiBriefing(data.briefing);
        setAiSource(data.source === 'gemini-server-side' ? 'Gemini 2.5 Flash (Server Secret)' : 'Synthetic Clinical Engine (Demo)');
      }
    } catch (err) {
      console.warn('AI briefing fetch error:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const memberSummaries = visitSummaries.filter(
    (v) => !selectedMember || v.memberId === selectedMember.id
  );

  const handleStartCreate = () => {
    setFormData({
      memberId: selectedMember?.id || members[0]?.id || '',
      visitDate: new Date().toISOString().split('T')[0],
      doctorName: selectedMember?.primaryPhysician || '',
      clinic: selectedMember?.preferredHospital || '',
      chiefComplaint: '',
      symptoms: '',
      questions: '',
      notes: '',
    });
    setIsCreating(true);
  };

  const handleSaveSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.chiefComplaint.trim() || !formData.doctorName.trim()) return;

    const parsedSymptoms = formData.symptoms
      ? formData.symptoms.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedQuestions = formData.questions
      ? formData.questions.split('\n').map((q) => q.trim()).filter(Boolean)
      : [];

    addVisitSummary({
      memberId: formData.memberId,
      visitDate: formData.visitDate,
      doctorName: formData.doctorName.trim(),
      clinic: formData.clinic.trim(),
      chiefComplaint: formData.chiefComplaint.trim(),
      symptoms: parsedSymptoms,
      questionsForDoctor: parsedQuestions,
      notes: formData.notes.trim(),
    });

    setIsCreating(false);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopy = (summary: DoctorVisitSummary) => {
    const text = `DOCTOR VISIT BRIEFING: ${summary.familyMemberName}
Date: ${summary.visitDate}
Physician: ${summary.doctorName} (${summary.clinic})
Primary Concern: ${summary.chiefComplaint}

Reported Symptoms:
${summary.symptoms.map((s) => `• ${s}`).join('\n')}

Questions to Ask Physician:
${summary.questionsForDoctor.map((q) => `• ${q}`).join('\n')}

Active Medications:
${memberMeds.map((m) => `• ${m.name} (${m.dosage})`).join('\n')}

Allergies: ${selectedMember?.allergies.join(', ') || 'None'}
Visit Notes: ${summary.notes || 'None'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Doctor Visit Summary"
        description="Prepare concise clinical briefing sheets before appointments, organizing symptoms, questions, and active medication lists so you get the most out of every doctor visit."
        action={
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-1.5" />
              Print Briefing
            </Button>
            <Button onClick={handleStartCreate} variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              New Visit Sheet
            </Button>
          </div>
        }
      />

      {/* Member Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Patient:
        </span>
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => {
              setSelectedMemberId(member.id);
              setIsCreating(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedMember?.id === member.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {member.name}
          </button>
        ))}
      </div>

      {/* Creator Form */}
      {isCreating && (
        <Card className="p-5 sm:p-6 border-teal-300 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>Create New Visit Briefing for {selectedMember?.name}</span>
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveSummary} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Visit Date *</label>
                <input
                  type="date"
                  required
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Sterling, MD"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Clinic / Facility</label>
                <input
                  type="text"
                  placeholder="e.g. Evergreen Family Health"
                  value={formData.clinic}
                  onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Reason / Chief Concern *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5-year checkup + persistent dry cough after running"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Symptoms & Observations (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Coughing mostly between 2 AM - 4 AM&#10;No fever&#10;Wheezing after outdoor recess"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Questions to Ask Doctor (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Should we adjust the inhaler dosage for sports?&#10;Are kindergarten boosters due this week?&#10;Do we need a pediatric allergy panel?"
                  value={formData.questions}
                  onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Physician Guidance</label>
              <textarea
                rows={2}
                placeholder="Doctor's response, next steps, and followup plan"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            {aiBriefing && (
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-teal-900">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>AI Clinical Assistant Insights</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-700">
                    {aiSource || 'AI Engine'}
                  </span>
                </div>
                <div className="text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-white p-3 rounded-lg border border-teal-100 max-h-56 overflow-y-auto">
                  {aiBriefing}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-teal-800"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        questions: prev.questions
                          ? `${prev.questions}\n• Review dosage adjustments and upcoming milestones\n• Discuss seasonal prophylaxis and action plan`
                          : '• Review dosage adjustments and upcoming milestones\n• Discuss seasonal prophylaxis and action plan',
                      }));
                    }}
                  >
                    + Insert Questions into Form
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAiBriefing}
                disabled={isAiGenerating}
                className="text-teal-700 border-teal-200 hover:bg-teal-50"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Generating Clinical Brief...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                    AI Clinical Suggestions
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Visit Sheet
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Patient Live Briefing Preview (Printable View) */}
      {selectedMember && (
        <div className="space-y-6">
          {/* Active Clinical Context Box */}
          <Card className="bg-slate-50/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Current Medical Snapshot · {selectedMember.name}</span>
                <span className="text-xs font-mono font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                  Blood Group: {selectedMember.bloodType}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Allergies</span>
                  </div>
                  {selectedMember.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedMember.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No known drug allergies</span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>Active Daily Prescriptions ({memberMeds.length})</span>
                  </div>
                  {memberMeds.length > 0 ? (
                    <div className="space-y-1">
                      {memberMeds.map((m) => (
                        <div key={m.id} className="text-slate-700">
                          <strong>{m.name}</strong> ({m.dosage}) · {m.frequency}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No active medications logged</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Past & Upcoming Visit Sheets */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Visit Agendas & Consultation Notes ({memberSummaries.length})
            </h3>

            {memberSummaries.length === 0 ? (
              <Card className="text-center py-10 px-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">No visit briefings yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                  Create a visit sheet before your next appointment to track questions and symptoms.
                </p>
                <Button onClick={handleStartCreate} variant="outline" size="sm">
                  Create First Visit Sheet
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {memberSummaries.map((summary) => (
                  <Card key={summary.id} className="p-5 hover:border-slate-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-base">
                            {summary.chiefComplaint}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {summary.doctorName} · {summary.clinic} · Visit Date: {summary.visitDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-start">
                        <Button
                          onClick={() => handleCopy(summary)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy
                        </Button>
                        <button
                          onClick={() => deleteVisitSummary(summary.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete visit sheet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                      {summary.symptoms.length > 0 && (
                        <div>
                          <div className="font-semibold text-slate-700 mb-1">Symptoms to Discuss:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                            {summary.symptoms.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {summary.questionsForDoctor.length > 0 && (
                        <div>
                          <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <FileQuestion className="w-3.5 h-3.5 text-teal-700" />
                            <span>Questions for Physician:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                            {summary.questionsForDoctor.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {summary.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-teal-50/50 border border-teal-100 text-xs text-slate-700">
                        <div className="font-semibold text-teal-900 mb-0.5">Physician Advice & Plan:</div>
                        <p>{summary.notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
