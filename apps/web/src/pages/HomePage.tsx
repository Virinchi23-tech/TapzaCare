import React, { useState, useEffect } from 'react';
import { useThemeConfig } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { DoctorProfile, HealthcareService } from '@tapza/shared-types';
import { api } from '../lib/api';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { BookingModal } from '../components/BookingModal';
import { ServiceBookingModal } from '../components/ServiceBookingModal';
import { Loader2 } from 'lucide-react';

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

const FALLBACK_SERVICES: HealthcareService[] = [
  {
    id: 's-1',
    name: 'Emergency Care',
    category: 'Emergency',
    description: '24/7 Rapid response medical emergency and trauma care.',
    price: 2500,
    icon_name: 'ambulance',
    promotional_badge: '24/7 Available',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
  },
  {
    id: 's-2',
    name: 'Pediatric Department',
    category: 'Consultation',
    description: 'Specialized medical care and wellness checks for infants & children.',
    price: 1000,
    icon_name: 'baby',
    promotional_badge: 'Popular',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500',
  },
  {
    id: 's-3',
    name: 'Cardiology',
    category: 'Specialist',
    description: 'Advanced cardiac evaluation, ECG, and echocardiogram checks.',
    price: 1500,
    icon_name: 'heart-pulse',
    promotional_badge: 'Recommended',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500',
  },
  {
    id: 's-4',
    name: 'Full Body Health Checkup',
    category: 'Lab Tests',
    description: 'Comprises 64 essential health parameters including Liver & Kidney profile.',
    price: 1999,
    icon_name: 'test-tube',
    promotional_badge: '50% OFF',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500',
  },
  {
    id: 's-5',
    name: 'General Health Checkup',
    category: 'Consultation',
    description: 'Routine physical checkup, vitals check, and prescription advisory.',
    price: 800,
    icon_name: 'stethoscope',
    promotional_badge: 'Top Pick',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500',
  },
];

export const HomePage: React.FC = () => {
  const { config, loading: configLoading } = useThemeConfig();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>(FALLBACK_DOCTORS);
  const [services, setServices] = useState<HealthcareService[]>(FALLBACK_SERVICES);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedService, setSelectedService] = useState<HealthcareService | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedBookingTimeSlot, setSelectedBookingTimeSlot] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, srvRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/services'),
        ]);
        if (docRes.data.success && docRes.data.data.length > 0) setDoctors(docRes.data.data);
        if (srvRes.data.success && srvRes.data.data.length > 0) setServices(srvRes.data.data);
      } catch (err) {
        console.error('Failed to load home data from API, using robust fallbacks', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleBookDoctor = (doctor: DoctorProfile, date?: string, timeSlot?: string) => {
    setSelectedDoctor(doctor);
    if (date) setSelectedBookingDate(date);
    if (timeSlot) setSelectedBookingTimeSlot(timeSlot);
    setIsBookingModalOpen(true);
  };

  const handleBookService = (service: HealthcareService) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const sections = (config?.sections || []).filter(
    (sec) => sec.type !== 'doctor_carousel' && sec.type !== 'service_grid' && sec.type !== 'offer_strip'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {sections.map((section) => (
        <DynamicSectionRenderer
          key={section.id}
          section={section}
          doctors={doctors}
          services={services}
          onBookDoctor={handleBookDoctor}
          onBookService={handleBookService}
          userName={user?.name || 'Guest Patient'}
        />
      ))}

      {/* Doctor Booking Modal */}
      <BookingModal
        doctor={selectedDoctor}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialDate={selectedBookingDate}
        initialTimeSlot={selectedBookingTimeSlot}
      />

      {/* Service & Lab Test Booking Modal */}
      <ServiceBookingModal
        service={selectedService}
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </div>
  );
};
