-- 001_seed_data.sql
-- Tapza Care Seed Data for Turso / libSQL DB

-- Insert Users (Password hash using SHA256 or bcrypt mock: bcrypt hashed or simple hashed for seed accounts)
-- Passwords in clear text for dev reference:
-- admin@tapzacare.com / admin123
-- doctor.sarah@tapzacare.com / doctor123
-- staff@tapzacare.com / staff123
-- ayesha.khan@tapzacare.com / patient123
-- pharma@tapzacare.com / pharma123
-- lab@tapzacare.com / lab123

INSERT OR REPLACE INTO users (id, email, password_hash, name, phone, role, avatar_url, created_at) VALUES
('u-admin-1', 'admin@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'System Administrator', '+91 98765 00000', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', datetime('now')),
('u-doc-1', 'doctor.sunita@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Sunita Reddy', '+91 98765 11111', 'doctor', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300', datetime('now')),
('u-doc-2', 'doctor.srinivas@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. K. Srinivas Rao', '+91 98765 22222', 'doctor', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300', datetime('now')),
('u-doc-3', 'doctor.ananya@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Ananya Sharma', '+91 98765 33333', 'doctor', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300', datetime('now')),
('u-doc-4', 'doctor.vikram@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Vikram Varma', '+91 98765 44444', 'doctor', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300', datetime('now')),
('u-doc-5', 'doctor.rajesh@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Rajesh Kumar', '+91 98765 55501', 'doctor', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300', datetime('now')),
('u-doc-6', 'doctor.kavita@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Kavita Rao', '+91 98765 55502', 'doctor', 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300', datetime('now')),
('u-doc-7', 'doctor.suresh@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Suresh Deshmukh', '+91 98765 55503', 'doctor', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300', datetime('now')),
('u-doc-8', 'doctor.meera@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Dr. Meera Nambiar', '+91 98765 55504', 'doctor', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300', datetime('now')),
('u-staff-1', 'staff@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Rohan Sharma', '+91 98765 55555', 'staff', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', datetime('now')),
('u-patient-1', 'ayesha.khan@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Ayesha Khan', '+91 98765 66666', 'patient', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', datetime('now')),
('u-pharma-1', 'pharma@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Rahul Varma (Pharmacist)', '+91 98765 77777', 'pharmacist', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', datetime('now')),
('u-lab-1', 'lab@tapzacare.com', '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', 'Priya Patel (Lab Tech)', '+91 98765 88888', 'lab', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', datetime('now'));

-- Patient Profiles
INSERT OR REPLACE INTO patient_profiles (id, user_id, gender, dob, blood_group, address, health_score, emergency_contact) VALUES
('pp-1', 'u-patient-1', 'Female', '1996-05-14', 'B+', 'Flat 402, Care Towers, Jubilee Hills, Hyderabad', 78, '+91 98765 99999');

-- Clinics
INSERT OR REPLACE INTO clinics (id, name, address, city, phone, lat, lng) VALUES
('c-1', 'CarePlus Medical Hub', 'Road No. 36, Jubilee Hills', 'Hyderabad', '+91 40 2345 6789', 17.4325, 78.4071),
('c-2', 'Tapza Health Center', 'Banjara Hills, Near Metro', 'Hyderabad', '+91 40 8765 4321', 17.4156, 78.4347);

-- Doctors
INSERT OR REPLACE INTO doctors (id, user_id, name, specialty, qualifications, experience_years, languages, consultation_fee, bio, rating, reviews_count, clinic_name, available_today, photo_url, is_active) VALUES
('d-1', 'u-doc-1', 'Dr. Sunita Reddy', 'General Physician', 'MBBS, MD (General Medicine)', 10, '["English", "Telugu", "Hindi"]', 800, 'Dr. Sunita Reddy is a dedicated General Physician with over 10 years of experience in comprehensive family healthcare, seasonal fever management, and preventive wellness.', 4.8, 248, 'CarePlus Medical Hub', 1, '/doctors/d-1.jpg', 1),
('d-2', 'u-doc-2', 'Dr. K. Srinivas Rao', 'Cardiologist', 'MD, DM (Cardiology)', 14, '["English", "Telugu", "Hindi"]', 1500, 'Senior Consultant Cardiologist specializing in preventive heart health, 2D Echo diagnostics, hypertension control, and non-invasive cardiology.', 4.9, 312, 'Tapza Health Center', 1, '/doctors/d-2.jpg', 1),
('d-3', 'u-doc-3', 'Dr. Ananya Sharma', 'Dermatologist', 'MBBS, MD (Dermatology)', 9, '["English", "Telugu", "Hindi"]', 1200, 'Expert clinical dermatologist specializing in skin rejuvenation, laser skin therapy, acne treatment, and advanced trichology procedures.', 4.9, 162, 'CarePlus Medical Hub', 1, '/doctors/d-3.jpg', 1),
('d-4', 'u-doc-4', 'Dr. Vikram Varma', 'Pediatrician', 'MBBS, MD (Pediatrics), DCH', 8, '["English", "Telugu", "Hindi"]', 1000, 'Compassionate pediatrician focusing on child growth monitoring, newborn vaccination schedules, infant care, and pediatric nutrition.', 4.8, 210, 'Tapza Health Center', 1, '/doctors/d-4.jpg', 1),
('d-5', 'u-doc-5', 'Dr. Rajesh Kumar', 'Orthopedist', 'MBBS, MS (Orthopedics)', 11, '["English", "Telugu", "Hindi"]', 1300, 'Leading Orthopedic surgeon specializing in knee & hip joint pain, sports injury rehabilitation, fracture care, and spine wellness.', 4.7, 175, 'CarePlus Medical Hub', 1, '/doctors/d-5.jpg', 1),
('d-6', 'u-doc-6', 'Dr. Kavita Rao', 'Gynecologist', 'MBBS, MS (Obstetrics & Gynecology)', 12, '["English", "Telugu", "Hindi"]', 1200, 'Senior Obstetrician and Gynecologist providing comprehensive women healthcare, prenatal guidance, high-risk pregnancy management, and laparoscopic surgery.', 4.9, 280, 'Tapza Health Center', 1, '/doctors/d-6.jpg', 1),
('d-7', 'u-doc-7', 'Dr. Suresh Deshmukh', 'Neurologist', 'MBBS, MD, DM (Neurology)', 15, '["English", "Hindi", "Telugu"]', 1600, 'Renowned Neurologist specializing in stroke management, chronic migraine disorders, epilepsy care, memory loss, and neuromuscular diagnostics.', 4.8, 198, 'Tapza Health Center', 1, '/doctors/d-7.jpg', 1),
('d-8', 'u-doc-8', 'Dr. Meera Nambiar', 'ENT Specialist', 'MBBS, MS (ENT)', 7, '["English", "Telugu", "Hindi", "Malayalam"]', 900, 'Experienced ENT specialist treating sinus issues, hearing loss evaluation, chronic throat infections, and nasal allergies.', 4.8, 142, 'CarePlus Medical Hub', 1, '/doctors/d-8.jpg', 1),
('d-9', 'u-doc-9', 'Dr. Anish Sharma', 'General Physician', 'MBBS, DNB (Family Medicine)', 8, '["English", "Telugu", "Hindi"]', 750, 'Dr. Anish Sharma provides holistic primary healthcare, chronic disease screening, diabetes management, and lifestyle counseling.', 4.7, 156, 'Tapza Health Center', 1, '/doctors/d-9.jpg', 1),
('d-10', 'u-doc-10', 'Dr. Priya Nair', 'Cardiologist', 'MBBS, MD, DNB (Cardiology)', 11, '["English", "Telugu", "Hindi"]', 1400, 'Expert Interventional Cardiologist specializing in cardiac risk assessment, arrhythmia management, and preventive cardiovascular wellness.', 4.8, 220, 'CarePlus Medical Hub', 1, '/doctors/d-10.jpg', 1),
('d-11', 'u-doc-11', 'Dr. Arjun Mehta', 'Dermatologist', 'MBBS, DVD (Dermatology)', 10, '["English", "Telugu", "Hindi"]', 1100, 'Consultant Dermatologist and Cosmetologist specializing in pediatric skin conditions, eczema care, anti-aging therapies, and hair restoration.', 4.8, 185, 'Tapza Health Center', 1, '/doctors/d-11.jpg', 1),
('d-12', 'u-doc-12', 'Dr. Deepa Joshi', 'Pediatrician', 'MBBS, DNB (Pediatrics)', 12, '["English", "Telugu", "Hindi"]', 1000, 'Senior Pediatrician with extensive expertise in child development, adolescent medicine, pediatric asthma care, and emergency pediatric checkups.', 4.9, 265, 'CarePlus Medical Hub', 1, '/doctors/d-12.jpg', 1),
('d-13', 'u-doc-13', 'Dr. Sneha Kulkarni', 'Orthopedist', 'MBBS, MS, DNB (Orthopedics)', 9, '["English", "Telugu", "Hindi"]', 1250, 'Orthopedic Specialist focusing on pediatric orthopedics, bone density wellness, arthritis therapy, and minimally invasive joint care.', 4.8, 160, 'Tapza Health Center', 1, '/doctors/d-13.jpg', 1),
('d-14', 'u-doc-14', 'Dr. Ritu Agarwal', 'Gynecologist', 'MBBS, DGO, MD (Gynecology)', 15, '["English", "Hindi", "Telugu"]', 1300, 'Renowned Gynecologist specializing in PCOD/PCOS management, adolescent gynecological wellness, fertility counseling, and menopause care.', 4.9, 310, 'CarePlus Medical Hub', 1, '/doctors/d-14.jpg', 1),
('d-15', 'u-doc-15', 'Dr. Alok Tripathi', 'Neurologist', 'MBBS, DNB, MCh (Neurosurgery)', 13, '["English", "Hindi", "Telugu"]', 1700, 'Senior Neurosurgeon expert in spine disorders, brain trauma care, nerve repair surgery, and advanced neuro-critical management.', 4.9, 240, 'CarePlus Medical Hub', 1, '/doctors/d-15.jpg', 1),
('d-16', 'u-doc-16', 'Dr. Siddharth Iyer', 'ENT Specialist', 'MBBS, DLO, MS (ENT)', 10, '["English", "Telugu", "Hindi"]', 950, 'Senior ENT Surgeon specializing in endoscopic sinus surgery, vertigo treatment, snoring disorders, and pediatric ENT consultations.', 4.7, 178, 'Tapza Health Center', 1, '/doctors/d-16.jpg', 1);

-- Services
INSERT OR REPLACE INTO services (id, name, category, description, price, icon_name, promotional_badge, is_active, image_url) VALUES
('s-1', 'Emergency Care', 'Emergency', '24/7 Rapid response medical emergency and trauma care.', 2500, 'ambulance', '24/7 Available', 1, 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500'),
('s-2', 'Pediatric Department', 'Consultation', 'Specialized medical care and wellness checks for infants & children.', 1000, 'baby', 'Popular', 1, 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500'),
('s-3', 'Cardiology', 'Specialist', 'Advanced cardiac evaluation, ECG, and echocardiogram checks.', 1500, 'heart-pulse', 'Recommended', 1, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'),
('s-4', 'Full Body Health Checkup', 'Lab Tests', 'Comprises 64 essential health parameters including Liver & Kidney profile.', 1999, 'test-tube', '50% OFF', 1, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500'),
('s-5', 'General Health Checkup', 'Consultation', 'Routine physical checkup, vitals check, and prescription advisory.', 800, 'stethoscope', 'Top Pick', 1, 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500');

-- Doctor Availability Slots for today and upcoming days
INSERT OR REPLACE INTO doctor_availability (id, doctor_id, date, time_slot, is_booked) VALUES
('da-1', 'd-1', strftime('%Y-%m-%d', 'now'), '09:00 AM', 0),
('da-2', 'd-1', strftime('%Y-%m-%d', 'now'), '10:00 AM', 0),
('da-3', 'd-1', strftime('%Y-%m-%d', 'now'), '11:00 AM', 1),
('da-4', 'd-1', strftime('%Y-%m-%d', 'now'), '12:00 PM', 0),
('da-5', 'd-1', strftime('%Y-%m-%d', 'now'), '02:00 PM', 0),
('da-6', 'd-1', strftime('%Y-%m-%d', 'now'), '03:00 PM', 0),
('da-7', 'd-1', strftime('%Y-%m-%d', 'now'), '04:00 PM', 0),
('da-8', 'd-1', strftime('%Y-%m-%d', 'now'), '05:00 PM', 0),

('da-9', 'd-2', strftime('%Y-%m-%d', 'now'), '10:00 AM', 0),
('da-10', 'd-2', strftime('%Y-%m-%d', 'now'), '11:30 AM', 0),
('da-11', 'd-2', strftime('%Y-%m-%d', 'now'), '03:00 PM', 0),

('da-12', 'd-3', strftime('%Y-%m-%d', 'now'), '01:00 PM', 0),
('da-13', 'd-3', strftime('%Y-%m-%d', 'now'), '04:00 PM', 0),

('da-14', 'd-4', strftime('%Y-%m-%d', 'now'), '09:30 AM', 0),
('da-15', 'd-4', strftime('%Y-%m-%d', 'now'), '02:30 PM', 0),

('da-16', 'd-5', strftime('%Y-%m-%d', 'now'), '10:30 AM', 0),
('da-17', 'd-5', strftime('%Y-%m-%d', 'now'), '04:30 PM', 0),

('da-18', 'd-6', strftime('%Y-%m-%d', 'now'), '11:00 AM', 0),
('da-19', 'd-6', strftime('%Y-%m-%d', 'now'), '03:30 PM', 0),

('da-20', 'd-7', strftime('%Y-%m-%d', 'now'), '02:00 PM', 0),
('da-21', 'd-7', strftime('%Y-%m-%d', 'now'), '05:00 PM', 0),

('da-22', 'd-8', strftime('%Y-%m-%d', 'now'), '10:00 AM', 0),
('da-23', 'd-8', strftime('%Y-%m-%d', 'now'), '12:30 PM', 0);

-- Layout Configurations (Normal Day & Festival Day)
INSERT OR REPLACE INTO layout_configs (id, version, is_festival, festival_name, festival_greeting, festival_banner_url, theme_mode, primary_color, accent_color, surface_color, sections_json, is_published) VALUES
('cfg-normal', 'v1.0.0', 0, NULL, 'Your Health Matters', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1000', 'light', '#0d9488', '#4f46e5', '#ffffff', '[
  {"id":"sec-1","type":"hero_banner","title":"Your Health Our Priority","description":"Book trusted doctors, get expert care, and stay healthy — all in one place.","visible":true,"background_type":"gradient","background_value":"linear-gradient(135deg, #0d9488 0%, #0284c7 100%)"},
  {"id":"sec-2","type":"category_chips","title":"Categories","visible":true,"background_type":"solid","background_value":"#f8fafc"},
  {"id":"sec-3","type":"quick_actions","title":"Quick Services","visible":true,"background_type":"solid","background_value":"#ffffff"},
  {"id":"sec-4","type":"doctor_carousel","title":"Top Rated Doctors","visible":true,"background_type":"solid","background_value":"#ffffff"},
  {"id":"sec-5","type":"service_grid","title":"Featured Healthcare Services","visible":true,"background_type":"solid","background_value":"#f1f5f9"},
  {"id":"sec-6","type":"offer_strip","title":"Festival Wellness Discount","visible":true,"background_type":"gradient","background_value":"linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)"}
]', 1),

('cfg-festival', 'v1.1.0-diwali', 1, 'Diwali Health Festival', '✨ Happy Diwali! Celebrate Health & Happiness', 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1000', 'light', '#059669', '#d97706', '#ffffff', '[
  {"id":"sec-f1","type":"hero_banner","title":"✨ Diwali Health Festival 2026","description":"Special 50% discount on family full body health checkups & free online doctor consultation!","visible":true,"background_type":"gradient","background_value":"linear-gradient(135deg, #059669 0%, #d97706 100%)"},
  {"id":"sec-f2","type":"offer_strip","title":"🎆 Festive Health Bonus: Flat ₹500 Cashback on Bookings!","visible":true,"background_type":"gradient","background_value":"linear-gradient(90deg, #d97706 0%, #dc2626 100%)"},
  {"id":"sec-f3","type":"category_chips","title":"Explore Departments","visible":true,"background_type":"solid","background_value":"#fef3c7"},
  {"id":"sec-f4","type":"doctor_carousel","title":"Featured Specialist Doctors","visible":true,"background_type":"solid","background_value":"#ffffff"},
  {"id":"sec-f5","type":"service_grid","title":"Diwali Preventive Packages","visible":true,"background_type":"solid","background_value":"#fffbeb"}
]', 0);

-- Bookings
INSERT OR REPLACE INTO bookings (id, patient_id, patient_name, doctor_id, doctor_name, specialty, service_id, service_name, clinic_name, booking_date, time_slot, status, fee, reason, notes, created_at) VALUES
('b-1', 'u-patient-1', 'Ayesha Khan', 'd-1', 'Dr. Sunita Reddy', 'General Physician', 's-5', 'General Health Checkup', 'CarePlus Medical Hub', strftime('%Y-%m-%d', 'now'), '09:00 AM', 'confirmed', 800, 'Routine seasonal checkup and mild cold symptoms', 'Patient requested morning slot', datetime('now')),
('b-2', 'u-patient-1', 'Ayesha Khan', 'd-2', 'Dr. K. Srinivas Rao', 'Cardiologist', 's-3', 'Cardiology', 'Tapza Health Center', '2026-10-15', '11:30 AM', 'confirmed', 1500, 'Annual ECG and blood pressure review', '', datetime('now'));

-- Prescriptions
INSERT OR REPLACE INTO prescriptions (id, booking_id, patient_id, patient_name, doctor_id, doctor_name, clinic_name, date, notes, created_at) VALUES
('rx-1', 'b-1', 'u-patient-1', 'Ayesha Khan', 'd-1', 'Dr. Sunita Reddy', 'CarePlus Medical Hub', '23 Apr 2026', 'Stay hydrated and get enough rest. Follow up if symptoms persist.', datetime('now'));

-- Prescription Medicines
INSERT OR REPLACE INTO prescription_medicines (id, prescription_id, medicine_name, dosage, duration, morning, afternoon, night, instructions, timings_display) VALUES
('pm-1', 'rx-1', 'Paracetamol 500mg', '1 Tablet', 'For 5 days', 1, 0, 1, 'Take twice daily after meals', 'Morning, Night'),
('pm-2', 'rx-1', 'Vitamin D3 1000 IU', '1 Capsule', 'For 1 month', 1, 0, 0, 'Take 1 capsule daily with milk', 'Morning'),
('pm-3', 'rx-1', 'Cough Syrup', '10 ml', 'For 5 days', 1, 1, 1, 'Take 10ml three times daily after food', 'Morning, Afternoon, Night');

-- Dose Logs
INSERT OR REPLACE INTO dose_logs (id, prescription_id, medicine_name, dose_time, status, logged_at) VALUES
('dl-1', 'rx-1', 'Paracetamol 500mg', '08:30 AM', 'taken', datetime('now')),
('dl-2', 'rx-1', 'Vitamin D3 1000 IU', '09:00 AM', 'taken', datetime('now'));

-- Reminders
INSERT OR REPLACE INTO medicine_reminders (id, user_id, medicine_name, dosage, time, recurrence, is_active, created_at) VALUES
('mr-1', 'u-patient-1', 'Paracetamol 500mg', '1 Tablet', '08:00 AM', 'Daily', 1, datetime('now')),
('mr-2', 'u-patient-1', 'Vitamin D3 1000 IU', '1 Capsule', '09:00 AM', 'Daily', 1, datetime('now')),
('mr-3', 'u-patient-1', 'Cough Syrup', '10 ml', '02:00 PM', 'Daily', 1, datetime('now'));

-- Support Tickets
INSERT OR REPLACE INTO support_tickets (id, user_id, user_name, subject, message, status, created_at) VALUES
('st-1', 'u-patient-1', 'Ayesha Khan', 'Rescheduling request for appointment', 'Can I reschedule my appointment on 15th Oct to 16th Oct?', 'open', datetime('now'));

-- Lab Test Orders
INSERT OR REPLACE INTO lab_test_orders (id, patient_id, patient_name, test_name, sample_type, test_date, status, price, created_at) VALUES
('lt-1', 'u-patient-1', 'Ayesha Khan', 'Full Body Health Package', 'Blood & Urine', '2026-10-10', 'pending', 1999, datetime('now'));

-- Pharmacy Orders
INSERT OR REPLACE INTO pharmacy_orders (id, patient_id, patient_name, prescription_id, items_summary, total_amount, status, created_at) VALUES
('po-1', 'u-patient-1', 'Ayesha Khan', 'rx-1', 'Paracetamol 500mg (10 tabs), Vitamin D3 (30 caps), Cough Syrup (100ml)', 450, 'processing', datetime('now'));

-- Audit Logs
INSERT OR REPLACE INTO audit_logs (id, user_id, user_name, action, details, created_at) VALUES
('al-1', 'u-admin-1', 'System Administrator', 'SYSTEM_INITIALIZED', 'Tapza Care database populated with initial migrations and seed data.', datetime('now'));
