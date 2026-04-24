import express from 'express';
import pool from '../config/db.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// POST /api/orders
router.post('/', [
  body('customer.firstName').notEmpty(),
  body('customer.lastName').notEmpty(),
  body('customer.email').isEmail(),
  body('customer.phone').notEmpty(),
  body('customer.address').notEmpty(),
  body('customer.city').notEmpty(),
  body('customer.postalCode').notEmpty(),
  body('items').isArray({ min: 1 })
], async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      connection.release();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customer, items, subtotal, discount, shipping, total, paymentMethod, notes } = req.body;
    const orderNumber = 'AV-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, first_name, last_name, email, phone, address, city, postal_code, country, subtotal, discount, shipping, total, payment_method, notes, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        customer.firstName?.trim() || '',
        customer.lastName?.trim() || '',
        customer.email?.trim() || '',
        customer.phone?.trim() || '',
        customer.address?.trim() || '',
        customer.city?.trim() || '',
        customer.postalCode?.trim() || '',
        customer.country || 'Maroc',
        Number(subtotal) || 0,
        Number(discount) || 0,
        Number(shipping) || 0,
        Number(total) || 0,
        paymentMethod || 'cod',
        notes || '',
        customer.location ? JSON.stringify(customer.location) : null
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, size, color, color_name, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId || 0, item.name, Number(item.price) || 0, Number(item.quantity) || 1, item.size || 'M', item.color || 'midnight', item.colorName || '', item.image || '']
      );
    }

    await connection.commit();

    res.status(201).json({ success: true, data: { orderNumber, total } });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur commande:', error.message);
    res.status(500).json({ success: false, message: 'Erreur: ' + error.message });
  } finally {
    connection.release();
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    const [count] = await pool.query('SELECT COUNT(*) as total FROM orders');
    res.json({ success: true, count: count[0].total, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [orderStatus, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
