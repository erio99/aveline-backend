import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, color, minPrice, maxPrice, sort, featured } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
    if (color && color !== 'all') { query += ' AND color = ?'; params.push(color); }
    if (featured === 'true') { query += ' AND featured = TRUE'; }
    if (minPrice) { query += ' AND price >= ?'; params.push(Number(minPrice)); }
    if (maxPrice) { query += ' AND price <= ?'; params.push(Number(maxPrice)); }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(query, params);
    
    const products = rows.map(row => ({
      ...row,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : (row.sizes || [])
    }));
    
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('❌ Erreur products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    const product = {
      ...rows[0],
      images: typeof rows[0].images === 'string' ? JSON.parse(rows[0].images) : (rows[0].images || []),
      sizes: typeof rows[0].sizes === 'string' ? JSON.parse(rows[0].sizes) : (rows[0].sizes || [])
    };
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
