import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT w.id AS wishlist_id, p.*
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [req.user.id]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load wishlist' });
  }
});

router.post('/toggle', verifyToken, async (req, res) => {
  const { product_id } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlist WHERE id = ?', [existing[0].id]);
      return res.json({ wishlisted: false, message: 'Removed from wishlist' });
    } else {
      await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [
        req.user.id,
        product_id,
      ]);
      return res.status(201).json({ wishlisted: true, message: 'Saved to wishlist!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Wishlist update failed' });
  }
});

export default router;