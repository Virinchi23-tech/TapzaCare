import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../database/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const CreateBookingSchema = z.object({
  doctor_id: z.string().optional(),
  service_id: z.string().optional(),
  booking_date: z.string(),
  time_slot: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/bookings
router.get('/bookings', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let sql = 'SELECT * FROM bookings';
    const args: any[] = [];

    if (role === 'patient') {
      sql += ' WHERE patient_id = ?';
      args.push(userId);
    } else if (role === 'doctor') {
      // Find doctor record id for this user
      const docRes = await db.execute({ sql: 'SELECT id FROM doctors WHERE user_id = ?', args: [userId] });
      if (docRes.rows.length > 0) {
        sql += ' WHERE doctor_id = ?';
        args.push(docRes.rows[0].id);
      }
    }

    sql += ' ORDER BY booking_date DESC, time_slot ASC';

    const result = await db.execute({ sql, args });
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id
router.get('/bookings/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM bookings WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
router.post('/bookings', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { doctor_id, service_id, booking_date, time_slot, reason, notes } = CreateBookingSchema.parse(req.body);
    const patientId = req.user!.id;
    const patientName = req.user!.name;

    let docId = doctor_id;
    let docName = 'Tapza Clinical Diagnostics';
    let docSpecialty = 'Clinical Lab Test & Services';
    let docClinic = 'Tapza Diagnostic Hub';
    let fee = 1000;
    let srvName = undefined;

    if (service_id) {
      const srvRes = await db.execute({ sql: 'SELECT id, name, category, price FROM services WHERE id = ?', args: [service_id] });
      if (srvRes.rows.length > 0) {
        const srv = srvRes.rows[0];
        srvName = srv.name as string;
        fee = srv.price as number;
        docSpecialty = (srv.category as string) || 'Lab & Clinical Services';
      }
    }

    if (docId) {
      const docRes = await db.execute({
        sql: 'SELECT id, name, specialty, clinic_name, consultation_fee FROM doctors WHERE id = ?',
        args: [docId],
      });
      if (docRes.rows.length > 0) {
        const d = docRes.rows[0];
        docName = d.name as string;
        docSpecialty = d.specialty as string;
        docClinic = d.clinic_name as string;
        if (!service_id) {
          fee = d.consultation_fee as number;
        }
      }
    } else {
      docId = 'd-1';
    }

    // Check conflict for same date & time slot
    const existing = await db.execute({
      sql: "SELECT id FROM bookings WHERE (doctor_id = ? OR service_id = ?) AND booking_date = ? AND time_slot = ? AND status IN ('pending', 'confirmed')",
      args: [docId, service_id || '', booking_date, time_slot],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Time slot ${time_slot} on ${booking_date} is already booked. Please choose another time slot.`,
      });
    }

    const bookingId = `b-${uuidv4().substring(0, 8)}`;
    const finalReason = reason || (srvName ? `Service/Test Booking: ${srvName}` : 'General Health Consultation');

    // Save booking atomically
    await db.execute({
      sql: `INSERT INTO bookings 
            (id, patient_id, patient_name, doctor_id, doctor_name, specialty, service_id, service_name, clinic_name, booking_date, time_slot, status, fee, reason, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        bookingId,
        patientId,
        patientName,
        docId,
        docName,
        docSpecialty,
        service_id || null,
        srvName || null,
        docClinic,
        booking_date,
        time_slot,
        fee,
        finalReason,
        notes || '',
      ],
    });

    // Update availability
    await db.execute({
      sql: 'UPDATE doctor_availability SET is_booked = 1 WHERE doctor_id = ? AND date = ? AND time_slot = ?',
      args: [docId, booking_date, time_slot],
    });

    // Send notification
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
      args: [
        `notif-${uuidv4().substring(0, 8)}`,
        patientId,
        srvName ? 'Service Test Scheduled! 🧪' : 'Appointment Confirmed! 🎉',
        srvName
          ? `Your lab checkup/service "${srvName}" is confirmed for ${booking_date} at ${time_slot}.`
          : `Your appointment with ${docName} is confirmed for ${booking_date} at ${time_slot}.`,
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: {
        id: bookingId,
        doctor_name: docName,
        service_name: srvName,
        specialty: docSpecialty,
        clinic_name: docClinic,
        booking_date,
        time_slot,
        fee,
        status: 'confirmed',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/cancel
router.post('/bookings/:id/cancel', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const bookingRes = await db.execute({ sql: 'SELECT * FROM bookings WHERE id = ?', args: [id] });

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const booking = bookingRes.rows[0];

    await db.execute({
      sql: "UPDATE bookings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?",
      args: [id],
    });

    // Free up slot
    await db.execute({
      sql: 'UPDATE doctor_availability SET is_booked = 0 WHERE doctor_id = ? AND date = ? AND time_slot = ?',
      args: [booking.doctor_id, booking.booking_date, booking.time_slot],
    });

    return res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/reschedule
router.post('/bookings/:id/reschedule', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { new_date, new_time_slot } = req.body;

    if (!new_date || !new_time_slot) {
      return res.status(400).json({ success: false, error: 'Please provide new_date and new_time_slot.' });
    }

    const bookingRes = await db.execute({ sql: 'SELECT * FROM bookings WHERE id = ?', args: [id] });

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const booking = bookingRes.rows[0];

    // Check conflict for new slot
    const conflict = await db.execute({
      sql: "SELECT id FROM bookings WHERE doctor_id = ? AND booking_date = ? AND time_slot = ? AND status IN ('pending', 'confirmed') AND id != ?",
      args: [booking.doctor_id, new_date, new_time_slot, id],
    });

    if (conflict.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Target time slot is already booked.' });
    }

    // Unbook old slot
    await db.execute({
      sql: 'UPDATE doctor_availability SET is_booked = 0 WHERE doctor_id = ? AND date = ? AND time_slot = ?',
      args: [booking.doctor_id, booking.booking_date, booking.time_slot],
    });

    // Update booking
    await db.execute({
      sql: "UPDATE bookings SET booking_date = ?, time_slot = ?, status = 'rescheduled', updated_at = datetime('now') WHERE id = ?",
      args: [new_date, new_time_slot, id],
    });

    // Book new slot
    await db.execute({
      sql: 'UPDATE doctor_availability SET is_booked = 1 WHERE doctor_id = ? AND date = ? AND time_slot = ?',
      args: [booking.doctor_id, new_date, new_time_slot],
    });

    return res.json({ success: true, message: 'Appointment rescheduled successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
