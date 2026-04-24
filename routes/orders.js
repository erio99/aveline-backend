const express = require('express');
const pool = require('../config/db');
const { sendOrderConfirmation, sendCustomerMessage } = require('../utils/sendEmail');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ==========================
// CREATE ORDER
// ==========================
router.post('/', [
  body('customer.firstName').notEmpty(),
  body('customer.lastName').notEmpty(),
  body('customer.email').isEmail(),
  body('items').isArray({ min: 1 })
], async (req, res) => {

  let connection;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    connection = await pool.getConnection();

    const { customer, items, subtotal, discount, shipping, total, paymentMethod, notes } = req.body;

    const orderNumber = 'AV-' + Date.now();

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
      (order_number, first_name, last_name, email, phone, address, city, postal_code, country, subtotal, discount, shipping, total, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.postalCode,
        customer.country || 'Maroc',
        Number(subtotal || 0),
        Number(discount || 0),
        Number(shipping || 0),
        Number(total || 0),
        paymentMethod || 'cod',
        notes || ''
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items 
        (order_id, product_id, name, price, quantity, size, color, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId || 0,
          item.name,
          Number(item.price || 0),
          Number(item.quantity || 1),
          item.size || 'M',
          item.color || '',
          item.image || ''
        ]
      );
    }

    await connection.commit();

    try {
      await sendOrderConfirmation({ orderNumber, customer, total });
    } catch (e) {
      console.log('Email error:', e.message);
    }

    res.status(201).json({
      success: true,
      data: {
        orderNumber,
        total,
        status: 'pending'
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });

  } finally {
    if (connection) connection.release();
  }
});

// ==========================
// GET ORDERS
// ==========================
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 50'
    );

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==========================
// UPDATE STATUS
// ==========================
router.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus } = req.body;

    await pool.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [orderStatus, req.params.id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ==========================
// MESSAGE CLIENT
// ==========================
router.post('/:id/message', async (req, res) => {
  try {
    const { message } = req.body;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    await sendCustomerMessage(orders[0], message);

    res.json({
      success: true,
      message: 'Sent'
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;