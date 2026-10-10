import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import { Appointment, AppointmentType } from '@/types';
import { Link } from '@/lib/navigation';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  Stethoscope,
  Edit2,
  Trash2,
  X,
  FileQuestion,
  Search,
} from 'lucide-react';

export default function AppointmentsPage() {
  const {
    members,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    toggleAppointmentCompleted,
  } = useVault();

  const [tab, setTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    provider: '',
    specialty: 'Family Medicine',
    memberId: members[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    location: '',
    type: 'Routine Checkup' as AppointmentType,
    notes: '',
    questions: '',
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesTab =
      tab === 'all'
        ? true
        : tab === 'upcoming'
        ? !apt.completed
        : apt.completed;

    const matchesMember = memberFilter === 'all' || apt.memberId === memberFilter;

    const matchesSearch =
      apt.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.familyMemberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesMember && matchesSearch;
  });

  const upcomingCount = appointments.filter((a) => !a.completed).length;
  const completedCount = appointments.filter((a) => a.completed).length;

  const openAddModal = () => {
    setEditingApt(null);
    setFormData({
      provider: '',
      specialty: 'Pediatrics',
      memberId: members[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      location: 'Evergreen Family Clinic',
      type: 'Routine Checkup',
      notes: '',
      questions: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setFormData({
      provider: apt.provider,
      specialty: apt.specialty,
      memberId: apt.memberId,
      date: apt.date,
      time: apt.time,
      location: apt.location,
      type: apt.type,
      notes: apt.notes || '',
      questions: apt.questionsToAsk ? apt.questionsToAsk.join('\n') : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider.trim() || !formData.memberId) return;

    const parsedQuestions = formData.questions
      ? formData.questions
          .split('\n')
          .map((q) => q.trim())
          .filter(Boolean)
      : [];

    if (editingApt) {
      updateAppointment(editingApt.id, {
        provider: formData.provider.trim(),
        specialty: formData.specialty.trim(),
        memberId: formData.memberId,
        date: formData.date,
        time: formData.time.trim(),
        location: formData.location.trim(),
        type: formData.type,
        notes: formData.notes.trim(),
        questionsToAsk: parsedQuestions,
      });
    } else {
      addAppointment({
        provider: formData.provider.trim(),
        specialty: formData.specialty.trim(),
        memberId: formData.memberId,
        date: formData.date,
        time: formData.time.trim(),
        location: formData.location.trim(),
        type: formData.type,
        notes: formData.notes.trim(),
        questionsToAsk: parsedQuestions,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, provider: string) => {
    if (window.confirm(`Are you sure you want to delete the appointment with ${provider}?`)) {
      deleteAppointment(id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Upcoming Appointments"
        description="Schedule doctor checkups, dentist visits, and specialist consultations across your whole family."
        action={
          <Button onClick={openAddModal} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Visit
          </Button>
        }
      />

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'upcoming'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({appointments.length})
          </button>
        </div>

        {/* Member Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search provider, clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 w-full sm:w-48"
            />
          </div>

          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">All Family Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointment Cards */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No appointments found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {tab === 'upcoming'
              ? 'No upcoming clinic visits scheduled. Keep your preventive health visits up to date.'
              : 'No appointments match the selected filter.'}
          </p>
          <Button onClick={openAddModal} variant="outline" size="sm">
            Schedule a Visit
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            return (
              <Card
                key={apt.id}
                className={`p-5 transition-all ${
                  apt.completed ? 'bg-slate-50/60 border-slate-200/60 opacity-90' : 'bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Date Badge + Main Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Date Block */}
                    <div className="w-16 py-2 px-1 text-center rounded-xl bg-teal-50 border border-teal-200/80 text-teal-900 shrink-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-xl font-bold font-mono tabular-nums leading-tight">
                        {new Date(apt.date).toLocaleDateString('en-US', { day: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-teal-600">
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100/70 text-teal-900 border border-teal-200">
                          {apt.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          For: <strong className="text-slate-800">{apt.familyMemberName}</strong>
                        </span>
                        {apt.completed && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            Completed
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 text-base">{apt.provider}</h4>
                      <p className="text-xs text-slate-500 font-medium">{apt.specialty}</p>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.time}</span>
                        </span>
                        {apt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{apt.location}</span>
                          </span>
                        )}
                      </div>

                      {apt.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-2">
                          <strong>Note:</strong> {apt.notes}
                        </p>
                      )}

                      {/* Questions to ask */}
                      {apt.questionsToAsk && apt.questionsToAsk.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <div className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1">
                            <FileQuestion className="w-3.5 h-3.5 text-teal-700" />
                            <span>Questions to ask doctor:</span>
                          </div>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                            {apt.questionsToAsk.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <button
                      onClick={() => toggleAppointmentCompleted(apt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        apt.completed
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${apt.completed ? 'text-teal-700' : 'text-slate-400'}`} />
                      <span>{apt.completed ? 'Mark Incomplete' : 'Mark Completed'}</span>
                    </button>

                    <Link href="/doctor-summary">
                      <Button variant="ghost" size="sm" className="text-teal-700">
                        <Stethoscope className="w-3.5 h-3.5 mr-1" />
                        Prepare Summary
                      </Button>
                    </Link>

                    <div className="flex items-center gap-1 ml-auto md:ml-0">
                      <button
                        onClick={() => openEditModal(apt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit appointment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(apt.id, apt.provider)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-900 text-lg">
                {editingApt ? 'Edit Appointment' : 'Schedule New Appointment'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Family Member *
                  </label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Appointment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as AppointmentType })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Pediatric">Pediatric</option>
                    <option value="Dental">Dental</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Lab Work">Lab Work</option>
                    <option value="Vision">Vision</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Doctor or Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Sterling, MD"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medical Specialty / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pediatrics, Cardiology, Family Dentistry"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clinic Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Evergreen Family Health Clinic, Suite 204"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Questions to ask during visit (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Confirm hearing test results&#10;Ask about booster vaccines"
                  value={formData.questions}
                  onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Visit Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring kindergarten school registration form for physical signature"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingApt ? 'Save Changes' : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
