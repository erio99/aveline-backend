import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Pool MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aveline',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AVELINE API running' });
});

// ============================================
// PRODUCTS
// ============================================
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const products = rows.map(row => ({
      ...row,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : (row.sizes || [])
    }));
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false });
    const product = {
      ...rows[0],
      images: typeof rows[0].images === 'string' ? JSON.parse(rows[0].images) : rows[0].images,
      sizes: typeof rows[0].sizes === 'string' ? JSON.parse(rows[0].sizes) : rows[0].sizes
    };
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ============================================
// PROMOTIONS
// ============================================
app.get('/api/promotions/active', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promotions WHERE is_active=1 AND start_date<=NOW() AND end_date>=NOW() LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ============================================
// AUTH
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email=? AND password=?', [email, password]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    const user = users[0];
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, token: 'token_' + user.id } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ============================================
// ORDERS
// ============================================
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, subtotal, discount, shipping, total } = req.body;
    const orderNumber = 'AV-' + Date.now().toString().slice(-8);
    const [result] = await pool.query(
      'INSERT INTO orders (order_number, first_name, last_name, email, phone, address, city, postal_code, country, subtotal, discount, shipping, total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [orderNumber, customer.firstName, customer.lastName, customer.email, customer.phone, customer.address, customer.city, customer.postalCode, customer.country||'Maroc', subtotal, discount||0, shipping||0, total]
    );
    res.status(201).json({ success: true, data: { orderNumber, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Serveur sur le port ' + PORT);
});
