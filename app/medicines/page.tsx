import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import { Medication, MedicationStatus } from '@/types';
import {
  sendMedicationNotification,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  playReminderChime,
} from '@/lib/notification-service';
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Bell,
  BellOff,
  BellRing,
  Volume2,
  Check,
} from 'lucide-react';

export default function MedicinesPage() {
  const {
    members,
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    toggleMedicationTaken,
    logRefill,
  } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Notification API state
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleSendTestAlert = () => {
    sendMedicationNotification({
      title: 'Medication Reminder Test',
      body: 'Family Health Vault AI: Scheduled dose alerts are functioning properly.',
      sound: true,
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  const handleTriggerDoseAlert = (med: Medication) => {
    sendMedicationNotification({
      title: `Dose Due: ${med.name}`,
      body: `Dose for ${med.familyMemberName} (${med.dosage}) - ${med.instructions || med.frequency}`,
      sound: true,
      onClick: () => {
        toggleMedicationTaken(med.id);
      },
    });
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily with meals',
    memberId: members[0]?.id || '',
    instructions: '',
    purpose: '',
    prescribedBy: '',
    startDate: new Date().toISOString().split('T')[0],
    refillDaysLeft: 30,
    status: 'active' as MedicationStatus,
    reminderEnabled: true,
    reminderTimes: '08:00',
  });

  const filteredMeds = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.familyMemberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.purpose && med.purpose.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMember = memberFilter === 'all' || med.memberId === memberFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? med.status === 'active'
        : statusFilter === 'as-needed'
        ? med.status === 'as-needed'
        : med.status === 'paused';

    return matchesSearch && matchesMember && matchesStatus;
  });

  const activeMeds = medications.filter((m) => m.status === 'active');
  const takenCount = activeMeds.filter((m) => m.takenToday).length;
  const refillAlertCount = medications.filter((m) => m.refillDaysLeft <= 21).length;
  const remindersEnabledCount = medications.filter((m) => m.reminderEnabled !== false).length;

  const openAddModal = () => {
    setEditingMed(null);
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Once daily with meals',
      memberId: members[0]?.id || '',
      instructions: '',
      purpose: '',
      prescribedBy: '',
      startDate: new Date().toISOString().split('T')[0],
      refillDaysLeft: 30,
      status: 'active',
      reminderEnabled: true,
      reminderTimes: '08:00',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      memberId: med.memberId,
      instructions: med.instructions,
      purpose: med.purpose || '',
      prescribedBy: med.prescribedBy || '',
      startDate: med.startDate || new Date().toISOString().split('T')[0],
      refillDaysLeft: med.refillDaysLeft,
      status: med.status,
      reminderEnabled: med.reminderEnabled !== false,
      reminderTimes: med.reminderTimes && med.reminderTimes.length > 0 ? med.reminderTimes.join(', ') : '08:00',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.memberId) return;

    const parsedTimes = formData.reminderTimes
      ? formData.reminderTimes.split(',').map((t) => t.trim()).filter(Boolean)
      : ['08:00'];

    if (editingMed) {
      updateMedication(editingMed.id, {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency.trim(),
        memberId: formData.memberId,
        instructions: formData.instructions.trim(),
        purpose: formData.purpose.trim(),
        prescribedBy: formData.prescribedBy.trim(),
        startDate: formData.startDate,
        refillDaysLeft: Number(formData.refillDaysLeft),
        status: formData.status,
        reminderEnabled: formData.reminderEnabled,
        reminderTimes: parsedTimes,
      });
    } else {
      addMedication({
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency.trim(),
        memberId: formData.memberId,
        instructions: formData.instructions.trim(),
        purpose: formData.purpose.trim(),
        prescribedBy: formData.prescribedBy.trim(),
        startDate: formData.startDate,
        refillDaysLeft: Number(formData.refillDaysLeft),
        status: formData.status,
        takenToday: false,
        reminderEnabled: formData.reminderEnabled,
        reminderTimes: parsedTimes,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your medication list?`)) {
      deleteMedication(id);
    }
  };

  const toggleReminderForMed = (med: Medication) => {
    const nextState = !(med.reminderEnabled !== false);
    updateMedication(med.id, {
      reminderEnabled: nextState,
      reminderTimes: med.reminderTimes && med.reminderTimes.length > 0 ? med.reminderTimes : ['08:00'],
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Medicines & Medication Reminders"
        description="Track household medications, scheduled dose alarms, physician instructions, and refill alerts."
        action={
          <Button onClick={openAddModal} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        }
      />

      {/* Medication Reminders Feature Control Panel */}
      <Card className="border-teal-200/90 bg-gradient-to-r from-teal-50/70 via-white to-slate-50/70">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                    Browser Medication Reminders
                  </h3>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      permission === 'granted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : permission === 'denied'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {permission === 'granted'
                      ? 'Alerts Active'
                      : permission === 'denied'
                      ? 'Alerts Blocked'
                      : 'Permission Needed'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Alerts use the browser Notification API and gentle audio chimes when scheduled doses are due for active medications ({remindersEnabledCount} active schedules).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
              {permission !== 'granted' && (
                <Button
                  onClick={handleRequestPermission}
                  variant="primary"
                  size="sm"
                  className="text-xs"
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  Enable Browser Alerts
                </Button>
              )}

              <Button
                onClick={handleSendTestAlert}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {testSent ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                    <span>Notification Sent!</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                    <span>Test Browser Alert</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Active Prescriptions</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">{activeMeds.length}</div>
          <div className="text-xs text-slate-500 mt-1">Across all family members</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="text-xs font-medium text-slate-500 mb-1">Daily Compliance Today</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-800">
            {takenCount} <span className="text-sm font-normal text-slate-500">of {activeMeds.length} logged</span>
          </div>
          <div className="text-xs text-teal-700 mt-1">
            {activeMeds.length > 0 && takenCount === activeMeds.length ? 'All daily doses complete!' : 'Keep up daily routines'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="text-xs font-medium text-slate-500 mb-1">Refills Due Soon</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">{refillAlertCount}</div>
          <div className="text-xs text-slate-500 mt-1">Within 21 days supply remaining</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medications, purpose, or member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Member Filter */}
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active Daily' },
              { id: 'as-needed', label: 'As Needed' },
              { id: 'paused', label: 'Paused' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medication List */}
      {filteredMeds.length === 0 ? (
        <Card className="text-center py-12 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No medications found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No prescriptions match "${searchQuery}".`
              : 'Add your vitamins, prescriptions, or emergency inhalers to start tracking.'}
          </p>
          <Button onClick={openAddModal} variant="outline" size="sm">
            Add First Medication
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMeds.map((med) => {
            const isRefillWarning = med.refillDaysLeft <= 14;
            const hasReminders = med.reminderEnabled !== false;

            return (
              <Card
                key={med.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                {/* Left Column: Med info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0 mt-0.5">
                    <Pill className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">
                        {med.name}
                      </h4>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {med.dosage}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded capitalize ${
                          med.status === 'active'
                            ? 'bg-slate-100 text-slate-700'
                            : med.status === 'as-needed'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {med.status.replace('-', ' ')}
                      </span>

                      {/* Scheduled Reminder Tag */}
                      {hasReminders && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-teal-600" />
                          <span>
                            {med.reminderTimes && med.reminderTimes.length > 0
                              ? med.reminderTimes.join(', ')
                              : '08:00'}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800">
                        For: {med.familyMemberName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>Schedule: {med.frequency}</span>
                      {med.purpose && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500 italic">{med.purpose}</span>
                        </>
                      )}
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                        Instructions: {med.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column: Refill status & Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-between md:justify-end shrink-0">
                  {/* Reminder Toggle & Trigger */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleReminderForMed(med)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        hasReminders
                          ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={hasReminders ? 'Reminders active (Click to disable)' : 'Reminders off (Click to enable)'}
                    >
                      {hasReminders ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleTriggerDoseAlert(med)}
                      className="p-2 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                      title="Send dose alert now"
                    >
                      <BellRing className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Refill status */}
                  <div className="text-right">
                    <div
                      className={`text-xs font-medium font-mono tabular-nums flex items-center gap-1 ${
                        isRefillWarning ? 'text-rose-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {isRefillWarning && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{med.refillDaysLeft} days supply</span>
                    </div>
                    <button
                      onClick={() => logRefill(med.id, 30)}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline flex items-center gap-1 ml-auto mt-0.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      +30 Days Refill
                    </button>
                  </div>

                  {/* Taken Today Checkbox Action */}
                  <button
                    onClick={() => toggleMedicationTaken(med.id)}
                    className={`h-9 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      med.takenToday
                        ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${med.takenToday ? 'text-white' : 'text-slate-400'}`}
                    />
                    <span>{med.takenToday ? 'Taken Today' : 'Mark Taken'}</span>
                  </button>

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(med)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit medication"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id, med.name)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Medication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-900 text-lg">
                {editingMed ? 'Edit Medication' : 'Add Medication / Supplement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Vitamin D3, Albuterol Inhaler"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

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
                    Dosage & Strength *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg, 1 puff, 10ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Frequency / Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Once daily morning, Every 8 hrs"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as MedicationStatus })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="active">Active Daily</option>
                    <option value="as-needed">As Needed (PRN)</option>
                    <option value="paused">Temporarily Paused</option>
                  </select>
                </div>
              </div>

              {/* Medication Reminders Section */}
              <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminderEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, reminderEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-teal-700" />
                      <span>Enable Browser Dose Reminders</span>
                    </span>
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Scheduled Alert Times (24-hr format, comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00, 19:30"
                      value={formData.reminderTimes}
                      onChange={(e) => setFormData({ ...formData, reminderTimes: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Browser notifications and audio chimes trigger when each dose is due.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Supply Days Remaining
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={formData.refillDaysLeft}
                    onChange={(e) =>
                      setFormData({ ...formData, refillDaysLeft: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Prescribing Doctor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Sterling"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Health Purpose / Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute ear infection, Blood pressure regulation"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pharmacy / Ingestion Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with food. Do not chew tablet. Complete full 10-day cycle."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingMed ? 'Save Changes' : 'Add Medication'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
