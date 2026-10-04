import { db } from './db';

async function seedFreshDoctors() {
  console.log('[Seed] Clearing all doctor dependent data...');
  await db.execute('DELETE FROM pharmacy_orders');
  await db.execute('DELETE FROM dose_logs');
  await db.execute('DELETE FROM prescription_medicines');
  await db.execute('DELETE FROM prescriptions');
  await db.execute('DELETE FROM bookings');
  await db.execute('DELETE FROM doctor_availability');
  await db.execute('DELETE FROM doctor_clinics');
  await db.execute('DELETE FROM doctors');
  await db.execute("DELETE FROM users WHERE role = 'doctor'");
  
  const doctors = [
    {
      id: 'd-1',
      user_id: 'u-doc-1',
      name: 'Dr. Sunita Reddy',
      specialty: 'General Physician',
      qualifications: 'MBBS, MD (General Medicine)',
      experience_years: 10,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 800,
      bio: 'Dr. Sunita Reddy is a dedicated General Physician with over 10 years of experience in comprehensive family healthcare, seasonal fever management, and preventive wellness.',
      rating: 4.8,
      reviews_count: 248,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-1.jpg',
      is_active: 1
    },
    {
      id: 'd-2',
      user_id: 'u-doc-2',
      name: 'Dr. K. Srinivas Rao',
      specialty: 'Cardiologist',
      qualifications: 'MD, DM (Cardiology)',
      experience_years: 14,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1500,
      bio: 'Senior Consultant Cardiologist specializing in preventive heart health, 2D Echo diagnostics, hypertension control, and non-invasive cardiology.',
      rating: 4.9,
      reviews_count: 312,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-2.jpg',
      is_active: 1
    },
    {
      id: 'd-3',
      user_id: 'u-doc-3',
      name: 'Dr. Ananya Sharma',
      specialty: 'Dermatologist',
      qualifications: 'MBBS, MD (Dermatology)',
      experience_years: 9,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1200,
      bio: 'Expert clinical dermatologist specializing in skin rejuvenation, laser skin therapy, acne treatment, and advanced trichology procedures.',
      rating: 4.9,
      reviews_count: 162,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-3.jpg',
      is_active: 1
    },
    {
      id: 'd-4',
      user_id: 'u-doc-4',
      name: 'Dr. Vikram Varma',
      specialty: 'Pediatrician',
      qualifications: 'MBBS, MD (Pediatrics), DCH',
      experience_years: 8,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1000,
      bio: 'Compassionate pediatrician focusing on child growth monitoring, newborn vaccination schedules, infant care, and pediatric nutrition.',
      rating: 4.8,
      reviews_count: 210,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-4.jpg',
      is_active: 1
    },
    {
      id: 'd-5',
      user_id: 'u-doc-5',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Orthopedist',
      qualifications: 'MBBS, MS (Orthopedics)',
      experience_years: 11,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1300,
      bio: 'Leading Orthopedic surgeon specializing in knee & hip joint pain, sports injury rehabilitation, fracture care, and spine wellness.',
      rating: 4.7,
      reviews_count: 175,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-5.jpg',
      is_active: 1
    },
    {
      id: 'd-6',
      user_id: 'u-doc-6',
      name: 'Dr. Kavita Rao',
      specialty: 'Gynecologist',
      qualifications: 'MBBS, MS (Obstetrics & Gynecology)',
      experience_years: 12,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1200,
      bio: 'Senior Obstetrician and Gynecologist providing comprehensive women healthcare, prenatal guidance, high-risk pregnancy management, and laparoscopic surgery.',
      rating: 4.9,
      reviews_count: 280,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-6.jpg',
      is_active: 1
    },
    {
      id: 'd-7',
      user_id: 'u-doc-7',
      name: 'Dr. Suresh Deshmukh',
      specialty: 'Neurologist',
      qualifications: 'MBBS, MD, DM (Neurology)',
      experience_years: 15,
      languages: JSON.stringify(['English', 'Hindi', 'Telugu']),
      consultation_fee: 1600,
      bio: 'Renowned Neurologist specializing in stroke management, chronic migraine disorders, epilepsy care, memory loss, and neuromuscular diagnostics.',
      rating: 4.8,
      reviews_count: 198,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-7.jpg',
      is_active: 1
    },
    {
      id: 'd-8',
      user_id: 'u-doc-8',
      name: 'Dr. Meera Nambiar',
      specialty: 'ENT Specialist',
      qualifications: 'MBBS, MS (ENT)',
      experience_years: 7,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi', 'Malayalam']),
      consultation_fee: 900,
      bio: 'Experienced ENT specialist treating sinus issues, hearing loss evaluation, chronic throat infections, and nasal allergies.',
      rating: 4.8,
      reviews_count: 142,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-8.jpg',
      is_active: 1
    },
    {
      id: 'd-9',
      user_id: 'u-doc-9',
      name: 'Dr. Anish Sharma',
      specialty: 'General Physician',
      qualifications: 'MBBS, DNB (Family Medicine)',
      experience_years: 8,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 750,
      bio: 'Dr. Anish Sharma provides holistic primary healthcare, chronic disease screening, diabetes management, and lifestyle counseling.',
      rating: 4.7,
      reviews_count: 156,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-9.jpg',
      is_active: 1
    },
    {
      id: 'd-10',
      user_id: 'u-doc-10',
      name: 'Dr. Priya Nair',
      specialty: 'Cardiologist',
      qualifications: 'MBBS, MD, DNB (Cardiology)',
      experience_years: 11,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1400,
      bio: 'Expert Interventional Cardiologist specializing in cardiac risk assessment, arrhythmia management, and preventive cardiovascular wellness.',
      rating: 4.8,
      reviews_count: 220,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-10.jpg',
      is_active: 1
    },
    {
      id: 'd-11',
      user_id: 'u-doc-11',
      name: 'Dr. Arjun Mehta',
      specialty: 'Dermatologist',
      qualifications: 'MBBS, DVD (Dermatology)',
      experience_years: 10,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1100,
      bio: 'Consultant Dermatologist and Cosmetologist specializing in pediatric skin conditions, eczema care, anti-aging therapies, and hair restoration.',
      rating: 4.8,
      reviews_count: 185,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-11.jpg',
      is_active: 1
    },
    {
      id: 'd-12',
      user_id: 'u-doc-12',
      name: 'Dr. Deepa Joshi',
      specialty: 'Pediatrician',
      qualifications: 'MBBS, DNB (Pediatrics)',
      experience_years: 12,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1000,
      bio: 'Senior Pediatrician with extensive expertise in child development, adolescent medicine, pediatric asthma care, and emergency pediatric checkups.',
      rating: 4.9,
      reviews_count: 265,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-12.jpg',
      is_active: 1
    },
    {
      id: 'd-13',
      user_id: 'u-doc-13',
      name: 'Dr. Sneha Kulkarni',
      specialty: 'Orthopedist',
      qualifications: 'MBBS, MS, DNB (Orthopedics)',
      experience_years: 9,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 1250,
      bio: 'Orthopedic Specialist focusing on pediatric orthopedics, bone density wellness, arthritis therapy, and minimally invasive joint care.',
      rating: 4.8,
      reviews_count: 160,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-13.jpg',
      is_active: 1
    },
    {
      id: 'd-14',
      user_id: 'u-doc-14',
      name: 'Dr. Ritu Agarwal',
      specialty: 'Gynecologist',
      qualifications: 'MBBS, DGO, MD (Gynecology)',
      experience_years: 15,
      languages: JSON.stringify(['English', 'Hindi', 'Telugu']),
      consultation_fee: 1300,
      bio: 'Renowned Gynecologist specializing in PCOD/PCOS management, adolescent gynecological wellness, fertility counseling, and menopause care.',
      rating: 4.9,
      reviews_count: 310,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-14.jpg',
      is_active: 1
    },
    {
      id: 'd-15',
      user_id: 'u-doc-15',
      name: 'Dr. Alok Tripathi',
      specialty: 'Neurologist',
      qualifications: 'MBBS, DNB, MCh (Neurosurgery)',
      experience_years: 13,
      languages: JSON.stringify(['English', 'Hindi', 'Telugu']),
      consultation_fee: 1700,
      bio: 'Senior Neurosurgeon expert in spine disorders, brain trauma care, nerve repair surgery, and advanced neuro-critical management.',
      rating: 4.9,
      reviews_count: 240,
      clinic_name: 'CarePlus Medical Hub',
      available_today: 1,
      photo_url: '/doctors/d-15.jpg',
      is_active: 1
    },
    {
      id: 'd-16',
      user_id: 'u-doc-16',
      name: 'Dr. Siddharth Iyer',
      specialty: 'ENT Specialist',
      qualifications: 'MBBS, DLO, MS (ENT)',
      experience_years: 10,
      languages: JSON.stringify(['English', 'Telugu', 'Hindi']),
      consultation_fee: 950,
      bio: 'Senior ENT Surgeon specializing in endoscopic sinus surgery, vertigo treatment, snoring disorders, and pediatric ENT consultations.',
      rating: 4.7,
      reviews_count: 178,
      clinic_name: 'Tapza Health Center',
      available_today: 1,
      photo_url: '/doctors/d-16.jpg',
      is_active: 1
    }
  ];

  const today = new Date().toISOString().split('T')[0];
  const timeSlots = ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '04:00 PM', '05:30 PM'];

  for (const doc of doctors) {
    // Insert User Account
    await db.execute({
      sql: `INSERT OR REPLACE INTO users (id, email, password_hash, name, phone, role, avatar_url)
            VALUES (?, ?, ?, ?, ?, 'doctor', ?)`,
      args: [
        doc.user_id,
        `${doc.user_id}@tapzacare.com`,
        '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd',
        doc.name,
        '+91 98765 00000',
        doc.photo_url,
      ],
    });

    // Insert Doctor Profile
    await db.execute({
      sql: `INSERT INTO doctors 
            (id, user_id, name, specialty, qualifications, experience_years, languages, consultation_fee, bio, rating, reviews_count, clinic_name, available_today, photo_url, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        doc.id,
        doc.user_id,
        doc.name,
        doc.specialty,
        doc.qualifications,
        doc.experience_years,
        doc.languages,
        doc.consultation_fee,
        doc.bio,
        doc.rating,
        doc.reviews_count,
        doc.clinic_name,
        doc.available_today,
        doc.photo_url,
        doc.is_active,
      ],
    });

    // Insert Availability Slots
    for (let i = 0; i < timeSlots.length; i++) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO doctor_availability (id, doctor_id, date, time_slot, is_booked)
              VALUES (?, ?, ?, ?, 0)`,
        args: [`da-${doc.id}-${i + 1}`, doc.id, today, timeSlots[i]],
      });
    }
  }

  // Insert sample booking & prescription for Dr. Sunita Reddy
  await db.execute({
    sql: `INSERT OR REPLACE INTO bookings (id, patient_id, patient_name, doctor_id, doctor_name, specialty, service_name, clinic_name, booking_date, time_slot, status, fee, reason)
          VALUES ('b-1', 'u-patient-1', 'Ayesha Khan', 'd-1', 'Dr. Sunita Reddy', 'General Physician', 'General Health Checkup', 'CarePlus Medical Hub', ?, '09:00 AM', 'confirmed', 800, 'Routine seasonal checkup and mild cold symptoms')`,
    args: [today],
  });

  await db.execute({
    sql: `INSERT OR REPLACE INTO prescriptions (id, booking_id, patient_id, patient_name, doctor_id, doctor_name, clinic_name, date, notes)
          VALUES ('rx-1', 'b-1', 'u-patient-1', 'Ayesha Khan', 'd-1', 'Dr. Sunita Reddy', 'CarePlus Medical Hub', '23 Apr 2026', 'Stay hydrated and get enough rest.')`,
    args: [],
  });

  await db.execute({
    sql: `INSERT OR REPLACE INTO prescription_medicines (id, prescription_id, medicine_name, dosage, duration, morning, afternoon, night, instructions, timings_display)
          VALUES ('pm-1', 'rx-1', 'Paracetamol 500mg', '1 Tablet', 'For 5 days', 1, 0, 1, 'Take twice daily after meals', 'Morning, Night')`,
    args: [],
  });

  const sampleEmployees = [
    { id: 'u-emp-1', email: 'nurse.anjali@tapzacare.com', name: 'Nurse Anjali Sharma', phone: '+91 98765 11001', role: 'nurse' },
    { id: 'u-emp-2', email: 'pharmacy.ramesh@tapzacare.com', name: 'Ramesh Patel', phone: '+91 98765 11002', role: 'pharmacist' },
    { id: 'u-emp-3', email: 'lab.vikram@tapzacare.com', name: 'Vikram Singh', phone: '+91 98765 11003', role: 'lab' },
    { id: 'u-emp-4', email: 'reception.priya@tapzacare.com', name: 'Priya Verma', phone: '+91 98765 11004', role: 'receptionist' },
    { id: 'u-emp-5', email: 'staff.suresh@tapzacare.com', name: 'Suresh Kumar', phone: '+91 98765 11005', role: 'staff' },
  ];

  for (const emp of sampleEmployees) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO users (id, email, password_hash, name, phone, role)
            VALUES (?, ?, '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', ?, ?, ?)`,
      args: [emp.id, emp.email, emp.name, emp.phone, emp.role],
    });
  }

  console.log('[Seed] Successfully inserted 16 fresh Indian doctors, employee accounts, and availability slots into Turso DB!');
}

seedFreshDoctors()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
