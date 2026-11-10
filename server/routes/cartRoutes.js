import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get User's Cart Items
router.get('/', verifyToken, async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id AS cart_item_id, c.selected_size, c.quantity, 
              p.id AS product_id, p.name, p.category, p.material, p.price, p.discount_price, p.image_url, p.stock_quantity
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.added_at DESC`,
      [req.user.id]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load cart', error: error.message });
  }
});

// 2. Add Item to Cart (or increment if same product & size exists)
router.post('/add', verifyToken, async (req, res) => {
  const { product_id, selected_size = 'Free Size', quantity = 1 } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND selected_size = ?',
      [req.user.id, product_id, selected_size]
    );

    if (existing.length > 0) {
      await pool.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [
        quantity,
        existing[0].id,
      ]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, selected_size, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, selected_size, quantity]
      );
    }
    res.status(201).json({ message: 'Added to cart!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
});

// 3. Update Cart Item Quantity
router.put('/:cartItemId', verifyToken, async (req, res) => {
  const { quantity } = req.body;
  try {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [
        req.params.cartItemId,
        req.user.id,
      ]);
      return res.json({ message: 'Item removed from cart' });
    }
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [
      quantity,
      req.params.cartItemId,
      req.user.id,
    ]);
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// 4. Remove Single Item from Cart
router.delete('/:cartItemId', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [
      req.params.cartItemId,
      req.user.id,
    ]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

export default router;