import { Router, Response } from 'express';
import { db } from '../database/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/services', async (req, res, next) => {
  try {
    const { all } = req.query;
    const sql = all === 'true' ? 'SELECT * FROM services ORDER BY name ASC' : 'SELECT * FROM services WHERE is_active = 1 ORDER BY name ASC';
    const result = await db.execute(sql);
    const services = result.rows.map((row) => ({
      ...row,
      is_active: Boolean(row.is_active),
    }));
    return res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

router.get('/services/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM services WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Healthcare service not found.' });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      data: { ...row, is_active: Boolean(row.is_active) },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/services', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, category, description, price, icon_name, promotional_badge, image_url } = req.body;
    const serviceId = `s-${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO services (id, name, category, description, price, icon_name, promotional_badge, image_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [serviceId, name, category, description, price, icon_name || 'medical-services', promotional_badge || '', image_url || ''],
    });

    return res.status(201).json({ success: true, message: 'Service created successfully.', data: { id: serviceId } });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/services/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, icon_name, promotional_badge, image_url, is_active } = req.body;

    await db.execute({
      sql: `UPDATE services
            SET name = COALESCE(?, name),
                category = COALESCE(?, category),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                icon_name = COALESCE(?, icon_name),
                promotional_badge = COALESCE(?, promotional_badge),
                image_url = COALESCE(?, image_url),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
      args: [name, category, description, price, icon_name, promotional_badge, image_url, is_active !== undefined ? (is_active ? 1 : 0) : null, id],
    });

    return res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/services/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM services WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
