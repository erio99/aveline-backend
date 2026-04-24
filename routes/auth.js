import express from 'express';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'aveline_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, token } });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ✅ EXPORT PAR DÉFAUT - CETTE LIGNE EST OBLIGATOIRE
export default router;
