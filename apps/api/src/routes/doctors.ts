import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/doctors', async (req, res, next) => {
  try {
    const { specialty, search, all } = req.query;

    let sql = all === 'true' 
      ? 'SELECT d.*, u.email, u.phone as doctor_phone FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE 1=1' 
      : 'SELECT d.*, u.email, u.phone as doctor_phone FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE d.is_active = 1';
    const args: any[] = [];

    if (specialty && specialty !== 'All') {
      const specLower = (specialty as string).toLowerCase().trim();
      let stem = `%${specLower}%`;
      if (specLower.includes('cardio')) stem = '%cardio%';
      else if (specLower.includes('derma')) stem = '%derma%';
      else if (specLower.includes('pediatr')) stem = '%pediatr%';
      else if (specLower.includes('ortho')) stem = '%ortho%';
      else if (specLower.includes('gynec')) stem = '%gynec%';
      else if (specLower.includes('neuro')) stem = '%neuro%';
      else if (specLower.includes('ent')) stem = '%ent%';
      else if (specLower.includes('general') || specLower.includes('physician')) stem = '%general%';

      sql += ' AND (LOWER(d.specialty) LIKE ? OR LOWER(d.specialty) LIKE ?)';
      args.push(stem, `%${specLower}%`);
    }

    if (search) {
      const term = `%${(search as string).toLowerCase().trim()}%`;
      sql += ' AND (LOWER(d.name) LIKE ? OR LOWER(d.specialty) LIKE ? OR LOWER(d.clinic_name) LIKE ? OR LOWER(u.email) LIKE ?)';
      args.push(term, term, term, term);
    }

    sql += ' ORDER BY d.rating DESC, d.reviews_count DESC';

    const result = await db.execute({ sql, args });

    const FALLBACK_DEFAULT_PHOTO = '/doctors/d-1.jpg';

    const doctors = result.rows.map((row) => {
      let photoUrl = (row.photo_url as string) || '';
      if (!photoUrl || photoUrl.includes('1594824813566-88855ce78907')) {
        photoUrl = FALLBACK_DEFAULT_PHOTO;
      }
      return {
        ...row,
        email: (row.email as string) || `${row.id}@tapzacare.com`,
        photo_url: photoUrl,
        languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : row.languages,
        available_today: Boolean(row.available_today),
        is_active: Boolean(row.is_active),
      };
    });

    return res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
});

router.get('/doctors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT d.*, u.email, u.phone as doctor_phone FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    const row = result.rows[0];
    let photoUrl = (row.photo_url as string) || '';
    if (!photoUrl || photoUrl.includes('1594824813566-88855ce78907')) {
      photoUrl = '/doctors/d-1.jpg';
    }
    const doctor = {
      ...row,
      email: (row.email as string) || `${row.id}@tapzacare.com`,
      photo_url: photoUrl,
      languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : row.languages,
      available_today: Boolean(row.available_today),
      is_active: Boolean(row.is_active),
    };

    return res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

router.get('/doctors/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const bookedRes = await db.execute({
      sql: "SELECT time_slot FROM bookings WHERE doctor_id = ? AND booking_date = ? AND status IN ('pending', 'confirmed')",
      args: [id, date],
    });
    const bookedSlotsSet = new Set(bookedRes.rows.map((r) => r.time_slot as string));

    const result = await db.execute({
      sql: 'SELECT id, time_slot, is_booked FROM doctor_availability WHERE doctor_id = ? AND date = ? ORDER BY id ASC',
      args: [id, date],
    });

    let rawSlots = [
      { id: `slot-1`, time_slot: '09:00 AM - 09:30 AM', is_booked: false },
      { id: `slot-2`, time_slot: '09:30 AM - 10:00 AM', is_booked: false },
      { id: `slot-3`, time_slot: '10:00 AM - 10:30 AM', is_booked: false },
      { id: `slot-4`, time_slot: '10:30 AM - 11:00 AM', is_booked: false },
      { id: `slot-5`, time_slot: '11:00 AM - 11:30 AM', is_booked: false },
      { id: `slot-6`, time_slot: '11:30 AM - 12:00 PM', is_booked: false },
      { id: `slot-7`, time_slot: '02:00 PM - 02:30 PM', is_booked: false },
      { id: `slot-8`, time_slot: '02:30 PM - 03:00 PM', is_booked: false },
      { id: `slot-9`, time_slot: '03:00 PM - 03:30 PM', is_booked: false },
      { id: `slot-10`, time_slot: '03:30 PM - 04:00 PM', is_booked: false },
      { id: `slot-11`, time_slot: '04:00 PM - 04:30 PM', is_booked: false },
      { id: `slot-12`, time_slot: '04:30 PM - 05:00 PM', is_booked: false },
      { id: `slot-13`, time_slot: '05:00 PM - 05:30 PM', is_booked: false },
      { id: `slot-14`, time_slot: '05:30 PM - 06:00 PM', is_booked: false },
    ];

    if (result.rows.length > 0) {
      rawSlots = result.rows.map((r) => ({
        id: r.id as string,
        time_slot: r.time_slot as string,
        is_booked: Boolean(r.is_booked),
      }));
    }

    const slots = rawSlots.map((s) => ({
      ...s,
      is_booked: s.is_booked || bookedSlotsSet.has(s.time_slot),
    }));

    return res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
});

