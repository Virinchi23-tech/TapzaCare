import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DoctorProfile } from '@tapza/shared-types';
import { api } from '../lib/api';
import { BookingModal } from '../components/BookingModal';
import { Search, Star, MapPin, Stethoscope, Loader2 } from 'lucide-react';

const FALLBACK_DOCTORS: DoctorProfile[] = [
  {
    id: 'd-1',
    user_id: 'u-doc-1',
    name: 'Dr. Sunita Reddy',
    specialty: 'General Physician',
    qualifications: 'MBBS, MD (General Medicine)',
    experience_years: 10,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 800,
    bio: 'Dr. Sunita Reddy is a dedicated General Physician with over 10 years of experience in comprehensive family healthcare, seasonal fever management, and preventive wellness.',
    rating: 4.8,
    reviews_count: 248,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-1.jpg',
    is_active: true,
  },
  {
    id: 'd-2',
    user_id: 'u-doc-2',
    name: 'Dr. K. Srinivas Rao',
    specialty: 'Cardiologist',
    qualifications: 'MD, DM (Cardiology)',
    experience_years: 14,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1500,
    bio: 'Senior Consultant Cardiologist specializing in preventive heart health, 2D Echo diagnostics, hypertension control, and non-invasive cardiology.',
    rating: 4.9,
    reviews_count: 312,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-2.jpg',
    is_active: true,
  },
  {
    id: 'd-3',
    user_id: 'u-doc-3',
    name: 'Dr. Ananya Sharma',
    specialty: 'Dermatologist',
    qualifications: 'MBBS, MD (Dermatology)',
    experience_years: 9,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1200,
    bio: 'Expert clinical dermatologist specializing in skin rejuvenation, laser skin therapy, acne treatment, and advanced trichology procedures.',
    rating: 4.9,
    reviews_count: 162,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-3.jpg',
    is_active: true,
  },
  {
    id: 'd-4',
    user_id: 'u-doc-4',
    name: 'Dr. Vikram Varma',
    specialty: 'Pediatrician',
    qualifications: 'MBBS, MD (Pediatrics), DCH',
    experience_years: 8,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1000,
    bio: 'Compassionate pediatrician focusing on child growth monitoring, newborn vaccination schedules, infant care, and pediatric nutrition.',
    rating: 4.8,
    reviews_count: 210,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-4.jpg',
    is_active: true,
  },
  {
    id: 'd-5',
    user_id: 'u-doc-5',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Orthopedist',
    qualifications: 'MBBS, MS (Orthopedics)',
    experience_years: 11,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1300,
    bio: 'Leading Orthopedic surgeon specializing in knee & hip joint pain, sports injury rehabilitation, fracture care, and spine wellness.',
    rating: 4.7,
    reviews_count: 175,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-5.jpg',
    is_active: true,
  },
  {
    id: 'd-6',
    user_id: 'u-doc-6',
    name: 'Dr. Kavita Rao',
    specialty: 'Gynecologist',
    qualifications: 'MBBS, MS (Obstetrics & Gynecology)',
    experience_years: 12,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1200,
    bio: 'Senior Obstetrician and Gynecologist providing comprehensive women healthcare, prenatal guidance, high-risk pregnancy management, and laparoscopic surgery.',
    rating: 4.9,
    reviews_count: 280,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-6.jpg',
    is_active: true,
  },
  {
    id: 'd-7',
    user_id: 'u-doc-7',
    name: 'Dr. Suresh Deshmukh',
    specialty: 'Neurologist',
    qualifications: 'MBBS, MD, DM (Neurology)',
    experience_years: 15,
    languages: ['English', 'Hindi', 'Telugu'],
    consultation_fee: 1600,
    bio: 'Renowned Neurologist specializing in stroke management, chronic migraine disorders, epilepsy care, memory loss, and neuromuscular diagnostics.',
    rating: 4.8,
    reviews_count: 198,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-7.jpg',
    is_active: true,
  },
  {
    id: 'd-8',
    user_id: 'u-doc-8',
    name: 'Dr. Meera Nambiar',
    specialty: 'ENT Specialist',
    qualifications: 'MBBS, MS (ENT)',
    experience_years: 7,
    languages: ['English', 'Telugu', 'Hindi', 'Malayalam'],
    consultation_fee: 900,
    bio: 'Experienced ENT specialist treating sinus issues, hearing loss evaluation, chronic throat infections, and nasal allergies.',
    rating: 4.8,
    reviews_count: 142,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-8.jpg',
    is_active: true,
  },
  {
    id: 'd-9',
    user_id: 'u-doc-9',
    name: 'Dr. Anish Sharma',
    specialty: 'General Physician',
    qualifications: 'MBBS, DNB (Family Medicine)',
    experience_years: 8,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 750,
    bio: 'Dr. Anish Sharma provides holistic primary healthcare, chronic disease screening, diabetes management, and lifestyle counseling.',
    rating: 4.7,
    reviews_count: 156,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-9.jpg',
    is_active: true,
  },
  {
    id: 'd-10',
    user_id: 'u-doc-10',
    name: 'Dr. Priya Nair',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD, DNB (Cardiology)',
    experience_years: 11,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1400,
    bio: 'Expert Interventional Cardiologist specializing in cardiac risk assessment, arrhythmia management, and preventive cardiovascular wellness.',
    rating: 4.8,
    reviews_count: 220,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-10.jpg',
    is_active: true,
  },
  {
    id: 'd-11',
    user_id: 'u-doc-11',
    name: 'Dr. Arjun Mehta',
    specialty: 'Dermatologist',
    qualifications: 'MBBS, DVD (Dermatology)',
    experience_years: 10,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1100,
    bio: 'Consultant Dermatologist and Cosmetologist specializing in pediatric skin conditions, eczema care, anti-aging therapies, and hair restoration.',
    rating: 4.8,
    reviews_count: 185,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-11.jpg',
    is_active: true,
  },
  {
    id: 'd-12',
    user_id: 'u-doc-12',
    name: 'Dr. Deepa Joshi',
    specialty: 'Pediatrician',
    qualifications: 'MBBS, DNB (Pediatrics)',
    experience_years: 12,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1000,
    bio: 'Senior Pediatrician with extensive expertise in child development, adolescent medicine, pediatric asthma care, and emergency pediatric checkups.',
    rating: 4.9,
    reviews_count: 265,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-12.jpg',
    is_active: true,
  },
  {
    id: 'd-13',
    user_id: 'u-doc-13',
    name: 'Dr. Sneha Kulkarni',
    specialty: 'Orthopedist',
    qualifications: 'MBBS, MS, DNB (Orthopedics)',
    experience_years: 9,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 1250,
    bio: 'Orthopedic Specialist focusing on pediatric orthopedics, bone density wellness, arthritis therapy, and minimally invasive joint care.',
    rating: 4.8,
    reviews_count: 160,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-13.jpg',
    is_active: true,
  },
  {
    id: 'd-14',
    user_id: 'u-doc-14',
    name: 'Dr. Ritu Agarwal',
    specialty: 'Gynecologist',
    qualifications: 'MBBS, DGO, MD (Gynecology)',
    experience_years: 15,
    languages: ['English', 'Hindi', 'Telugu'],
    consultation_fee: 1300,
    bio: 'Renowned Gynecologist specializing in PCOD/PCOS management, adolescent gynecological wellness, fertility counseling, and menopause care.',
    rating: 4.9,
    reviews_count: 310,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-14.jpg',
    is_active: true,
  },
  {
    id: 'd-15',
    user_id: 'u-doc-15',
    name: 'Dr. Alok Tripathi',
    specialty: 'Neurologist',
    qualifications: 'MBBS, DNB, MCh (Neurosurgery)',
    experience_years: 13,
    languages: ['English', 'Hindi', 'Telugu'],
    consultation_fee: 1700,
    bio: 'Senior Neurosurgeon expert in spine disorders, brain trauma care, nerve repair surgery, and advanced neuro-critical management.',
    rating: 4.9,
    reviews_count: 240,
    clinic_name: 'CarePlus Medical Hub',
    available_today: true,
    photo_url: '/doctors/d-15.jpg',
    is_active: true,
  },
  {
    id: 'd-16',
    user_id: 'u-doc-16',
    name: 'Dr. Siddharth Iyer',
    specialty: 'ENT Specialist',
    qualifications: 'MBBS, DLO, MS (ENT)',
    experience_years: 10,
    languages: ['English', 'Telugu', 'Hindi'],
    consultation_fee: 950,
    bio: 'Senior ENT Surgeon specializing in endoscopic sinus surgery, vertigo treatment, snoring disorders, and pediatric ENT consultations.',
    rating: 4.7,
    reviews_count: 178,
    clinic_name: 'Tapza Health Center',
    available_today: true,
    photo_url: '/doctors/d-16.jpg',
    is_active: true,
  },
];

