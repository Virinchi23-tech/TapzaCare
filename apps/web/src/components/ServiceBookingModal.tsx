import React, { useState, useEffect } from 'react';
import { HealthcareService } from '@tapza/shared-types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, CheckCircle2, AlertTriangle, Loader2, TestTube, Sparkles, ShieldCheck } from 'lucide-react';

interface ServiceBookingModalProps {
  service: HealthcareService | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SERVICE_TIME_SLOTS = [
  '08:00 AM - 08:30 AM',
  '08:30 AM - 09:00 AM',
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '04:00 PM - 04:30 PM',
  '05:00 PM - 05:30 PM',
  '06:00 PM - 06:30 PM',
];

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>(SERVICE_TIME_SLOTS[0]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedSlot(SERVICE_TIME_SLOTS[0]);
      setNotes('');
      setError(null);
      setBookingSuccess(null);
    }
  }, [isOpen, service]);

  if (!isOpen || !service) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
            🔒
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Sign In Required</h3>
          <p className="text-xs text-slate-500">Please sign in or register to book {service.name}.</p>
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
                navigate('/login');
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
      setError('Please select an available time slot for your service test.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        service_id: service.id,
        booking_date: selectedDate,
        time_slot: selectedSlot,
        notes,
        reason: `Healthcare Service / Lab Checkup: ${service.name}`,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.data);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError(`Conflict! Slot ${selectedSlot} has already been reserved for this service. Please select another time slot.`);
      } else {
        setError(err.response?.data?.error || 'Failed to confirm service booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black shrink-0 border border-white/30">
              <TestTube className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-teal-200 tracking-wider bg-white/10 px-2 py-0.5 rounded">
                {service.category || 'Healthcare Service'}
              </span>
              <h3 className="text-base font-extrabold text-white mt-0.5">{service.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          /* Booking Success Screen */
          <div className="p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Service Test Scheduled! 🎉</h4>
            <p className="text-sm text-slate-600">
              Your appointment for <span className="font-extrabold text-slate-900">{service.name}</span> is confirmed for <span className="font-extrabold text-teal-600">{bookingSuccess.booking_date}</span> at <span className="font-extrabold text-teal-600">{bookingSuccess.time_slot}</span>.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 text-slate-600 border border-slate-200/70 text-left">
              <div>Booking Reference: <span className="font-mono font-bold text-slate-900">{bookingSuccess.id}</span></div>
              <div>Service Package: <span className="font-bold text-slate-800">{service.name}</span></div>
              <div>Center: <span className="font-semibold text-slate-800">{bookingSuccess.clinic_name || 'Tapza Care Diagnostic Hub'}</span></div>
              <div>Total Fee: <span className="font-black text-emerald-600">₹{bookingSuccess.fee || service.price}</span></div>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate('/bookings');
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg transition-colors text-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> View My Bookings Page
            </button>
          </div>
        ) : (
          /* Form Screen */
          <div className="p-6 space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Service Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">{service.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Price</span>
                <span className="text-xl font-black text-teal-700">₹{service.price}</span>
              </div>
            </div>

            {/* Select Booking Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Select Preferred Test Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Select Time Slot */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Select Available Time Slot
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {SERVICE_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-2 text-xs font-extrabold rounded-xl border text-center transition-all ${
                      selectedSlot === slot
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Patient Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Fasting required, home sample collection..."
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Payable</span>
                <div className="text-xl font-black text-slate-900">₹{service.price}</div>
              </div>
              <button
                disabled={loading || !selectedSlot}
                onClick={handleConfirmBooking}
                className={`px-6 py-3 text-xs font-black text-white rounded-xl shadow-lg flex items-center gap-2 transition-all ${
                  loading || !selectedSlot
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Confirm Service Test Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
