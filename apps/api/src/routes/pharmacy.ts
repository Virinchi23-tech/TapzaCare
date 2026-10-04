import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

const PHARMACY_MEDICINES = [
  {
    id: 'med-1',
    name: 'Dolo 650mg Tablet',
    brand: 'Micro Labs',
    category: 'Fever & Cold',
    pack_size: 'Strip of 15 Tablets',
    price: 35,
    mrp: 45,
    discount_percent: 22,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    description: 'Fast acting fever relief and mild to moderate pain relief formulation.',
    rating: 4.9,
  },
  {
    id: 'med-2',
    name: 'Paracetamol 500mg',
    brand: 'Cipla',
    category: 'Fever & Cold',
    pack_size: 'Strip of 10 Tablets',
    price: 20,
    mrp: 25,
    discount_percent: 20,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1550572017-edf792890581?w=500',
    description: 'Trusted anti-pyretic for body ache and fever control.',
    rating: 4.8,
  },
  {
    id: 'med-3',
    name: 'Crocin 650 Advance',
    brand: 'GSK',
    category: 'Fever & Cold',
    pack_size: 'Strip of 15 Tablets',
    price: 40,
    mrp: 50,
    discount_percent: 20,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500',
    description: 'Fast release technology for rapid fever & body pain relief.',
    rating: 4.8,
  },
  {
    id: 'med-4',
    name: 'Azithromycin 500mg',
    brand: 'Sun Pharma',
    category: 'Antibiotics',
    pack_size: 'Strip of 3 Tablets',
    price: 75,
    mrp: 90,
    discount_percent: 16,
    requires_prescription: true,
    image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500',
    description: 'Broad spectrum antibiotic for respiratory and throat infections.',
    rating: 4.9,
  },
  {
    id: 'med-5',
    name: 'Pantoprazole 40mg (Pan 40)',
    brand: 'Alkem Labs',
    category: 'Digestive Health',
    pack_size: 'Strip of 10 Tablets',
    price: 60,
    mrp: 75,
    discount_percent: 20,
    requires_prescription: true,
    image_url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500',
    description: 'Proton pump inhibitor for acidity, GERD, and stomach ulcers.',
    rating: 4.8,
  },
  {
    id: 'med-6',
    name: 'Vitamin C 1000mg + Zinc (Limcee)',
    brand: 'Abbott',
    category: 'Vitamins & Supplements',
    pack_size: 'Strip of 15 Chewable Tablets',
    price: 120,
    mrp: 150,
    discount_percent: 20,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1550572017-edf792890581?w=500',
    description: 'Immunity booster chewable tablets rich in Vitamin C and Zinc.',
    rating: 4.9,
  },
  {
    id: 'med-7',
    name: 'Volini Fast Pain Relief Spray',
    brand: 'Sun Pharma',
    category: 'Pain Relief',
    pack_size: '100g Spray Can',
    price: 199,
    mrp: 250,
    discount_percent: 20,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    description: 'Quick relief spray for joint pain, muscle strain, and backache.',
    rating: 4.9,
  },
  {
    id: 'med-8',
    name: 'Cetirizine 10mg (Okacet)',
    brand: 'Cipla',
    category: 'Allergy & Sinus',
    pack_size: 'Strip of 10 Tablets',
    price: 25,
    mrp: 30,
    discount_percent: 16,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500',
    description: 'Anti-histamine for runny nose, sneezing, and skin allergy relief.',
    rating: 4.7,
  },
  {
    id: 'med-9',
    name: 'First Aid Emergency Care Kit',
    brand: 'Tapza Health',
    category: 'First Aid',
    pack_size: 'Complete Box Set',
    price: 350,
    mrp: 450,
    discount_percent: 22,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500',
    description: 'Comprehensive home kit with bandages, antiseptic liquid, cotton, and scissors.',
    rating: 5.0,
  },
  {
    id: 'med-10',
    name: 'Omega-3 Triple Strength Fish Oil',
    brand: 'HealthKart',
    category: 'Vitamins & Supplements',
    pack_size: '60 Softgel Capsules',
    price: 499,
    mrp: 799,
    discount_percent: 37,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500',
    description: 'High potency EPA & DHA for heart, joint, and brain health.',
    rating: 4.9,
  },
];

