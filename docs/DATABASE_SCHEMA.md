# Tapza Care — Turso Database Schema Documentation

Turso URL: `libsql://tpza-virinchi23-tech.aws-ap-south-1.turso.io`

---

## Entity Relationship Summary

- `users` (1) ── (1) `patient_profiles`
- `users` (1) ── (1) `doctors`
- `doctors` (1) ── (N) `doctor_availability`
- `doctors` (1) ── (N) `bookings`
- `users` (1) ── (N) `bookings`
- `bookings` (1) ── (0..1) `prescriptions`
- `prescriptions` (1) ── (N) `prescription_medicines`
- `prescriptions` (1) ── (N) `dose_logs`
- `users` (1) ── (N) `medicine_reminders`
- `layout_configs` (Stand-alone dynamic engine table)

---

## Primary Tables

| Table | Purpose | Unique Constraints / Foreign Keys |
|---|---|---|
| `users` | Account credentials & role | `email UNIQUE`, `role IN ('admin', 'doctor', 'staff', 'patient', 'pharmacist', 'lab')` |
| `patient_profiles` | Health score, vitals, blood group | `user_id FK -> users(id)` |
| `doctors` | Specialty, fee, rating, bio | `user_id FK -> users(id)` |
| `doctor_availability` | Date/slot calendar locks | `UNIQUE(doctor_id, date, time_slot)` |
| `bookings` | Appointments & conflict status | `UNIQUE(doctor_id, booking_date, time_slot, status)` |
| `prescriptions` | Digital prescription headers | `booking_id FK -> bookings(id)` |
| `prescription_medicines` | Medicine names & timings | `prescription_id FK -> prescriptions(id)` |
| `dose_logs` | Medication intake history | `prescription_id FK -> prescriptions(id)` |
| `medicine_reminders` | User alarm schedules | `user_id FK -> users(id)` |
| `layout_configs` | Dynamic home screen layout & festival theme | Versioning & layout JSON storage |
