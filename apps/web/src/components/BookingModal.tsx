import React, { useState, useEffect } from 'react';
import { DoctorProfile } from '@tapza/shared-types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface BookingModalProps {
  doctor: DoctorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string;
  initialTimeSlot?: string;
}

const DEFAULT_SLOTS = [
  { id: 'slot-1', time_slot: '09:00 AM - 09:30 AM', is_booked: false },
  { id: 'slot-2', time_slot: '09:30 AM - 10:00 AM', is_booked: false },
  { id: 'slot-3', time_slot: '10:00 AM - 10:30 AM', is_booked: false },
  { id: 'slot-4', time_slot: '10:30 AM - 11:00 AM', is_booked: false },
  { id: 'slot-5', time_slot: '11:00 AM - 11:30 AM', is_booked: false },
  { id: 'slot-6', time_slot: '11:30 AM - 12:00 PM', is_booked: false },
  { id: 'slot-7', time_slot: '02:00 PM - 02:30 PM', is_booked: false },
  { id: 'slot-8', time_slot: '02:30 PM - 03:00 PM', is_booked: false },
  { id: 'slot-9', time_slot: '03:00 PM - 03:30 PM', is_booked: false },
  { id: 'slot-10', time_slot: '03:30 PM - 04:00 PM', is_booked: false },
  { id: 'slot-11', time_slot: '04:00 PM - 04:30 PM', is_booked: false },
  { id: 'slot-12', time_slot: '04:30 PM - 05:00 PM', is_booked: false },
  { id: 'slot-13', time_slot: '05:00 PM - 05:30 PM', is_booked: false },
  { id: 'slot-14', time_slot: '05:30 PM - 06:00 PM', is_booked: false },
];

export const BookingModal: React.FC<BookingModalProps> = ({ 
  doctor, 
  isOpen, 
  onClose, 
  onSuccess,
  initialDate,
  initialTimeSlot
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<{ id: string; time_slot: string; is_booked: boolean }[]>(DEFAULT_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<string>(initialTimeSlot || '09:00 AM - 09:30 AM');
  const [reason, setReason] = useState<string>('General Consultation Checkup');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (doctor && isOpen) {
      const activeDate = initialDate || selectedDate;
      if (initialDate) setSelectedDate(initialDate);
      if (initialTimeSlot) setSelectedSlot(initialTimeSlot);
      fetchSlots(activeDate);
    }
  }, [doctor, isOpen, initialDate, initialTimeSlot]);

  const fetchSlots = async (date: string) => {
    if (!doctor) return;
    let rawSlots = DEFAULT_SLOTS;

    try {
      const res = await api.get(`/doctors/${doctor.id}/slots?date=${date}`);
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        rawSlots = res.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch doctor availability slots, using fallback slots', err);
    }

    let unbooked = rawSlots.filter((s: any) => !s.is_booked);
    if (unbooked.length === 0) {
      unbooked = DEFAULT_SLOTS;
    }

    if (initialTimeSlot && !unbooked.some((s: any) => s.time_slot === initialTimeSlot)) {
      unbooked = [{ id: 'slot-init', time_slot: initialTimeSlot, is_booked: false }, ...unbooked];
    }

    setAvailableSlots(unbooked);

    const match = unbooked.find((s: any) => s.time_slot === initialTimeSlot);
    if (match) {
      setSelectedSlot(match.time_slot);
    } else if (unbooked.length > 0) {
      setSelectedSlot(unbooked[0].time_slot);
    }
  };

  if (!isOpen || !doctor) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
            🔒
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Sign In Required</h3>
          <p className="text-xs text-slate-500">Please sign in or register to book an appointment with {doctor.name}.</p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/login';
              }}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        doctor_id: doctor.id,
        booking_date: selectedDate,
        time_slot: selectedSlot,
        reason,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.data);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError(`Conflict! Slot ${selectedSlot} has already been booked by another patient. Please select a different time slot.`);
      } else {
        setError(err.response?.data?.error || 'Failed to book appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={doctor.photo_url}
              alt={doctor.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500';
              }}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-sm"
            />
            <div>
              <h3 className="text-base font-extrabold">{doctor.name}</h3>
              <p className="text-xs text-teal-100">{doctor.specialty} • {doctor.clinic_name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setBookingSuccess(null);
              setError(null);
              onClose();
            }}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          /* Booking Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h4>
            <p className="text-sm text-slate-600">
              Your consultation with <span className="font-semibold text-slate-900">{bookingSuccess.doctor_name}</span> is booked for <span className="font-semibold text-teal-600">{bookingSuccess.booking_date}</span> at <span className="font-semibold text-teal-600">{bookingSuccess.time_slot}</span>.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
              <div>Booking Reference: <span className="font-mono font-bold text-slate-900">{bookingSuccess.id}</span></div>
              <div>Clinic: <span className="font-semibold">{bookingSuccess.clinic_name}</span></div>
              <div>Consultation Fee: <span className="font-semibold text-emerald-600">₹{bookingSuccess.fee}</span></div>
            </div>
            <button
              onClick={() => {
                setBookingSuccess(null);
                onClose();
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Done & View My Bookings
            </button>
          </div>
        ) : (
          /* Booking Form State */
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-semibold"
              />
            </div>

            {/* Select Time Slot Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Available Time Slots
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={slot.is_booked}
                    onClick={() => setSelectedSlot(slot.time_slot)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                      slot.is_booked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : selectedSlot === slot.time_slot
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    {slot.time_slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Reason for Visit
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Mild fever, cold, annual checkup..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Fee summary & Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Consultation Fee</span>
                <div className="text-lg font-black text-slate-900">₹{doctor.consultation_fee}</div>
              </div>
              <button
                disabled={loading || !selectedSlot}
                onClick={handleConfirmBooking}
                className={`px-6 py-3 text-sm font-bold text-white rounded-xl shadow-lg flex items-center gap-2 transition-all ${
                  loading || !selectedSlot
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