// Ensure database table exists and seed initial default medicines if empty
async function initPharmacyMedicinesTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pharmacy_medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT NOT NULL,
        pack_size TEXT,
        price REAL NOT NULL,
        mrp REAL,
        discount_percent INTEGER DEFAULT 0,
        requires_prescription INTEGER DEFAULT 0,
        image_url TEXT,
        description TEXT,
        rating REAL DEFAULT 4.8,
        stock_status TEXT DEFAULT 'in_stock',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const check = await db.execute('SELECT COUNT(*) as cnt FROM pharmacy_medicines');
    const count = Number(check.rows[0]?.cnt || 0);
    if (count === 0) {
      for (const med of PHARMACY_MEDICINES) {
        await db.execute({
          sql: `INSERT INTO pharmacy_medicines (id, name, brand, category, pack_size, price, mrp, discount_percent, requires_prescription, image_url, description, rating, stock_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_stock')`,
          args: [
            med.id,
            med.name,
            med.brand,
            med.category,
            med.pack_size,
            med.price,
            med.mrp,
            med.discount_percent,
            med.requires_prescription ? 1 : 0,
            med.image_url,
            med.description,
            med.rating,
          ],
        });
      }
    }
  } catch (err) {
    console.error('Failed to initialize pharmacy_medicines table:', err);
  }
}

