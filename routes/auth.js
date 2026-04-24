const express = require('express');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// ==============================
// LOGIN
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==============================
// ME
// ==============================
router.get('/me', adminAuth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;