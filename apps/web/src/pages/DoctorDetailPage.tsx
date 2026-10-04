import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorProfile } from '@tapza/shared-types';
import { api } from '../lib/api';
import { BookingModal } from '../components/BookingModal';
import { Star, MapPin, Award, Languages, Calendar, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await api.get(`/doctors/${id}`);
        if (res.data.success) {
          setDoctor(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch doctor detail', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-teal-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <button onClick={() => navigate('/doctors')} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Back to Doctors Directory
        </button>
      </div>
    );
  }

  const specializations = ['Fever', 'Cold & Cough', 'Diabetes', 'Hypertension', 'General Checkup'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-8">
        {/* Cover / Photo */}
        <div className="relative h-64 bg-slate-900">
          <img
            src={doctor.photo_url}
            alt={doctor.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
            }}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-white" /> Top Rated Clinician
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-3xl font-black mb-1">{doctor.name}</h1>
            <p className="text-sm font-semibold text-teal-300">{doctor.specialty} • {doctor.qualifications} • {doctor.experience_years} Years Experience</p>
          </div>
        </div>

        {/* Details section */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Vitals row */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
              <div className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {doctor.rating} ({doctor.reviews_count})
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Experience</span>
              <div className="text-base font-extrabold text-slate-900">{doctor.experience_years}+ Years</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Consultation Fee</span>
              <div className="text-base font-black text-teal-700">₹{doctor.consultation_fee}</div>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">About Doctor</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Clinic Location */}
          <div className="flex items-center gap-3 p-4 bg-teal-50/60 rounded-2xl border border-teal-100 text-slate-800">
            <MapPin className="w-6 h-6 text-teal-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-teal-900 block">{doctor.clinic_name}</span>
              <span className="text-xs text-slate-500">Jubilee Hills Main Road, Hyderabad</span>
            </div>
          </div>

          {/* Specializes in tags matching Image 2 */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Specializes In</h3>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Languages Spoken */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-teal-600" /> Languages Spoken
            </h3>
            <p className="text-sm font-semibold text-slate-700">
              {Array.isArray(doctor.languages) ? doctor.languages.join(', ') : doctor.languages}
            </p>
          </div>

          {/* Book Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Consultation Fee</span>
              <div className="text-2xl font-black text-slate-900">₹{doctor.consultation_fee}</div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        doctor={doctor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
