import React, { useState, useEffect } from 'react';
import { MedicineReminder } from '@tapza/shared-types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Trash2, Clock, CheckCircle2, AlertTriangle, Loader2, LogIn } from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [time, setTime] = useState('08:00 AM');

  useEffect(() => {
    if (user) {
      fetchReminders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (res.data.success) {
        setReminders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName) return;

    try {
      const res = await api.post('/reminders', {
        medicine_name: medicineName,
        dosage,
        time,
        recurrence: 'Daily',
      });
      if (res.data.success) {
        setMedicineName('');
        setIsModalOpen(false);
        fetchReminders();
      }
    } catch (err) {
      console.error('Failed to add reminder', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/reminders/${id}`, { is_active: !currentStatus });
      fetchReminders();
    } catch (err) {
      console.error('Failed to update reminder', err);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await api.delete(`/reminders/${id}`);
      fetchReminders();
    } catch (err) {
      console.error('Failed to delete reminder', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-teal-100">
          <Bell className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to view and configure your daily medicine intake reminders.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medicine Reminders</h1>
          <p className="text-sm text-slate-500">Set daily medicine intake alerts so you never miss a dose.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active medicine reminders</h3>
          <p className="text-xs text-slate-400 mt-1">Tap 'Add Reminder' to schedule daily intake notifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                reminder.is_active ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{reminder.medicine_name}</h4>
                    {(reminder as any).taken_today && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Taken Today
                      </span>
                    )}
                    {(reminder as any).is_expired && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Expired
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{reminder.dosage} • {reminder.recurrence}</p>
                  <div className="flex items-center gap-1 text-xs font-bold text-teal-600 mt-1">
                    <Clock className="w-3.5 h-3.5" /> {reminder.time}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(reminder.id, reminder.is_active)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    reminder.is_active ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                      reminder.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddReminder} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Create Medicine Reminder</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medicine Name</label>
              <input
                type="text"
                required
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 Tablet"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 08:00 AM"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-teal-700"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
