export type UserRole = 'admin' | 'doctor' | 'staff' | 'patient' | 'pharmacist' | 'lab';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  gender: string;
  dob: string;
  blood_group: string;
  address: string;
  health_score: number;
  emergency_contact: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experience_years: number;
  languages: string[];
  consultation_fee: number;
  bio: string;
  rating: number;
  reviews_count: number;
  clinic_name: string;
  available_today: boolean;
  photo_url: string;
  is_active: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat?: number;
  lng?: number;
}

export interface HealthcareService {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  icon_name: string;
  promotional_badge?: string;
  is_active: boolean;
  image_url?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Booking {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  service_id?: string;
  service_name?: string;
  clinic_name: string;
  booking_date: string;
  time_slot: string;
  status: BookingStatus;
  fee: number;
  reason: string;
  notes?: string;
  created_at: string;
}

export interface PrescriptionMedicine {
  id: string;
  medicine_name: string;
  dosage: string;
  duration: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  instructions: string;
  timings_display: string;
}

export interface Prescription {
  id: string;
  booking_id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name: string;
  clinic_name: string;
  date: string;
  document_url?: string;
  medicines: PrescriptionMedicine[];
  notes: string;
  created_at: string;
}

export type DoseStatus = 'taken' | 'skipped' | 'pending';

export interface DoseLog {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dose_time: string;
  status: DoseStatus;
  logged_at: string;
}

export interface MedicineReminder {
  id: string;
  user_id: string;
  medicine_name: string;
  dosage: string;
  time: string;
  recurrence: string;
  is_active: boolean;
  created_at: string;
}

export type SectionType = 
  | 'hero_banner'
  | 'category_chips'
  | 'quick_actions'
  | 'service_grid'
  | 'doctor_carousel'
  | 'offer_strip'
  | 'health_dashboard'
  | 'upcoming_appointment'
  | string;

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface HomeSectionConfig {
  id: string;
  type: SectionType;
  title?: string;
  description?: string;
  visible: boolean;
  background_type: BackgroundType;
  background_value: string;
  items?: any[];
}

export interface LayoutConfig {
  id?: string;
  version: string;
  is_festival: boolean;
  festival_name?: string;
  festival_greeting?: string;
  festival_banner_url?: string;
  theme_mode: 'light' | 'dark';
  primary_color: string;
  accent_color: string;
  surface_color: string;
  sections: HomeSectionConfig[];
}

export interface LabTestOrder {
  id: string;
  patient_id: string;
  patient_name: string;
  test_name: string;
  sample_type: string;
  test_date: string;
  status: 'pending' | 'sample_collected' | 'report_ready';
  report_url?: string;
  price: number;
  created_at: string;
}

export interface PharmacyOrder {
  id: string;
  patient_id: string;
  patient_name: string;
  prescription_id?: string;
  items_summary: string;
  total_amount: number;
  status: 'placed' | 'processing' | 'ready' | 'delivered';
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  details: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
