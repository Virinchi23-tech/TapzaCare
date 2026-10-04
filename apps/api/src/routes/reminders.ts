import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/reminders', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const userName = req.user!.name;

    let result = await db.execute({
      sql: 'SELECT * FROM medicine_reminders WHERE user_id = ? OR LOWER(user_id) = LOWER(?) ORDER BY time ASC',
      args: [userId, userName],
    });

    // If no reminders in DB yet, check prescriptions for this patient and auto-sync
    if (result.rows.length === 0) {
      const rxRes = await db.execute({
        sql: 'SELECT id, patient_name FROM prescriptions WHERE patient_id = ? OR LOWER(patient_name) = LOWER(?)',
        args: [userId, userName],
      });

      for (const rx of rxRes.rows) {
        const medRes = await db.execute({
          sql: 'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
          args: [rx.id],
        });

        for (const med of medRes.rows) {
          const times = [];
          if (med.morning) times.push({ time: '08:00 AM', label: 'Morning' });
          if (med.afternoon) times.push({ time: '01:00 PM', label: 'Afternoon' });
          if (med.night) times.push({ time: '08:00 PM', label: 'Night' });
          if (times.length === 0) times.push({ time: '08:00 AM', label: 'Daily' });

          for (const t of times) {
            const remId = `mr-${uuidv4().substring(0, 8)}`;
            await db.execute({
              sql: `INSERT INTO medicine_reminders (id, user_id, medicine_name, dosage, time, recurrence, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, 'Daily', 1, datetime('now'))`,
              args: [
                remId,
                userId,
                med.medicine_name,
                `${med.dosage || '1 Tablet'} (${t.label})`,
                t.time,
              ],
            });
          }
        }
      }

      // Re-query after auto-syncing
      result = await db.execute({
        sql: 'SELECT * FROM medicine_reminders WHERE user_id = ? OR LOWER(user_id) = LOWER(?) ORDER BY time ASC',
        args: [userId, userName],
      });
    }

    // Fetch today's logged doses with status = 'taken'
    const todayStr = new Date().toISOString().split('T')[0];
    const logsRes = await db.execute({
      sql: "SELECT medicine_name, dose_time FROM dose_logs WHERE status = 'taken' AND (date(logged_at) = date('now') OR logged_at LIKE ?)",
      args: [`${todayStr}%`],
    });

    const takenMedsToday = new Set(
      logsRes.rows.map((l) => `${(l.medicine_name as string).toLowerCase().trim()}`)
    );

    const now = new Date();
    const reminders = result.rows.map((r) => {
      const medNameClean = (r.medicine_name as string).toLowerCase().trim();
      const isTakenToday = takenMedsToday.has(medNameClean);
      
      // Calculate expiration: if created_at is older than 30 days, mark expired
      let isExpired = false;
      if (r.created_at) {
        const createdDate = new Date(r.created_at as string);
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) isExpired = true;
      }

      return {
        ...r,
        is_active: Boolean(r.is_active) && !isExpired,
        taken_today: isTakenToday,
        is_expired: isExpired,
      };
    });

    return res.json({ success: true, data: reminders });
  } catch (err) {
    next(err);
  }
});

router.post('/reminders', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { medicine_name, dosage, time, recurrence } = req.body;
    const userId = req.user!.id;
    const reminderId = `mr-${uuidv4().substring(0, 8)}`;

    await db.execute({
      sql: `INSERT INTO medicine_reminders (id, user_id, medicine_name, dosage, time, recurrence, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [reminderId, userId, medicine_name, dosage, time, recurrence || 'Daily'],
    });

    return res.status(201).json({ success: true, message: 'Medicine reminder created.', data: { id: reminderId } });
  } catch (err) {
    next(err);
  }
});

router.patch('/reminders/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { is_active, time } = req.body;

    if (typeof is_active === 'boolean') {
      await db.execute({
        sql: 'UPDATE medicine_reminders SET is_active = ? WHERE id = ?',
        args: [is_active ? 1 : 0, id],
      });
    }

    if (time) {
      await db.execute({
        sql: 'UPDATE medicine_reminders SET time = ? WHERE id = ?',
        args: [time, id],
      });
    }

    return res.json({ success: true, message: 'Reminder updated.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/reminders/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM medicine_reminders WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Reminder deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
