import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { full_name, email, phone, password, address, pincode, role } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email is already registered. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, email, phone, password_hash, address, pincode, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, phone, hashedPassword, address || '', pincode || '502313', role || 'customer']
    );

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'No account found with this email. Click "Create one" first.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'kethaki_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        pincode: user.pincode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

export default router;