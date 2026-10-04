import React, { useState, useRef, useEffect } from 'react';
import { HomeSectionConfig, DoctorProfile, HealthcareService } from '@tapza/shared-types';
import { api } from '../lib/api';
import { 
  Stethoscope, 
  TestTube, 
  Pill, 
  Syringe, 
  Activity, 
  Calendar, 
  FileText, 
  Bell, 
  Users, 
  ChevronRight,
  ChevronDown,
  Star,
  Sparkles,
  Search,
  Ambulance,
  HeartPulse,
  Baby
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DynamicSectionRendererProps {
  section: HomeSectionConfig;
  doctors: DoctorProfile[];
  services: HealthcareService[];
  onBookDoctor: (doctor: DoctorProfile, date?: string, timeSlot?: string) => void;
  onBookService?: (service: HealthcareService) => void;
  userName?: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDownwardDropdownProps {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
}

const CustomDownwardDropdown: React.FC<CustomDownwardDropdownProps> = ({
  label,
  placeholder,
  options,
  value = '',
  onSelect,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    setIsOpen(false);
    onSelect(option.value);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative px-3 py-2 bg-slate-50/90 hover:bg-slate-100/90 rounded-xl border border-slate-200/60 transition-colors" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 pointer-events-none select-none">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 outline-none cursor-pointer"
      >
        <span className="truncate pr-1">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 max-h-72 flex flex-col">
          {searchable && (
            <div className="relative mb-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-52 divide-y divide-slate-50 custom-scrollbar">
            <div
              onClick={() => handleSelect({ label: placeholder, value: '' })}
              className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between rounded-lg mb-1 ${
                !value ? 'bg-teal-50 text-teal-700 font-black' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{placeholder}</span>
            </div>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-medium">
                No matching {label.toLowerCase()} found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between rounded-lg ${
                    value === opt.value ? 'bg-teal-50 text-teal-700 font-black' : 'text-slate-700 hover:bg-teal-50/60 hover:text-teal-800'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({
  section,
  doctors,
  services,
  onBookDoctor,
  onBookService,
  userName = 'Guest Patient',
}) => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlotTimes, setAvailableSlotTimes] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAvailableSlots = async () => {
      if (!selectedDoctorId) {
        setAvailableSlotTimes([
          '09:00 AM - 09:30 AM',
          '09:30 AM - 10:00 AM',
          '10:00 AM - 10:30 AM',
          '10:30 AM - 11:00 AM',
          '11:00 AM - 11:30 AM',
          '11:30 AM - 12:00 PM',
          '02:00 PM - 02:30 PM',
          '02:30 PM - 03:00 PM',
          '03:00 PM - 03:30 PM',
          '03:30 PM - 04:00 PM',
          '04:00 PM - 04:30 PM',
          '04:30 PM - 05:00 PM',
          '05:00 PM - 05:30 PM',
          '05:30 PM - 06:00 PM',
        ]);
        return;
      }

      try {
        const res = await api.get(`/doctors/${selectedDoctorId}/slots?date=${selectedDate}`);
        if (res.data.success && isMounted) {
          const unbooked = res.data.data
            .filter((s: { is_booked: boolean }) => !s.is_booked)
            .map((s: { time_slot: string }) => s.time_slot);
          setAvailableSlotTimes(unbooked);
          if (selectedTimeSlot && !unbooked.includes(selectedTimeSlot)) {
            setSelectedTimeSlot('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch available slots', err);
      }
    };

    fetchAvailableSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDoctorId, selectedDate]);

  if (!section.visible) return null;

  // Renderers mapped by section.type
  switch (section.type) {
    case 'hero_banner': {
      const departmentOptions = [
        { label: 'General Physician', value: 'General Physician' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Dermatology', value: 'Dermatology' },
        { label: 'Pediatrics', value: 'Pediatrics' },
        { label: 'Orthopedics', value: 'Orthopedics' },
        { label: 'Gynecology', value: 'Gynecology' },
        { label: 'Neurology', value: 'Neurology' },
        { label: 'ENT', value: 'ENT' },
      ];

      const defaultTimeSlots = [
        '09:00 AM - 09:30 AM',
        '09:30 AM - 10:00 AM',
        '10:00 AM - 10:30 AM',
        '10:30 AM - 11:00 AM',
        '11:00 AM - 11:30 AM',
        '11:30 AM - 12:00 PM',
        '02:00 PM - 02:30 PM',
        '02:30 PM - 03:00 PM',
        '03:00 PM - 03:30 PM',
        '03:30 PM - 04:00 PM',
        '04:00 PM - 04:30 PM',
        '04:30 PM - 05:00 PM',
        '05:00 PM - 05:30 PM',
        '05:30 PM - 06:00 PM',
      ];

      const displaySlots = availableSlotTimes.length > 0 ? availableSlotTimes : defaultTimeSlots;
      const timeSlotOptions = displaySlots.map((t) => ({ label: t, value: t }));

      const availableDoctors = selectedDepartment
        ? doctors.filter((d) => d.specialty.toLowerCase().includes(selectedDepartment.toLowerCase()))
        : doctors;

      const doctorOptions = (availableDoctors.length > 0 ? availableDoctors : doctors).map((d) => ({
        label: d.name,
        value: d.id,
      }));

      const handleBookNow = () => {
        if (selectedDoctorId) {
          const doc = doctors.find((d) => d.id === selectedDoctorId);
          if (doc && onBookDoctor) {
            onBookDoctor(doc, selectedDate, selectedTimeSlot);
          } else {
            navigate(`/doctors/${selectedDoctorId}`);
          }
        } else if (selectedDepartment) {
          navigate(`/doctors?specialty=${encodeURIComponent(selectedDepartment)}`);
        } else {
          navigate('/doctors');
        }
      };

      return (
        <section className="relative rounded-3xl mb-8 shadow-xl text-white transition-all duration-300">
          <div 
            className="p-8 md:p-12 relative z-10 rounded-3xl"
            style={{
              background: section.background_value || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            }}
          >
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hello, {userName} 👋</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                {section.title || 'Your Health, Our Priority'}
              </h1>
              <p className="text-sm md:text-base text-teal-50 mb-8 max-w-lg leading-relaxed">
                {section.description || 'Compassionate care for you and your family. Book top doctors, consult online, and stay healthy.'}
              </p>

              {/* Glassmorphic Search / Quick Booking Overlay Box */}
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl text-slate-900 border border-white/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <CustomDownwardDropdown
                  label="Department"
                  placeholder="All Departments"
                  options={departmentOptions}
                  value={selectedDepartment}
                  onSelect={(val) => {
                    setSelectedDepartment(val);
                    if (selectedDoctorId) {
                      const currentDoc = doctors.find((d) => d.id === selectedDoctorId);
                      if (currentDoc && val && !currentDoc.specialty.toLowerCase().includes(val.toLowerCase())) {
                        setSelectedDoctorId('');
                      }
                    }
                  }}
                />

                <CustomDownwardDropdown
                  label="Doctor"
                  placeholder="Select Doctor"
                  options={doctorOptions}
                  value={selectedDoctorId}
                  onSelect={(val) => {
                    setSelectedDoctorId(val);
                    if (val) {
                      const doc = doctors.find((d) => d.id === val);
                      if (doc) {
                        setSelectedDepartment(doc.specialty);
                      }
                    }
                  }}
                />

                <div className="px-3 py-2 bg-slate-50/90 rounded-xl border border-slate-200/60">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  />
                </div>

                <CustomDownwardDropdown
                  label="Time"
                  placeholder="Select Time"
                  options={timeSlotOptions}
                  value={selectedTimeSlot}
                  onSelect={(val) => setSelectedTimeSlot(val)}
                />

                <button
                  onClick={handleBookNow}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Search className="w-3.5 h-3.5" /> Book Now
                </button>
              </div>
            </div>
          </div>
        </section>
      );
    }

    case 'category_chips': {
      const categories = [
        { name: 'General Physician', icon: Stethoscope, color: 'bg-teal-50 text-teal-600 border-teal-200' },
        { name: 'Cardiology', icon: HeartPulse, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        { name: 'Dermatology', icon: Sparkles, color: 'bg-rose-50 text-rose-600 border-rose-200' },
        { name: 'Pediatrics', icon: Baby, color: 'bg-amber-50 text-amber-600 border-amber-200' },
        { name: 'Orthopedics', icon: Activity, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
        { name: 'Gynecology', icon: HeartPulse, color: 'bg-pink-50 text-pink-600 border-pink-200' },
        { name: 'Neurology', icon: Activity, color: 'bg-purple-50 text-purple-600 border-purple-200' },
        { name: 'ENT', icon: Stethoscope, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
      ];

      return (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-slate-900">{section.title || 'Our Departments'}</h3>
            <button onClick={() => navigate('/doctors')} className="text-xs font-bold text-teal-600 hover:underline">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/doctors?specialty=${cat.name}`)}
                  className={`p-3.5 rounded-2xl border ${cat.color} cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all flex flex-col items-center text-center`}
                >
                  <div className="p-2.5 rounded-full bg-white shadow-sm mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    case 'quick_actions': {
      const actions = [
        { label: 'Book Appointment', route: '/doctors', icon: Calendar, color: 'bg-teal-500 text-white' },
        { label: 'My Prescriptions', route: '/prescriptions', icon: FileText, color: 'bg-indigo-500 text-white' },
        { label: 'Medicine Reminders', route: '/reminders', icon: Bell, color: 'bg-amber-500 text-white' },
        { label: 'Family Members', route: '/family', icon: Users, color: 'bg-purple-500 text-white' },
      ];

      return (
        <section className="mb-8">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">{section.title || 'Quick Actions'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {actions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(act.route)}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block leading-snug">{act.label}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Tap to view</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      );
    }

    case 'doctor_carousel': {
      return (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-slate-900">{section.title || 'Top Rated Doctors'}</h3>
            <button onClick={() => navigate('/doctors')} className="text-xs font-bold text-teal-600 hover:underline">
              See All Doctors →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={doctor.photo_url}
                      alt={doctor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                      }}
                      className="w-full h-44 object-cover rounded-xl group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-amber-600 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doctor.rating}</span>
                    </div>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">{doctor.name}</h4>
                  <p className="text-xs font-semibold text-teal-600 mb-1">{doctor.specialty} • {doctor.qualifications}</p>
                  <p className="text-xs text-slate-500 mb-3">{doctor.clinic_name}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Consultation Fee</span>
                      <span className="font-extrabold text-slate-900">₹{doctor.consultation_fee}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Available Today
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => onBookDoctor(doctor)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'service_grid': {
      return (
        <section className="mb-8 p-6 bg-slate-100/70 rounded-3xl border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-slate-900">{section.title || 'Featured Healthcare Services'}</h3>
            <button onClick={() => navigate('/services')} className="text-xs font-bold text-teal-600 hover:underline">
              Browse Services
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/70 flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 rounded-xl bg-slate-100 overflow-hidden mb-3 relative">
                    <img
                      src={srv.image_url || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500'}
                      alt={srv.name}
                      className="w-full h-full object-cover"
                    />
                    {srv.promotional_badge && (
                      <span className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-extrabold rounded-md shadow-sm">
                        {srv.promotional_badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 mb-1">{srv.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{srv.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-black text-teal-700">₹{srv.price}</span>
                  <button
                    onClick={() => {
                      if (onBookService) {
                        onBookService(srv);
                      } else {
                        navigate('/services');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Book Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'offer_strip': {
      return null;
    }

    default:
      // Unknown section types skipped safely per requirement
      console.warn(`Skipping unknown section type: ${section.type}`);
      return null;
  }
};
