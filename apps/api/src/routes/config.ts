import { Router, Response } from 'express';
import { db } from '../database/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { LayoutConfig } from '@tapza/shared-types';

const router = Router();

const defaultNormalConfig: LayoutConfig = {
  version: 'v1.0.0',
  is_festival: false,
  theme_mode: 'light',
  primary_color: '#0d9488',
  accent_color: '#4f46e5',
  surface_color: '#ffffff',
  sections: [
    {
      id: 'sec-1',
      type: 'hero_banner',
      title: 'Your Health Our Priority',
      description: 'Book trusted doctors, get expert care, and stay healthy — all in one place.',
      visible: true,
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
    },
    {
      id: 'sec-2',
      type: 'category_chips',
      title: 'Our Departments',
      visible: true,
      background_type: 'solid',
      background_value: '#f8fafc',
    },
    {
      id: 'sec-3',
      type: 'quick_actions',
      title: 'Quick Services',
      visible: true,
      background_type: 'solid',
      background_value: '#ffffff',
    },
  ],
};

// GET /api/config
router.get('/config', async (req, res) => {
  try {
    const isPreviewFestival = req.query.festival === 'true';
    const festVal = isPreviewFestival ? 1 : 0;

    const result = await db.execute(`SELECT * FROM layout_configs WHERE is_published = 1 AND is_festival = ${festVal} ORDER BY created_at DESC LIMIT 1`);

    if (result.rows.length === 0) {
      const fallback = await db.execute('SELECT * FROM layout_configs WHERE is_published = 1 LIMIT 1');
      if (fallback.rows.length > 0) {
        const row = fallback.rows[0];
        return res.json({
          success: true,
          data: {
            id: row.id,
            version: row.version,
            is_festival: Boolean(row.is_festival),
            festival_name: row.festival_name || undefined,
            festival_greeting: row.festival_greeting || undefined,
            festival_banner_url: row.festival_banner_url || undefined,
            theme_mode: row.theme_mode,
            primary_color: row.primary_color,
            accent_color: row.accent_color,
            surface_color: row.surface_color,
            sections: JSON.parse(row.sections_json as string),
          },
        });
      }
      return res.json({ success: true, data: defaultNormalConfig });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        version: row.version,
        is_festival: Boolean(row.is_festival),
        festival_name: row.festival_name || undefined,
        festival_greeting: row.festival_greeting || undefined,
        festival_banner_url: row.festival_banner_url || undefined,
        theme_mode: row.theme_mode,
        primary_color: row.primary_color,
        accent_color: row.accent_color,
        surface_color: row.surface_color,
        sections: JSON.parse(row.sections_json as string),
      },
    });
  } catch (err) {
    console.error('Error fetching config from Turso DB:', err);
    return res.json({ success: true, data: defaultNormalConfig });
  }
});

// GET /api/config/versions
router.get('/config/versions', async (req, res, next) => {
  try {
    const result = await db.execute('SELECT id, version, is_festival, created_at FROM layout_configs ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/config
router.post('/admin/config', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id, version, is_festival, festival_name, festival_greeting, festival_banner_url, theme_mode, primary_color, accent_color, surface_color, sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ success: false, error: 'Invalid configuration: sections must be an array.' });
    }

    const configId = id || `cfg-${Date.now()}`;
    const sectionsJson = JSON.stringify(sections);

    await db.execute({
      sql: `INSERT OR REPLACE INTO layout_configs 
            (id, version, is_festival, festival_name, festival_greeting, festival_banner_url, theme_mode, primary_color, accent_color, surface_color, sections_json, is_published, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [
        configId,
        version || 'v1.0.0',
        is_festival ? 1 : 0,
        festival_name || null,
        festival_greeting || null,
        festival_banner_url || null,
        theme_mode || 'light',
        primary_color || '#0d9488',
        accent_color || '#4f46e5',
        surface_color || '#ffffff',
        sectionsJson,
      ],
    });

    return res.json({ success: true, message: 'Layout configuration saved and updated successfully.', data: { id: configId } });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/config/toggle-festival
router.post('/admin/config/toggle-festival', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    const { enable_festival } = req.body;
    const targetFestivalState = enable_festival ? 1 : 0;

    await db.execute('UPDATE layout_configs SET is_published = 0');
    await db.execute(`UPDATE layout_configs SET is_published = 1 WHERE is_festival = ${targetFestivalState} ORDER BY created_at DESC LIMIT 1`);

    return res.json({
      success: true,
      message: `Festival mode ${enable_festival ? 'ENABLED' : 'DISABLED'} successfully! Home screen updated.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
