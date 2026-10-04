import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/patients', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await db.execute({
      sql: "SELECT id, name, email, phone FROM users WHERE role = 'patient' ORDER BY name ASC",
      args: [],
    });
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/prescriptions', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const userName = req.user!.name;
    const role = req.user!.role;

    // Ensure columns exist
    try {
      await db.execute("ALTER TABLE prescriptions ADD COLUMN document_url TEXT");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE prescriptions ADD COLUMN patient_name TEXT");
    } catch (e) {}

    let sql = 'SELECT * FROM prescriptions';
    const args: any[] = [];

    if (role === 'patient') {
      sql += ' WHERE (patient_id = ? OR LOWER(patient_name) = LOWER(?))';
      args.push(userId, userName);
    } else if (role === 'doctor') {
      const docRes = await db.execute({ sql: 'SELECT id FROM doctors WHERE user_id = ?', args: [userId] });
      if (docRes.rows.length > 0) {
        sql += ' WHERE (doctor_id = ? OR LOWER(doctor_name) LIKE LOWER(?))';
        args.push(docRes.rows[0].id, `%${userName}%`);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });
    const prescriptions = [];

    for (const row of result.rows) {
      const medRes = await db.execute({
        sql: 'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
        args: [row.id],
      });

      prescriptions.push({
        ...row,
        medicines: medRes.rows.map((m) => ({
          ...m,
          morning: Boolean(m.morning),
          afternoon: Boolean(m.afternoon),
          night: Boolean(m.night),
        })),
      });
    }

    return res.json({ success: true, data: prescriptions });
  } catch (err) {
    next(err);
  }
});

