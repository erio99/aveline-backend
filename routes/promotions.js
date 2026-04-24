import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM promotions 
       WHERE is_active = TRUE 
       AND start_date <= NOW() 
       AND end_date >= NOW() 
       ORDER BY discount_percent DESC 
       LIMIT 1`
    );

    // ✅ Toujours JSON
    res.json({ success: true, data: rows.length > 0 ? rows[0] : null });
  } catch (error) {
    console.error('❌ Erreur promotions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;