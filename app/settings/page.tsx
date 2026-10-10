import React, { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import { useAuth } from '@/lib/auth-context';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Shield,
  Save,
  Check,
  AlertTriangle,
  Database,
  Lock,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    settings,
    members,
    medications,
    appointments,
    documents,
    updateSettings,
    exportBackup,
    importBackup,
    resetToDemoData,
    clearAllData,
    syncState,
    triggerCloudSync,
    isCloudConnected,
  } = useVault();

  const { user, openAuthModal, logout } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local form state
  const [form, setForm] = useState({
    familyName: settings.familyName,
    primaryContactName: settings.primaryContactName,
    primaryContactPhone: settings.primaryContactPhone,
    emergencyNotes: settings.emergencyNotes,
    showDemoNotice: settings.showDemoNotice,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleManualSync = async () => {
    setSyncingNow(true);
    await triggerCloudSync();
    setTimeout(() => setSyncingNow(false), 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBackup(content);
        if (res.success) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus(`Restore failed: ${res.error || 'Unknown error'}`);
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset vault to default demo records? Any custom family entries will be replaced with the Vance family demo dataset.'
      )
    ) {
      resetToDemoData();
      setForm({
        familyName: 'The Vance Family',
        primaryContactName: 'Eleanor Vance',
        primaryContactPhone: '(555) 789-0123',
        emergencyNotes:
          'All household medical records kept in Family Health Vault AI. Notify primary contacts immediately in any triage scenario.',
        showDemoNotice: true,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleClear = () => {
    if (
      window.confirm(
        '⚠️ Are you sure you want to completely clear your vault? This will erase all family members, medications, appointments, and documents in this browser.'
      )
    ) {
      clearAllData();
      setForm({
        familyName: 'My Household',
        primaryContactName: '',
        primaryContactPhone: '',
        emergencyNotes: '',
        showDemoNotice: false,
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Vault & Household Settings"
        description="Configure household profile names, emergency instructions, and manage your private cloud synchronization."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Household Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cloud Account & Multi-Device Sync Card */}
          <Card className="border-teal-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Cloud Database & Multi-Device Sync</CardTitle>
                    <CardDescription>Powered by Firestore zero-trust secure cloud storage</CardDescription>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isCloudConnected
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCloudConnected ? 'Cloud Active' : 'Offline / Local Only'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {user ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 gap-3">
                  <div className="space-y-0.5 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-700" />
                      <span>{user.displayName || 'Household Guardian'}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">{user.email || 'Anonymous Guest Session'}</div>
                    <div className="text-teal-700 pt-1 flex items-center gap-1 font-medium text-[11px]">
                      <Check className="w-3 h-3" />
                      <span>Sync Status: {syncState === 'synced' ? 'Up to date with Cloud Firestore' : 'Syncing...'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleManualSync}
                      variant="outline"
                      size="sm"
                      disabled={syncingNow}
                      className="text-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncingNow ? 'animate-spin' : ''}`} />
                      {syncingNow ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button
                      onClick={logout}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">
                      Enable Multi-Device Household Access
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Sign in or create an account to automatically sync your vault across family phones and tablets.
                    </p>
                  </div>
                  <Button onClick={openAuthModal} variant="primary" size="sm" className="shrink-0">
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    Sign In / Connect Cloud
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Household Profile</CardTitle>
              <CardDescription>
                Customize your family vault name and default emergency contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Household / Family Vault Name
                  </label>
                  <input
                    type="text"
                    value={form.familyName}
                    onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                    placeholder="e.g. The Vance Family"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Primary Family Contact Person
                    </label>
                    <input
                      type="text"
                      value={form.primaryContactName}
                      onChange={(e) =>
                        setForm({ ...form, primaryContactName: e.target.value })
                      }
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Primary Contact Telephone
                    </label>
                    <input
                      type="tel"
                      value={form.primaryContactPhone}
                      onChange={(e) =>
                        setForm({ ...form, primaryContactPhone: e.target.value })
                      }
                      placeholder="e.g. (555) 789-0123"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Emergency Card Header Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={form.emergencyNotes}
                    onChange={(e) => setForm({ ...form, emergencyNotes: e.target.value })}
                    placeholder="Instructions printed on emergency cards"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.showDemoNotice}
                      onChange={(e) =>
                        setForm({ ...form, showDemoNotice: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Show "Demo Mode — Not Real Medical Information" notice banner
                    </span>
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  {savedSuccess ? (
                    <span className="text-xs text-teal-700 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Settings saved successfully!
                    </span>
                  ) : <span />}

                  <Button type="submit" variant="primary">
                    <Save className="w-4 h-4 mr-1.5" />
                    Save Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Data Backup & Restore */}
          <Card>
            <CardHeader>
              <CardTitle>Vault Data Management</CardTitle>
              <CardDescription>
                Export complete JSON backups of your household health data or restore from a previously exported file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-teal-700" />
                    <span>Export JSON Backup</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Download an offline copy of all {members.length} members, {medications.length} medications, and records.
                  </p>
                  <Button onClick={exportBackup} variant="outline" size="sm" fullWidth>
                    Download Backup File
                  </Button>
                </div>

                {/* Import */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-teal-700" />
                    <span>Restore From Backup</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload a previously downloaded JSON backup file to restore records.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Select JSON File
                  </Button>
                </div>
              </div>

              {importStatus && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs">
                  {importStatus}
                </div>
              )}

              {/* Danger Zone: Reset or Wipe */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button onClick={handleReset} variant="ghost" size="sm" className="text-slate-600">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset to Sample Demo Data
                </Button>

                <Button onClick={handleClear} variant="danger" size="sm">
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear All Vault Records
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Vault Summary & Privacy Architecture */}
        <div className="space-y-6">
          {/* Current Storage Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-700" />
                <span>Vault Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Family Profiles:</span>
                  <strong className="text-slate-900 font-mono tabular-nums">{members.length}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Tracked Medications:</span>
                  <strong className="text-slate-900 font-mono tabular-nums">{medications.length}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Appointments Scheduled:</span>
                  <strong className="text-slate-900 font-mono tabular-nums">{appointments.length}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Archived Documents:</span>
                  <strong className="text-slate-900 font-mono tabular-nums">{documents.length}</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Cloud Database:</span>
                  <span className="text-teal-700 font-medium font-mono text-[11px]">Firestore Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Cloud Architecture Notice */}
          <Card className="bg-teal-50/40 border-teal-200/80">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-900 font-semibold text-sm">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Zero-Trust Security</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Family health records in Firestore are strictly isolated by household ownership rules. Only authenticated household members can read or modify medical documents, medications, or appointments.
              </p>
              <div className="p-3 rounded-lg bg-white border border-teal-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">Multi-Device Ready</div>
                <p className="text-[11px] text-slate-500">
                  Sign in on your phone, tablet, or laptop to sync health details in real time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
