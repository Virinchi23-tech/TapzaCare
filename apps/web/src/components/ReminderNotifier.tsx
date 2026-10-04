import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { MedicineReminder } from '@tapza/shared-types';
import { Bell, CheckCircle2, Clock, X, Pill, ShieldAlert } from 'lucide-react';

function isTimeMatchingNow(timeStr: string): boolean {
  if (!timeStr) return false;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const reminderMins = hours * 60 + minutes;
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Allow notification ONLY if current time is within ±45 minutes of scheduled time
  const diff = Math.abs(currentMins - reminderMins);
  return diff <= 45;
}

export const ReminderNotifier: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [activeAlert, setActiveAlert] = useState<MedicineReminder | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tapza_dismissed_reminders') || '[]');
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      fetchReminders();
      const interval = setInterval(fetchReminders, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Filter out expired, taken today, or out-of-time-window reminders
        const dueReminders = res.data.data.filter((r: any) => 
          r.is_active && 
          !r.is_expired && 
          !r.taken_today &&
          isTimeMatchingNow(r.time)
        );

        setReminders(dueReminders);

        const storedDismissed: string[] = JSON.parse(localStorage.getItem('tapza_dismissed_reminders') || '[]');
        const next = dueReminders.find((r: any) => 
          !dismissedIds.includes(r.id) && !storedDismissed.includes(r.id)
        );

        if (next) {
          setActiveAlert(next);
        } else {
          setActiveAlert(null);
        }
      } else {
        setActiveAlert(null);
      }
    } catch (err) {
      // quiet fail
    }
  };

  const handleMarkTaken = async () => {
    if (!activeAlert) return;
    const target = activeAlert;

    // Immediately dismiss alert from state and storage so it closes instantly
    setActiveAlert(null);
    setDismissedIds((prev) => [...prev, target.id]);
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('tapza_dismissed_reminders') || '[]');
      localStorage.setItem('tapza_dismissed_reminders', JSON.stringify([...stored, target.id]));
    } catch (e) {}

    try {
      await api.post('/dose-logs', {
        prescription_id: (target as any).prescription_id || target.id,
        medicine_name: target.medicine_name,
        dose_time: target.time,
        status: 'taken',
      });
      setNotificationMsg(`Dose recorded for ${target.medicine_name}!`);
      setTimeout(() => setNotificationMsg(null), 3500);
      fetchReminders();
    } catch (err) {
      console.error('Failed to log dose intake', err);
    }
  };

  const handleDismiss = () => {
    if (!activeAlert) return;
    const targetId = activeAlert.id;
    setActiveAlert(null);
    setDismissedIds((prev) => [...prev, targetId]);
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('tapza_dismissed_reminders') || '[]');
      localStorage.setItem('tapza_dismissed_reminders', JSON.stringify([...stored, targetId]));
    } catch (e) {}
  };

  if (!user || !activeAlert) return (
    <>
      {notificationMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Real-time Medicine Reminder Alert Pop-up */}
      <div className="fixed bottom-6 right-6 z-[999] max-w-md w-full bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-teal-500/80 animate-slide-up space-y-3 backdrop-blur-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center shrink-0 animate-pulse">
              <Bell className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-teal-500/30 text-teal-300 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                <Clock className="w-3 h-3 text-teal-400" /> Real-time Intake Alert ({activeAlert.time})
              </div>
              <h4 className="text-base font-black text-white mt-1">{activeAlert.medicine_name}</h4>
              <p className="text-xs text-slate-300 font-medium">{activeAlert.dosage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkTaken}
            className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark Dose Taken
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            Snooze
          </button>
        </div>
      </div>
    </>
  );
};
