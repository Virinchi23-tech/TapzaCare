import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/dashboard
router.get('/admin/dashboard', authenticate, authorize(['admin', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const getCount = async (sql: string, args: any[] = []) => {
      try {
        const result = await db.execute({ sql, args });
        return Number(result.rows[0]?.count || 0);
      } catch (e) {
        return 0;
      }
    };

    const total_patients = await getCount("SELECT COUNT(*) as count FROM users WHERE role = 'patient'");
    const total_doctors = await getCount('SELECT COUNT(*) as count FROM doctors WHERE is_active = 1');
    const today_appointments = await getCount("SELECT COUNT(*) as count FROM bookings WHERE booking_date = strftime('%Y-%m-%d', 'now')");
    const confirmed_bookings = await getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
    const pending_bookings = await getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    const cancelled_bookings = await getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled'");
    const lab_orders_count = await getCount('SELECT COUNT(*) as count FROM lab_test_orders');
    const pharmacy_orders_count = await getCount('SELECT COUNT(*) as count FROM pharmacy_orders');

    return res.json({
      success: true,
      data: {
        total_patients,
        total_doctors,
        today_appointments,
        confirmed_bookings,
        pending_bookings,
        cancelled_bookings,
        lab_orders_count,
        pharmacy_orders_count,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/admin/users', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, email, name, phone, role, avatar_url, created_at FROM users';
    const args: any[] = [];

    if (role) {
      sql += ' WHERE role = ?';
      args.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Employee Management APIs (staff, nurse, pharmacist, lab, receptionist, manager)
router.get('/admin/employees', authenticate, authorize(['admin', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = req.query;
    let sql = "SELECT id, email, name, phone, role, avatar_url, created_at FROM users WHERE role NOT IN ('patient', 'doctor')";
    const args: any[] = [];

    if (role && role !== 'all') {
      sql += ' AND role = ?';
      args.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });
    
    // Auto-seed sample employees if table is empty
    if (result.rows.length === 0) {
      const sampleEmployees = [
        { id: 'u-emp-1', email: 'nurse.anjali@tapzacare.com', name: 'Nurse Anjali Sharma', phone: '+91 98765 11001', role: 'nurse' },
        { id: 'u-emp-2', email: 'pharmacy.ramesh@tapzacare.com', name: 'Ramesh Patel', phone: '+91 98765 11002', role: 'pharmacist' },
        { id: 'u-emp-3', email: 'lab.vikram@tapzacare.com', name: 'Vikram Singh', phone: '+91 98765 11003', role: 'lab' },
        { id: 'u-emp-4', email: 'reception.priya@tapzacare.com', name: 'Priya Verma', phone: '+91 98765 11004', role: 'receptionist' },
        { id: 'u-emp-5', email: 'staff.suresh@tapzacare.com', name: 'Suresh Kumar', phone: '+91 98765 11005', role: 'staff' },
      ];

      for (const emp of sampleEmployees) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO users (id, email, password_hash, name, phone, role, created_at)
                VALUES (?, ?, '$2a$10$vN91R6WfG4V6R7x7s7NqOeXqO.0W3Uv4q6.qO.1234567890abcd', ?, ?, ?, datetime('now'))`,
          args: [emp.id, emp.email, emp.name, emp.phone, emp.role],
        });
      }

      const freshRes = await db.execute({ sql, args });
      return res.json({ success: true, data: freshRes.rows });
    }

    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/employees', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Employee name and email are required.' });
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Employee with this email already exists.' });
    }

    const empId = `u-emp-${Date.now()}`;
    const passwordToUse = (password && password.trim()) ? password.trim() : 'password123';
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);
    const empRole = role || 'staff';

    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, name, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      args: [empId, email.toLowerCase().trim(), hashedPassword, name, phone || '+91 98765 00000', empRole],
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital Employee created successfully.',
      data: { id: empId, email: email.toLowerCase().trim(), role: empRole },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/employees/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, phone } = req.body;

    if (email && email.trim()) {
      await db.execute({
        sql: 'UPDATE users SET email = ? WHERE id = ?',
        args: [email.trim().toLowerCase(), id],
      });
    }

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      await db.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
        args: [hashedPassword, id],
      });
    }

    await db.execute({
      sql: `UPDATE users 
            SET name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                role = COALESCE(?, role)
            WHERE id = ?`,
      args: [name || null, phone || null, role || null, id],
    });

    return res.json({ success: true, message: 'Employee profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/employees/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Employee deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET & PATCH /api/admin/labs
router.get('/admin/labs', authenticate, authorize(['admin', 'lab', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await db.execute('SELECT * FROM lab_test_orders ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/labs', authenticate, authorize(['admin', 'lab']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { patient_name, test_name, sample_type, price, status, test_date } = req.body;
    const labId = `lt-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO lab_test_orders (id, patient_id, patient_name, test_name, sample_type, test_date, status, price, created_at)
            VALUES (?, 'u-patient-1', ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [labId, patient_name || 'Patient', test_name, sample_type || 'Blood', test_date || new Date().toISOString().split('T')[0], status || 'pending', price || 999],
    });
    return res.status(201).json({ success: true, message: 'Lab test order created successfully.', data: { id: labId } });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/labs/:id', authenticate, authorize(['admin', 'lab', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { patient_name, test_name, sample_type, price, status, report_url, test_date } = req.body;
    await db.execute({
      sql: `UPDATE lab_test_orders 
            SET patient_name = COALESCE(?, patient_name),
                test_name = COALESCE(?, test_name),
                sample_type = COALESCE(?, sample_type),
                price = COALESCE(?, price),
                status = COALESCE(?, status),
                report_url = COALESCE(?, report_url),
                test_date = COALESCE(?, test_date)
            WHERE id = ?`,
      args: [patient_name || null, test_name || null, sample_type || null, price || null, status || null, report_url || null, test_date || null, id],
    });
    return res.json({ success: true, message: 'Lab test order updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/labs/:id', authenticate, authorize(['admin', 'lab', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.execute({
      sql: 'UPDATE lab_test_orders SET status = ? WHERE id = ?',
      args: [status, id],
    });
    return res.json({ success: true, message: 'Lab test order status updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/labs/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM lab_test_orders WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Lab test order deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET, PUT & DELETE /api/admin/bookings
router.get('/admin/bookings', authenticate, authorize(['admin', 'doctor', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await db.execute('SELECT * FROM bookings ORDER BY booking_date DESC, created_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/bookings/:id', authenticate, authorize(['admin', 'doctor', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { status, booking_date, time_slot, fee, reason, notes } = req.body;
    await db.execute({
      sql: `UPDATE bookings 
            SET status = COALESCE(?, status),
                booking_date = COALESCE(?, booking_date),
                time_slot = COALESCE(?, time_slot),
                fee = COALESCE(?, fee),
                reason = COALESCE(?, reason),
                notes = COALESCE(?, notes),
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [status || null, booking_date || null, time_slot || null, fee || null, reason || null, notes || null, id],
    });
    return res.json({ success: true, message: 'Booking updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/bookings/:id', authenticate, authorize(['admin', 'doctor', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.execute({
      sql: "UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?",
      args: [status, id],
    });
    return res.json({ success: true, message: 'Booking status updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/bookings/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM bookings WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET & PATCH /api/admin/pharmacy
router.get('/admin/pharmacy', authenticate, authorize(['admin', 'pharmacist', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await db.execute('SELECT * FROM pharmacy_orders ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/pharmacy/:id', authenticate, authorize(['admin', 'pharmacist']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute({
      sql: 'UPDATE pharmacy_orders SET status = ? WHERE id = ?',
      args: [status, id],
    });

    return res.json({ success: true, message: 'Pharmacy order status updated.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/tickets
router.get('/admin/tickets', authenticate, authorize(['admin', 'staff']), async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await db.execute('SELECT * FROM support_tickets ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-logs
router.get('/admin/audit-logs', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await db.execute('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/upload - Image upload from System or Drive
router.post('/admin/upload', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: 'No file data provided.' });
    }

    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.resolve(process.cwd(), 'apps/web/public/uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save base64 file or generate safe filename
    const ext = fileName?.split('.').pop() || 'jpg';
    const cleanFileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, cleanFileName);

    if (fileData.startsWith('data:image')) {
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filePath, base64Data, 'base64');
    } else {
      fs.writeFileSync(filePath, fileData);
    }

    const publicUrl = `/uploads/${cleanFileName}`;
    return res.json({ success: true, url: publicUrl, message: 'Image uploaded successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
