/**
 * Browser Notification Service for Medication Reminders
 * Uses the Web Notifications API with synthesized Web Audio chimes and permission handling.
 */

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
};

/**
 * Synthesizes a gentle two-tone chime using Web Audio API
 * No external mp3/wav files required, completely resilient against network or CORS errors.
 */
export const playReminderChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Pleasant two-tone bell chime (F5 -> A5)
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now); // F5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);

    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);
  } catch (err) {
    // Audio context may be restricted before user gesture
    console.debug('Chime audio blocked or unavailable:', err);
  }
};

export interface TriggerNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  sound?: boolean;
  onClick?: () => void;
}

export const sendMedicationNotification = ({
  title,
  body,
  tag,
  sound = true,
  onClick,
}: TriggerNotificationOptions): Notification | null => {
  if (sound) {
    playReminderChime();
  }

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const options: NotificationOptions = {
        body,
        icon: '/favicon.ico',
        tag: tag || 'family-med-reminder',
      };
      const notif = new Notification(title, options);

      if (onClick) {
        notif.onclick = () => {
          try {
            window.focus();
          } catch {}
          onClick();
          notif.close();
        };
      }

      return notif;
    } catch (err) {
      console.warn('Browser notification creation failed:', err);
    }
  }

  return null;
};
