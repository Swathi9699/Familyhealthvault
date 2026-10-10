import React, { useState, useEffect } from 'react';
import { useVault } from '@/lib/vault-store';
import { Medication } from '@/types';
import {
  sendMedicationNotification,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '@/lib/notification-service';
import { Bell, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const MedicationReminderBanner: React.FC = () => {
  const { medications, toggleMedicationTaken } = useVault();
  const [activeAlertMed, setActiveAlertMed] = useState<Medication | null>(null);
  const [dismissedMeds, setDismissedMeds] = useState<Record<string, boolean>>({});
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  useEffect(() => {
    // Check permission state
    setPermission(getNotificationPermission());
  }, []);

  // Periodic reminder scheduler (runs every 30 seconds)
  useEffect(() => {
    const checkScheduledReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const activeUnTakenMeds = medications.filter(
        (m) =>
          m.status === 'active' &&
          !m.takenToday &&
          m.reminderEnabled !== false &&
          !dismissedMeds[m.id]
      );

      for (const med of activeUnTakenMeds) {
        // If specific reminder times are set, check if current time matches
        // Or if it's past reminder time and not taken
        const scheduledTimes = med.reminderTimes && med.reminderTimes.length > 0
          ? med.reminderTimes
          : ['08:00']; // Default morning dose time

        const isDue = scheduledTimes.some((time) => {
          // Trigger if currently on the time minute or within recent window
          return time <= currentTimeStr;
        });

        if (isDue) {
          setActiveAlertMed(med);

          // Dispatch native browser notification
          sendMedicationNotification({
            title: `Medication Due: ${med.name}`,
            body: `Dose for ${med.familyMemberName} (${med.dosage}) - ${med.instructions || med.frequency}`,
            tag: `med-due-${med.id}-${new Date().toISOString().split('T')[0]}`,
            onClick: () => {
              toggleMedicationTaken(med.id);
            },
          });
          break; // Show one active alert banner at a time
        }
      }
    };

    // Run immediately on mount, then every 30 seconds
    checkScheduledReminders();
    const interval = setInterval(checkScheduledReminders, 30000);
    return () => clearInterval(interval);
  }, [medications, dismissedMeds, toggleMedicationTaken]);

  const handleMarkTaken = (medId: string) => {
    toggleMedicationTaken(medId);
    setActiveAlertMed(null);
  };

  const handleDismiss = (medId: string) => {
    setDismissedMeds((prev) => ({ ...prev, [medId]: true }));
    setActiveAlertMed(null);
  };

  const handleEnablePermissions = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  if (!activeAlertMed) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-3 shadow-md border-b border-amber-600 transition-all animate-in slide-in-from-top duration-300">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-600 shrink-0 text-white animate-bounce">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight">
              Medication Due: {activeAlertMed.name} ({activeAlertMed.dosage})
            </span>
            <span className="text-amber-100 ml-1.5 block sm:inline">
              For {activeAlertMed.familyMemberName} · {activeAlertMed.frequency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => handleMarkTaken(activeAlertMed.id)}
            className="px-3 py-1.5 rounded-lg bg-white text-amber-900 hover:bg-amber-50 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>Mark as Taken</span>
          </button>

          <button
            onClick={() => handleDismiss(activeAlertMed.id)}
            className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-600 transition-colors"
            title="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