// Admin Doctor CRUD
router.post('/admin/doctors', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, specialty, qualifications, experience_years, languages, consultation_fee, bio, clinic_name, photo_url, email, password } = req.body;
    const docId = `d-${Date.now()}`;
    const userId = `u-doc-${Date.now()}`;
    const emailToUse = (email && email.trim()) ? email.trim().toLowerCase() : `${docId}@tapzacare.com`;
    const passwordToUse = (password && password.trim()) ? password.trim() : 'password123';
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);

    await db.execute({
      sql: 'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      args: [userId, emailToUse, hashedPassword, name, 'doctor'],
    });

    await db.execute({
      sql: `INSERT INTO doctors 
            (id, user_id, name, specialty, qualifications, experience_years, languages, consultation_fee, bio, clinic_name, photo_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [
        docId,
        userId,
        name,
        specialty,
        qualifications || 'MBBS',
        experience_years || 5,
        JSON.stringify(languages || ['English', 'Hindi']),
        consultation_fee || 1000,
        bio || '',
        clinic_name || 'CarePlus Medical Hub',
        photo_url || '/doctors/d-1.jpg',
      ],
    });

    return res.status(201).json({ success: true, message: 'Doctor created successfully.', data: { id: docId, email: emailToUse } });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/doctors/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { name, specialty, qualifications, experience_years, languages, consultation_fee, bio, clinic_name, photo_url, email, password } = req.body;

    const languagesStr = languages !== undefined ? (Array.isArray(languages) ? JSON.stringify(languages) : languages) : null;

    // Update associated user login credentials if user_id exists
    const docRes = await db.execute({ sql: 'SELECT user_id FROM doctors WHERE id = ?', args: [id] });
    if (docRes.rows.length > 0) {
      const userId = docRes.rows[0].user_id as string;
      if (email && email.trim()) {
        await db.execute({
          sql: 'UPDATE users SET email = ? WHERE id = ?',
          args: [email.trim().toLowerCase(), userId],
        });
      }
      if (password && password.trim()) {
        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        await db.execute({
          sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
          args: [hashedPassword, userId],
        });
      }
    }

    await db.execute({
      sql: `UPDATE doctors 
            SET name = COALESCE(?, name),
                specialty = COALESCE(?, specialty),
                qualifications = COALESCE(?, qualifications),
                experience_years = COALESCE(?, experience_years),
                languages = COALESCE(?, languages),
                consultation_fee = COALESCE(?, consultation_fee),
                bio = COALESCE(?, bio),
                clinic_name = COALESCE(?, clinic_name),
                photo_url = COALESCE(?, photo_url)
            WHERE id = ?`,
      args: [
        name !== undefined ? name : null,
        specialty !== undefined ? specialty : null,
        qualifications !== undefined ? qualifications : null,
        experience_years !== undefined ? experience_years : null,
        languagesStr,
        consultation_fee !== undefined ? consultation_fee : null,
        bio !== undefined ? bio : null,
        clinic_name !== undefined ? clinic_name : null,
        photo_url !== undefined ? photo_url : null,
        id,
      ],
    });

    return res.json({ success: true, message: 'Doctor updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/doctors/:id/toggle', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({
      sql: 'UPDATE doctors SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?',
      args: [id],
    });
    return res.json({ success: true, message: 'Doctor status toggled.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/doctors/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM doctors WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