const DEFAULT_DOCTOR_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

const isSpecialtyMatch = (doctorSpecialty: string, selectedSpec: string) => {
  if (!selectedSpec || selectedSpec === 'All') return true;
  const doc = doctorSpecialty.toLowerCase();
  const sel = selectedSpec.toLowerCase();
  if (doc.includes(sel) || sel.includes(doc)) return true;
  if (sel.includes('cardio') && doc.includes('cardio')) return true;
  if (sel.includes('derma') && doc.includes('derma')) return true;
  if (sel.includes('pediatr') && doc.includes('pediatr')) return true;
  if (sel.includes('ortho') && doc.includes('ortho')) return true;
  if (sel.includes('gynec') && doc.includes('gynec')) return true;
  if (sel.includes('neuro') && doc.includes('neuro')) return true;
  if (sel.includes('ent') && doc.includes('ent')) return true;
  if ((sel.includes('general') || sel.includes('physician')) && (doc.includes('general') || doc.includes('physician'))) return true;
  return false;
};

export const DoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlSpecialty = searchParams.get('specialty') || 'All';
  const urlSearch = searchParams.get('search') || '';

  const [doctors, setDoctors] = useState<DoctorProfile[]>(FALLBACK_DOCTORS);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState(urlSpecialty);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const specialties = [
    'All',
    'General Physician',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Gynecology',
    'Neurology',
    'ENT',
  ];

  useEffect(() => {
    setSelectedSpecialty(urlSpecialty);
    setSearchTerm(urlSearch);
    fetchDoctors(urlSpecialty, urlSearch);
  }, [searchParams]);

  const fetchDoctors = async (spec: string, search: string) => {
    setLoading(true);
    try {
      let url = '/doctors?';
      if (spec && spec !== 'All') url += `specialty=${encodeURIComponent(spec)}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data);
      } else {
        applyFallbackFilter(spec, search);
      }
    } catch (err) {
      console.error('Failed to fetch doctors from API, using client fallback', err);
      applyFallbackFilter(spec, search);
    } finally {
      setLoading(false);
    }
  };

  const applyFallbackFilter = (spec: string, search: string) => {
    let filtered = FALLBACK_DOCTORS;
    if (spec && spec !== 'All') {
      filtered = filtered.filter((d) => isSpecialtyMatch(d.specialty, spec));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.clinic_name.toLowerCase().includes(q)
      );
    }
    setDoctors(filtered);
  };

  const handleSpecialtyClick = (spec: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (spec === 'All') {
      newParams.delete('specialty');
    } else {
      newParams.set('specialty', spec);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('search', value.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Find a Doctor</h1>
        <p className="text-sm text-slate-500 mb-6">Book appointments with top verified specialist clinicians near you.</p>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search doctors by name, specialty, or hospital..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecialtyClick(spec)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSpecialty === spec || (spec === 'All' && (selectedSpecialty === 'All' || !selectedSpecialty))
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors found</h3>
          <p className="text-xs text-slate-400 mt-1">Try searching for a different specialty or term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doctor.photo_url}
                    alt={doctor.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_DOCTOR_PHOTO;
                    }}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{doctor.name}</h3>
                    </div>
                    <p className="text-xs font-bold text-teal-600 mb-1">{doctor.specialty} • {doctor.experience_years} yrs exp</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{doctor.rating}</span>
                      <span className="text-slate-400 font-normal">({doctor.reviews_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{doctor.clinic_name}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{doctor.bio}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Consultation Fee</span>
                    <span className="text-base font-black text-slate-900">₹{doctor.consultation_fee}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                    Available Today
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setIsBookingOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors text-center"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        doctor={selectedDoctor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
