import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const userRes = await db.execute({
      sql: 'SELECT id, email, name, phone, role, avatar_url FROM users WHERE id = ?',
      args: [userId],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userRes.rows[0];
    const profRes = await db.execute({
      sql: 'SELECT * FROM patient_profiles WHERE user_id = ?',
      args: [userId],
    });

    const profile = profRes.rows.length > 0 ? profRes.rows[0] : null;

    return res.json({
      success: true,
      data: {
        ...user,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { name, phone, gender, dob, blood_group, address, emergency_contact } = req.body;

    if (name || phone) {
      await db.execute({
        sql: "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = datetime('now') WHERE id = ?",
        args: [name || null, phone || null, userId],
      });
    }

    await db.execute({
      sql: `INSERT INTO patient_profiles (id, user_id, gender, dob, blood_group, address, emergency_contact, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
            gender = COALESCE(?, gender),
            dob = COALESCE(?, dob),
            blood_group = COALESCE(?, blood_group),
            address = COALESCE(?, address),
            emergency_contact = COALESCE(?, emergency_contact),
            updated_at = datetime('now')`,
      args: [
        `pp-${uuidv4().substring(0, 8)}`,
        userId,
        gender || 'Unspecified',
        dob || null,
        blood_group || 'O+',
        address || '',
        emergency_contact || '',
        gender || null,
        dob || null,
        blood_group || null,
        address || null,
        emergency_contact || null,
      ],
    });

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// Family Members
router.get('/family', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const result = await db.execute({
      sql: 'SELECT * FROM family_members WHERE patient_id = ? ORDER BY name ASC',
      args: [userId],
    });
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/family', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { name, relation, age, gender } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ success: false, error: 'Name and relation are required.' });
    }

    const memberId = `fm-${uuidv4().substring(0, 8)}`;
    await db.execute({
      sql: 'INSERT INTO family_members (id, patient_id, name, relation, age, gender) VALUES (?, ?, ?, ?, ?, ?)',
      args: [memberId, userId, name, relation, age || 30, gender || 'Unspecified'],
    });

    return res.status(201).json({ success: true, message: 'Family member added.', data: { id: memberId } });
  } catch (err) {
    next(err);
  }
});

export default router;