router.get('/prescriptions/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM prescriptions WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prescription not found.' });
    }

    const rx = result.rows[0];
    const medRes = await db.execute({
      sql: 'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
      args: [id],
    });

    return res.json({
      success: true,
      data: {
        ...rx,
        medicines: medRes.rows.map((m) => ({
          ...m,
          morning: Boolean(m.morning),
          afternoon: Boolean(m.afternoon),
          night: Boolean(m.night),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/prescriptions (Doctors ONLY or Admin)
router.post('/prescriptions', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userRole = req.user!.role;
    if (userRole !== 'doctor' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Prescribing medicines can only be done through the Doctor Portal.',
      });
    }

    const { patient_id, patient_name, doctor_name, clinic_name, date, notes, medicines, document_url } = req.body;
    const rxId = `rx-${uuidv4().substring(0, 8)}`;
    const docUserId = req.user!.id;

    // Get doctor id
    const docRes = await db.execute({ sql: 'SELECT id, name, clinic_name FROM doctors WHERE user_id = ?', args: [docUserId] });
    const doctorId = docRes.rows.length > 0 ? (docRes.rows[0].id as string) : 'd-1';
    const docName = doctor_name || (docRes.rows.length > 0 ? docRes.rows[0].name : (req.user!.name || 'Dr. Tapza Physician'));
    const docClinic = clinic_name || (docRes.rows.length > 0 ? docRes.rows[0].clinic_name : 'Tapza Care Hospital');

    // Ensure columns exist in prescriptions table
    try {
      await db.execute("ALTER TABLE prescriptions ADD COLUMN document_url TEXT");
    } catch (e) {}
    try {
      await db.execute("ALTER TABLE prescriptions ADD COLUMN patient_name TEXT");
    } catch (e) {}

    // Find actual matching patient user ID if patient_name matches a registered user
    let finalPatientId = patient_id;
    if (patient_name) {
      const matchUser = await db.execute({
        sql: "SELECT id FROM users WHERE (LOWER(name) = LOWER(?) OR id = ?) AND role = 'patient'",
        args: [patient_name.trim(), patient_name.trim()],
      });
      if (matchUser.rows.length > 0) {
        finalPatientId = matchUser.rows[0].id as string;
      }
    }
    if (!finalPatientId) finalPatientId = 'u-patient-1';

    await db.execute({
      sql: `INSERT INTO prescriptions (id, patient_id, patient_name, doctor_id, doctor_name, clinic_name, date, notes, document_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        rxId,
        finalPatientId,
        patient_name || 'Patient',
        doctorId,
        docName,
        docClinic,
        date || new Date().toISOString().split('T')[0],
        notes || '',
        document_url || '',
      ],
    });

    if (Array.isArray(medicines) && medicines.length > 0) {
      for (const med of medicines) {
        if (!med.medicine_name) continue;
        await db.execute({
          sql: `INSERT INTO prescription_medicines (id, prescription_id, medicine_name, dosage, duration, morning, afternoon, night, instructions, timings_display)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            `pm-${uuidv4().substring(0, 8)}`,
            rxId,
            med.medicine_name,
            med.dosage || '1 Tablet',
            med.duration || '5 days',
            med.morning ? 1 : 0,
            med.afternoon ? 1 : 0,
            med.night ? 1 : 0,
            med.instructions || '',
            med.timings_display || 'Daily',
          ],
        });

        // Automatically create active medicine reminders synced with DB based on timing checkboxes
        const timings = [];
        if (med.morning) timings.push({ time: '08:00 AM', label: 'Morning' });
        if (med.afternoon) timings.push({ time: '01:00 PM', label: 'Afternoon' });
        if (med.night) timings.push({ time: '08:00 PM', label: 'Night' });
        if (timings.length === 0) timings.push({ time: '08:00 AM', label: 'Daily' });

        for (const t of timings) {
          const remId = `mr-${uuidv4().substring(0, 8)}`;
          await db.execute({
            sql: `INSERT INTO medicine_reminders (id, user_id, medicine_name, dosage, time, recurrence, is_active, created_at)
                  VALUES (?, ?, ?, ?, ?, 'Daily', 1, datetime('now'))`,
            args: [
              remId,
              finalPatientId,
              med.medicine_name,
              `${med.dosage || '1 Tablet'} (${t.label})`,
              t.time,
            ],
          });
        }
      }
    } else if (document_url) {
      // Create document intake reminder if file document was uploaded
      const remId = `mr-${uuidv4().substring(0, 8)}`;
      await db.execute({
        sql: `INSERT INTO medicine_reminders (id, user_id, medicine_name, dosage, time, recurrence, is_active, created_at)
              VALUES (?, ?, ?, ?, '08:00 AM', 'Daily', 1, datetime('now'))`,
        args: [
          remId,
          finalPatientId,
          `Prescription Document (${patient_name || 'Rx'})`,
          'Follow attached doctor prescription document',
        ],
      });
    }

    return res.status(201).json({ success: true, message: 'Prescription created and reminders synced successfully.', data: { id: rxId } });
  } catch (err) {
    next(err);
  }
});

// Dose logging
router.post('/dose-logs', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { prescription_id, medicine_name, dose_time, status } = req.body;
    const logId = `dl-${uuidv4().substring(0, 8)}`;
    const pxId = prescription_id || 'rx-general';

    // Ensure fallback prescription exists to satisfy FK constraint if needed
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO prescriptions (id, patient_id, patient_name, doctor_id, doctor_name, clinic_name, date, notes, created_at)
              VALUES ('rx-general', ?, ?, 'd-1', 'Tapza Physician', 'Tapza Hospital', strftime('%Y-%m-%d','now'), 'Dose Log', datetime('now'))`,
        args: [req.user!.id, req.user!.name],
      });
    } catch (e) {}

    await db.execute({
      sql: `INSERT INTO dose_logs (id, prescription_id, medicine_name, dose_time, status, logged_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [logId, pxId, medicine_name || 'Medicine', dose_time || 'Now', status || 'taken'],
    });

    return res.status(201).json({ success: true, message: 'Dose logged successfully.', data: { id: logId } });
  } catch (err) {
    next(err);
  }
});

router.get('/dose-logs', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { prescription_id } = req.query;
    let sql = 'SELECT * FROM dose_logs';
    const args: any[] = [];

    if (prescription_id) {
      sql += ' WHERE prescription_id = ?';
      args.push(prescription_id);
    }

    sql += ' ORDER BY logged_at DESC';

    const result = await db.execute({ sql, args });
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
