import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import {
  FamilyMember,
  Medication,
  Appointment,
  HealthDocument,
  DoctorVisitSummary,
  VaultSettings,
} from '@/types';
import {
  INITIAL_FAMILY_MEMBERS,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_VISIT_SUMMARIES,
  INITIAL_SETTINGS,
} from './demo-data';
import { db } from './firebase';
import { useAuth } from './auth-context';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

const STORAGE_KEY = 'family_health_vault_ai_v2';

interface VaultData {
  members: FamilyMember[];
  medications: Medication[];
  appointments: Appointment[];
  documents: HealthDocument[];
  visitSummaries: DoctorVisitSummary[];
  settings: VaultSettings;
}

export type SyncState = 'synced' | 'syncing' | 'local';

interface VaultContextType extends VaultData {
  // Sync & Cloud State
  syncState: SyncState;
  isCloudConnected: boolean;
  triggerCloudSync: () => Promise<void>;

  // Filter state
  selectedMemberId: string | 'all';
  setSelectedMemberId: (id: string | 'all') => void;

  // Family Members CRUD
  addMember: (member: Omit<FamilyMember, 'id'>) => FamilyMember;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => FamilyMember | undefined;

  // Medications CRUD
  addMedication: (med: Omit<Medication, 'id' | 'familyMemberName'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  toggleMedicationTaken: (id: string) => void;
  logRefill: (id: string, additionalDays: number) => void;

  // Appointments CRUD
  addAppointment: (apt: Omit<Appointment, 'id' | 'familyMemberName' | 'completed'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  toggleAppointmentCompleted: (id: string) => void;

  // Documents CRUD
  addDocument: (doc: Omit<HealthDocument, 'id' | 'familyMemberName'>) => HealthDocument;
  deleteDocument: (id: string) => void;

  // Doctor Visit Summaries CRUD
  addVisitSummary: (summary: Omit<DoctorVisitSummary, 'id' | 'familyMemberName' | 'createdAt'>) => DoctorVisitSummary;
  deleteVisitSummary: (id: string) => void;

  // Settings & Storage Actions
  updateSettings: (updates: Partial<VaultSettings>) => void;
  resetToDemoData: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => { success: boolean; error?: string };
  clearAllData: () => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>('local');

  const [data, setData] = useState<VaultData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.members)) {
            return {
              members: parsed.members,
              medications: parsed.medications || [],
              appointments: parsed.appointments || [],
              documents: parsed.documents || [],
              visitSummaries: parsed.visitSummaries || [],
              settings: parsed.settings || INITIAL_SETTINGS,
            };
          }
        }
      } catch (err) {
        console.warn('Could not read local vault from storage, starting with initial data:', err);
      }
    }
    return {
      members: INITIAL_FAMILY_MEMBERS,
      medications: INITIAL_MEDICATIONS,
      appointments: INITIAL_APPOINTMENTS,
      documents: INITIAL_DOCUMENTS,
      visitSummaries: INITIAL_VISIT_SUMMARIES,
      settings: INITIAL_SETTINGS,
    };
  });

  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');

  // Persist to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to write vault state to localStorage:', err);
      }
    }
  }, [data]);

  // Push full vault to Cloud Firestore
  const pushToCloud = useCallback(async (vaultPayload: VaultData) => {
    if (!user) return;
    setSyncState('syncing');
    try {
      const householdId = `hh_${user.uid}`;
      const householdRef = doc(db, 'households', householdId);

      // Save household meta
      await setDoc(householdRef, {
        id: householdId,
        name: vaultPayload.settings.familyName,
        ownerId: user.uid,
        memberUids: [user.uid],
        primaryContactPhone: vaultPayload.settings.primaryContactPhone,
        emergencyNotes: vaultPayload.settings.emergencyNotes,
        showDemoNotice: vaultPayload.settings.showDemoNotice,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Batch write members
      const batch = writeBatch(db);
      for (const m of vaultPayload.members) {
        batch.set(doc(db, 'households', householdId, 'members', m.id), m);
      }
      for (const med of vaultPayload.medications) {
        batch.set(doc(db, 'households', householdId, 'medications', med.id), med);
      }
      for (const a of vaultPayload.appointments) {
        batch.set(doc(db, 'households', householdId, 'appointments', a.id), a);
      }
      for (const d of vaultPayload.documents) {
        batch.set(doc(db, 'households', householdId, 'documents', d.id), d);
      }
      for (const v of vaultPayload.visitSummaries) {
        batch.set(doc(db, 'households', householdId, 'visitSummaries', v.id), v);
      }
      await batch.commit();

      setSyncState('synced');
    } catch (err) {
      console.warn('Cloud sync error:', err);
      setSyncState('local');
    }
  }, [user]);

  // Pull from Cloud Firestore on login
  useEffect(() => {
    if (!user) {
      setSyncState('local');
      return;
    }

    const householdId = `hh_${user.uid}`;
    const householdRef = doc(db, 'households', householdId);

    let isMounted = true;
    setSyncState('syncing');

    const checkAndSync = async () => {
      try {
        const snap = await getDoc(householdRef);
        if (!snap.exists()) {
          // New cloud account: seed cloud with current vault data
          await pushToCloud(data);
        } else {
          // Cloud data exists: set up real-time listener for members
          setSyncState('synced');
        }
      } catch (err) {
        console.warn('Firestore initial sync check failed:', err);
        setSyncState('local');
      }
    };

    checkAndSync();

    // Listen to real-time changes from Firestore
    const unsubMembers = onSnapshot(collection(db, 'households', householdId, 'members'), (snapshot) => {
      if (!isMounted || snapshot.empty) return;
      const cloudMembers = snapshot.docs.map((d) => d.data() as FamilyMember);
      setData((prev) => ({
        ...prev,
        members: cloudMembers,
      }));
    }, (err) => console.warn('Snapshot members error:', err));

    return () => {
      isMounted = false;
      unsubMembers();
    };
  }, [user]);

  const triggerCloudSync = async () => {
    await pushToCloud(data);
  };

  const getMemberById = (id: string) => data.members.find((m) => m.id === id);

  // Members
  const addMember = (newMember: Omit<FamilyMember, 'id'>): FamilyMember => {
    const id = `fam-${Date.now()}`;
    const member: FamilyMember = { ...newMember, id };
    const nextData = {
      ...data,
      members: [...data.members, member],
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
    return member;
  };

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    const updatedMembers = data.members.map((m) => (m.id === id ? { ...m, ...updates } : m));
    const memberName = updates.name;
    const nextData = {
      ...data,
      members: updatedMembers,
      medications: memberName
        ? data.medications.map((med) => (med.memberId === id ? { ...med, familyMemberName: memberName } : med))
        : data.medications,
      appointments: memberName
        ? data.appointments.map((apt) => (apt.memberId === id ? { ...apt, familyMemberName: memberName } : apt))
        : data.appointments,
      documents: memberName
        ? data.documents.map((doc) => (doc.memberId === id ? { ...doc, familyMemberName: memberName } : doc))
        : data.documents,
      visitSummaries: memberName
        ? data.visitSummaries.map((v) => (v.memberId === id ? { ...v, familyMemberName: memberName } : v))
        : data.visitSummaries,
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  const deleteMember = (id: string) => {
    const nextData = {
      ...data,
      members: data.members.filter((m) => m.id !== id),
      medications: data.medications.filter((m) => m.memberId !== id),
      appointments: data.appointments.filter((a) => a.memberId !== id),
      documents: data.documents.filter((d) => d.memberId !== id),
      visitSummaries: data.visitSummaries.filter((v) => v.memberId !== id),
    };
    setData(nextData);
    if (selectedMemberId === id) {
      setSelectedMemberId('all');
    }
    if (user) {
      const householdId = `hh_${user.uid}`;
      deleteDoc(doc(db, 'households', householdId, 'members', id)).catch(console.warn);
      pushToCloud(nextData);
    }
  };

  // Medications
  const addMedication = (med: Omit<Medication, 'id' | 'familyMemberName'>): Medication => {
    const id = `med-${Date.now()}`;
    const member = getMemberById(med.memberId);
    const item: Medication = {
      ...med,
      id,
      familyMemberName: member?.name || 'Household Member',
    };
    const nextData = {
      ...data,
      medications: [item, ...data.medications],
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
    return item;
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    const nextData = {
      ...data,
      medications: data.medications.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  const deleteMedication = (id: string) => {
    const nextData = {
      ...data,
      medications: data.medications.filter((m) => m.id !== id),
    };
    setData(nextData);
    if (user) {
      const householdId = `hh_${user.uid}`;
      deleteDoc(doc(db, 'households', householdId, 'medications', id)).catch(console.warn);
    }
  };

  const toggleMedicationTaken = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nextData = {
      ...data,
      medications: data.medications.map((m) => {
        if (m.id === id) {
          const nextTaken = !m.takenToday;
          return {
            ...m,
            takenToday: nextTaken,
            lastTakenDate: nextTaken ? today : m.lastTakenDate,
          };
        }
        return m;
      }),
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  const logRefill = (id: string, additionalDays: number) => {
    const nextData = {
      ...data,
      medications: data.medications.map((m) =>
        m.id === id
          ? {
              ...m,
              refillDaysLeft: Math.max(0, m.refillDaysLeft + additionalDays),
            }
          : m
      ),
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  // Appointments
  const addAppointment = (apt: Omit<Appointment, 'id' | 'familyMemberName' | 'completed'>): Appointment => {
    const id = `apt-${Date.now()}`;
    const member = getMemberById(apt.memberId);
    const item: Appointment = {
      ...apt,
      id,
      familyMemberName: member?.name || 'Household Member',
      completed: false,
    };
    const nextData = {
      ...data,
      appointments: [...data.appointments, item].sort((a, b) => a.date.localeCompare(b.date)),
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
    return item;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const nextData = {
      ...data,
      appointments: data.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  const deleteAppointment = (id: string) => {
    const nextData = {
      ...data,
      appointments: data.appointments.filter((a) => a.id !== id),
    };
    setData(nextData);
    if (user) {
      const householdId = `hh_${user.uid}`;
      deleteDoc(doc(db, 'households', householdId, 'appointments', id)).catch(console.warn);
    }
  };

  const toggleAppointmentCompleted = (id: string) => {
    const nextData = {
      ...data,
      appointments: data.appointments.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      ),
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  // Documents
  const addDocument = (docItem: Omit<HealthDocument, 'id' | 'familyMemberName'>): HealthDocument => {
    const id = `doc-${Date.now()}`;
    const member = getMemberById(docItem.memberId);
    const item: HealthDocument = {
      ...docItem,
      id,
      familyMemberName: member?.name || 'Household Member',
    };
    const nextData = {
      ...data,
      documents: [item, ...data.documents],
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
    return item;
  };

  const deleteDocument = (id: string) => {
    const nextData = {
      ...data,
      documents: data.documents.filter((d) => d.id !== id),
    };
    setData(nextData);
    if (user) {
      const householdId = `hh_${user.uid}`;
      deleteDoc(doc(db, 'households', householdId, 'documents', id)).catch(console.warn);
    }
  };

  // Doctor Visit Summaries
  const addVisitSummary = (
    summary: Omit<DoctorVisitSummary, 'id' | 'familyMemberName' | 'createdAt'>
  ): DoctorVisitSummary => {
    const id = `vis-${Date.now()}`;
    const member = getMemberById(summary.memberId);
    const item: DoctorVisitSummary = {
      ...summary,
      id,
      familyMemberName: member?.name || 'Household Member',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextData = {
      ...data,
      visitSummaries: [item, ...data.visitSummaries],
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
    return item;
  };

  const deleteVisitSummary = (id: string) => {
    const nextData = {
      ...data,
      visitSummaries: data.visitSummaries.filter((v) => v.id !== id),
    };
    setData(nextData);
    if (user) {
      const householdId = `hh_${user.uid}`;
      deleteDoc(doc(db, 'households', householdId, 'visitSummaries', id)).catch(console.warn);
    }
  };

  // Settings
  const updateSettings = (updates: Partial<VaultSettings>) => {
    const nextData = {
      ...data,
      settings: { ...data.settings, ...updates },
    };
    setData(nextData);
    if (user) {
      pushToCloud(nextData);
    }
  };

  const resetToDemoData = () => {
    const initial: VaultData = {
      members: INITIAL_FAMILY_MEMBERS,
      medications: INITIAL_MEDICATIONS,
      appointments: INITIAL_APPOINTMENTS,
      documents: INITIAL_DOCUMENTS,
      visitSummaries: INITIAL_VISIT_SUMMARIES,
      settings: INITIAL_SETTINGS,
    };
    setData(initial);
    setSelectedMemberId('all');
    if (user) {
      pushToCloud(initial);
    }
  };

  const clearAllData = () => {
    const empty: VaultData = {
      members: [],
      medications: [],
      appointments: [],
      documents: [],
      visitSummaries: [],
      settings: {
        familyName: 'My Household',
        primaryContactName: '',
        primaryContactPhone: '',
        emergencyNotes: '',
        showDemoNotice: false,
      },
    };
    setData(empty);
    setSelectedMemberId('all');
    if (user) {
      pushToCloud(empty);
    }
  };

  const exportBackup = () => {
    try {
      const payload = JSON.stringify(data, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `family-health-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export vault backup:', err);
    }
  };

  const importBackup = (jsonData: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || !Array.isArray(parsed.members)) {
        return { success: false, error: 'Invalid backup file format: missing members array.' };
      }
      const imported: VaultData = {
        members: parsed.members || [],
        medications: parsed.medications || [],
        appointments: parsed.appointments || [],
        documents: parsed.documents || [],
        visitSummaries: parsed.visitSummaries || [],
        settings: parsed.settings || INITIAL_SETTINGS,
      };
      setData(imported);
      if (user) {
        pushToCloud(imported);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'JSON parse error: file is corrupted or not valid JSON.' };
    }
  };

  const value = useMemo(
    () => ({
      ...data,
      syncState,
      isCloudConnected: !!user,
      triggerCloudSync,
      selectedMemberId,
      setSelectedMemberId,
      getMemberById,
      addMember,
      updateMember,
      deleteMember,
      addMedication,
      updateMedication,
      deleteMedication,
      toggleMedicationTaken,
      logRefill,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      toggleAppointmentCompleted,
      addDocument,
      deleteDocument,
      addVisitSummary,
      deleteVisitSummary,
      updateSettings,
      resetToDemoData,
      exportBackup,
      importBackup,
      clearAllData,
    }),
    [data, syncState, user, selectedMemberId, pushToCloud]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