// GET /api/pharmacy/medicines
router.get('/pharmacy/medicines', async (req, res, next) => {
  try {
    await initPharmacyMedicinesTable();
    const { category, query } = req.query;

    const result = await db.execute('SELECT * FROM pharmacy_medicines ORDER BY created_at DESC');
    let medicines = result.rows.map((r: any) => ({
      ...r,
      requires_prescription: Boolean(r.requires_prescription),
      price: Number(r.price),
      mrp: Number(r.mrp || r.price),
      discount_percent: Number(r.discount_percent || 0),
      rating: Number(r.rating || 4.8),
    }));

    if (category && category !== 'All') {
      medicines = medicines.filter((m) => m.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (query) {
      const q = (query as string).toLowerCase();
      medicines = medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.brand && m.brand.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, data: medicines });
  } catch (err) {
    next(err);
  }
});

// POST /api/pharmacy/medicines (Pharmacist & Admin)
router.post('/pharmacy/medicines', authenticate, authorize(['pharmacist', 'admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    await initPharmacyMedicinesTable();
    const { name, brand, category, pack_size, price, mrp, discount_percent, requires_prescription, image_url, description, stock_status } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name, category, and price are required.' });
    }

    const id = `med-${uuidv4().substring(0, 8)}`;
    const calcPrice = Number(price);
    const calcMrp = Number(mrp || price);
    const calcDiscount = Number(discount_percent !== undefined ? discount_percent : (calcMrp > calcPrice ? Math.round(((calcMrp - calcPrice) / calcMrp) * 100) : 0));

    await db.execute({
      sql: `INSERT INTO pharmacy_medicines (id, name, brand, category, pack_size, price, mrp, discount_percent, requires_prescription, image_url, description, rating, stock_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.8, ?)`,
      args: [
        id,
        name,
        brand || 'Generic',
        category,
        pack_size || 'Strip of 10 Tablets',
        calcPrice,
        calcMrp,
        calcDiscount,
        requires_prescription ? 1 : 0,
        image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        description || '',
        stock_status || 'in_stock',
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Medicine added to database catalog successfully!',
      data: { id, name, category, price: calcPrice },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pharmacy/medicines/:id (Pharmacist & Admin)
router.put('/pharmacy/medicines/:id', authenticate, authorize(['pharmacist', 'admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    await initPharmacyMedicinesTable();
    const { id } = req.params;
    const { name, brand, category, pack_size, price, mrp, discount_percent, requires_prescription, image_url, description, stock_status } = req.body;

    const calcPrice = Number(price);
    const calcMrp = Number(mrp || price);
    const calcDiscount = Number(discount_percent !== undefined ? discount_percent : (calcMrp > calcPrice ? Math.round(((calcMrp - calcPrice) / calcMrp) * 100) : 0));

    await db.execute({
      sql: `UPDATE pharmacy_medicines 
            SET name=?, brand=?, category=?, pack_size=?, price=?, mrp=?, discount_percent=?, requires_prescription=?, image_url=?, description=?, stock_status=?
            WHERE id=?`,
      args: [
        name,
        brand || 'Generic',
        category,
        pack_size || 'Strip of 10 Tablets',
        calcPrice,
        calcMrp,
        calcDiscount,
        requires_prescription ? 1 : 0,
        image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        description || '',
        stock_status || 'in_stock',
        id,
      ],
    });

    return res.json({ success: true, message: 'Medicine updated successfully!' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pharmacy/medicines/:id (Pharmacist & Admin)
router.delete('/pharmacy/medicines/:id', authenticate, authorize(['pharmacist', 'admin']), async (req: AuthRequest, res: Response, next) => {
  try {
    await initPharmacyMedicinesTable();
    const { id } = req.params;

    await db.execute({
      sql: 'DELETE FROM pharmacy_medicines WHERE id = ?',
      args: [id],
    });

    return res.json({ success: true, message: 'Medicine deleted successfully from catalog!' });
  } catch (err) {
    next(err);
  }
});

// GET /api/pharmacy/orders
router.get('/pharmacy/orders', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const userName = req.user!.name;
    const role = req.user!.role;

    // Ensure schema columns exist
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN delivery_address TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN payment_method TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN items_json TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN prescription_url TEXT"); } catch (e) {}

    let sql = 'SELECT * FROM pharmacy_orders';
    const args: any[] = [];

    if (role === 'patient') {
      sql += ' WHERE patient_id = ? OR LOWER(patient_name) = LOWER(?)';
      args.push(userId, userName);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });

    const orders = result.rows.map((row: any) => {
      let items = [];
      try {
        items = JSON.parse(row.items_json || '[]');
      } catch (e) {
        items = [{ name: row.items_summary, qty: 1, price: row.total_amount }];
      }
      return {
        ...row,
        items,
      };
    });

    return res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// POST /api/pharmacy/orders
router.post('/pharmacy/orders', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { items, total_amount, delivery_address, payment_method, prescription_url, notes } = req.body;
    const patientId = req.user!.id;
    const patientName = req.user!.name;

    const orderId = `po-${uuidv4().substring(0, 8)}`;

    // Ensure schema columns exist
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN delivery_address TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN payment_method TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN items_json TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN prescription_url TEXT"); } catch (e) {}

    const itemsSummary = Array.isArray(items) 
      ? items.map((i: any) => `${i.name} x${i.qty || 1}`).join(', ') 
      : 'Pharmacy Medicines Order';

    await db.execute({
      sql: `INSERT INTO pharmacy_orders (id, patient_id, patient_name, items_summary, items_json, total_amount, delivery_address, payment_method, prescription_url, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', datetime('now'))`,
      args: [
        orderId,
        patientId,
        patientName,
        itemsSummary,
        JSON.stringify(items || []),
        total_amount || 0,
        delivery_address || 'Default Address',
        payment_method || 'Cash on Delivery',
        prescription_url || '',
      ],
    });

    // In-app Notification
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
      args: [
        `notif-${uuidv4().substring(0, 8)}`,
        patientId,
        'Medicine Order Placed! 🛵',
        `Your pharmacy order #${orderId} for ₹${total_amount} is placed and will be delivered in 30 minutes.`,
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Medicine order placed successfully!',
      data: {
        id: orderId,
        patient_name: patientName,
        items_summary: itemsSummary,
        total_amount,
        status: 'placed',
        delivery_address,
        payment_method,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Status Update Endpoint handler for pharmacy orders (PATCH, PUT, POST)
const handlePharmacyOrderStatusUpdate = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Please specify status.' });
    }

    // Ensure schema columns exist
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN delivery_address TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE pharmacy_orders ADD COLUMN payment_method TEXT"); } catch (e) {}

    await db.execute({
      sql: 'UPDATE pharmacy_orders SET status = ? WHERE id = ?',
      args: [status, id],
    });

    return res.json({ success: true, message: `Order #${id} status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};

router.patch('/pharmacy/orders/:id/status', authenticate, handlePharmacyOrderStatusUpdate);
router.put('/pharmacy/orders/:id/status', authenticate, handlePharmacyOrderStatusUpdate);
router.post('/pharmacy/orders/:id/status', authenticate, handlePharmacyOrderStatusUpdate);
router.patch('/admin/pharmacy/:id', authenticate, handlePharmacyOrderStatusUpdate);
router.put('/admin/pharmacy/:id', authenticate, handlePharmacyOrderStatusUpdate);

export default router;
