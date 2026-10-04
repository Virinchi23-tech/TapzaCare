import React, { useState, useEffect } from 'react';
import { Booking } from '@tapza/shared-types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, RefreshCw, AlertCircle, Loader2, Stethoscope, LogIn } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.post(`/bookings/${id}/cancel`);
      if (res.data.success) {
        setActionMessage('Appointment cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-teal-100">
          <Calendar className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to view your upcoming and past doctor appointments.
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
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending' || b.status === 'rescheduled';
    if (activeTab === 'past') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-sm text-slate-500">Track and manage your medical consultations.</p>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 underline">Dismiss</button>
        </div>
      )}

      {/* Filter Tabs matching Image 2 */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-8 border border-slate-200/60">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'upcoming' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'past' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'cancelled' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No {activeTab} appointments</h3>
          <p className="text-xs text-slate-400 mt-1">Book a consultation with top doctors in seconds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 font-extrabold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-extrabold text-slate-900">{booking.doctor_name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-teal-600 mb-2">{booking.specialty} • {booking.clinic_name}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" /> {booking.booking_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" /> {booking.time_slot}
                    </span>
                    <span className="font-extrabold text-slate-900">₹{booking.fee}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons for upcoming bookings */}
              {activeTab === 'upcoming' && (
                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
