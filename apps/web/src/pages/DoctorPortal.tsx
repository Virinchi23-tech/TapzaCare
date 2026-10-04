import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Mail, 
  ShieldCheck,
  Building,
  DollarSign,
  Award
} from 'lucide-react';
import { IssuePrescriptionModal } from '../components/IssuePrescriptionModal';

export const DoctorPortal: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState({ name: '', id: '' });

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, docsRes] = await Promise.all([
        api.get('/admin/bookings').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/doctors?all=true').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      if (docsRes.data.success && user) {
        const found = docsRes.data.data.find(
          (d: any) => d.user_id === user.id || d.email?.toLowerCase() === user.email?.toLowerCase()
        );
        if (found) setDoctorProfile(found);
      }
    } catch (err) {
      console.error('Failed to fetch doctor portal data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    try {
      await api.patch(`/admin/bookings/${id}`, { status: newStatus });
      showNotify(`Appointment status updated to ${newStatus}!`);
    } catch (err) {
      console.error(err);
      fetchDoctorData();
    }
  };

  const handleOpenRxModal = (patientName: string = '', patientId?: string) => {
    setSelectedPatient({ name: patientName, id: patientId || '' });
    setIsRxModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Modal Dialog */}
      <IssuePrescriptionModal
        isOpen={isRxModalOpen}
        onClose={() => setIsRxModalOpen(false)}
        onSuccess={() => showNotify('Prescription issued successfully!')}
        defaultPatientName={selectedPatient.name}
        defaultPatientId={selectedPatient.id}
        defaultDoctorName={doctorProfile?.name || user?.name || ''}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-xs font-bold">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Clinical Portal</span>
          </div>
          <h1 className="text-3xl font-black">Welcome, {user?.name || 'Doctor'}</h1>
          <p className="text-xs text-teal-100 max-w-xl">
            Manage your patient consultations, review booking schedules, issue prescriptions, and update appointment records.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-2 text-teal-200 font-mono">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-400" /> {user?.email}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Role: Doctor</span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => handleOpenRxModal()}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Issue New Prescription
          </button>
          {doctorProfile && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 shrink-0 hidden sm:flex">
              <img
                src={doctorProfile.photo_url || '/doctors/d-1.jpg'}
                alt={doctorProfile.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-teal-400/50 shadow-md"
              />
              <div className="text-xs">
                <div className="font-bold text-white text-sm">{doctorProfile.name}</div>
                <div className="text-teal-300 font-semibold">{doctorProfile.specialty}</div>
                <div className="text-slate-300 mt-1">{doctorProfile.qualifications} • ₹{doctorProfile.consultation_fee}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">Patient Appointments & Consultations</h2>
            <p className="text-xs text-slate-500 mt-1">Review booked slots, issue digital prescriptions, and update status as visits complete.</p>
          </div>
          <div className="px-4 py-2 bg-teal-50 text-teal-800 text-xs font-extrabold rounded-xl border border-teal-200">
            Total Appointments: {bookings.length}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading appointments...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">No appointments scheduled at the moment.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:border-teal-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{b.patient_name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-600" /> {b.booking_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> {b.time_slot}</span>
                    <span>Fee: ₹{b.fee}</span>
                  </div>
                  {b.reason && <p className="text-xs text-slate-600 mt-1 italic">Reason: "{b.reason}"</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleOpenRxModal(b.patient_name, b.patient_id)}
                    className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-extrabold rounded-xl border border-teal-200 shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> Issue Prescription
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">Status:</span>
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                      className="text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer shadow-sm hover:border-teal-400 transition-colors"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
