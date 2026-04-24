import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (req.query.category && req.query.category !== 'all') {
      query += ' AND category = ?';
      params.push(req.query.category);
    }
    if (req.query.color && req.query.color !== 'all') {
      query += ' AND color = ?';
      params.push(req.query.color);
    }
    if (req.query.featured === 'true') {
      query += ' AND featured = TRUE';
    }
    if (req.query.minPrice) {
      query += ' AND price >= ?';
      params.push(Number(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(req.query.maxPrice));
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    const products = rows.map(row => ({
      ...row,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes
    }));

    // ✅ Toujours retourner du JSON
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('❌ Erreur products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const product = {
      ...rows[0],
      images: typeof rows[0].images === 'string' ? JSON.parse(rows[0].images) : rows[0].images,
      sizes: typeof rows[0].sizes === 'string' ? JSON.parse(rows[0].sizes) : rows[0].sizes
    };

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;