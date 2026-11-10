import express from 'express';
import pool from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Place Order (Supports both Cart Checkout & Direct "Order Now")
router.post('/place', verifyToken, async (req, res) => {
  const { items, shipping_address, pincode, payment_method, clear_cart = true } = req.body;
  // items: [{ product_id, selected_size, quantity, price }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items selected for order.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    // Insert Order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, pincode, order_status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, totalAmount, shipping_address, pincode, 'Confirmed']
    );
    const orderId = orderResult.insertId;

    // Insert Order Items & Deduct Stock
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, selected_size, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.selected_size || 'Free Size', item.quantity, item.price]
      );
      await connection.query(
        'UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Generate Transaction Record
    const transactionRef = `TXN_KTH_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const paymentStatus = payment_method === 'Cash on Delivery' ? 'Pending' : 'Success';

    await connection.query(
      'INSERT INTO transactions (order_id, user_id, transaction_ref, payment_method, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, req.user.id, transactionRef, payment_method, totalAmount, paymentStatus]
    );

    // Clear Cart if ordered from Cart
    if (clear_cart) {
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    }

    await connection.commit();
    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      transactionRef,
      totalAmount,
      paymentStatus,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Order failed', error: error.message });
  } finally {
    connection.release();
  }
});

// 2. Get Customer Order History (with Items, Transaction & Return Status)
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, t.transaction_ref, t.payment_method, t.payment_status,
              r.id AS return_id, r.return_status, r.reason AS return_reason
       FROM orders o
       LEFT JOIN transactions t ON o.id = t.order_id
       LEFT JOIN returns r ON o.id = r.order_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.image_url, p.category 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order history', error: error.message });
  }
});

// 3. Get Customer Transaction History
router.get('/my-transactions', verifyToken, async (req, res) => {
  try {
    const [txns] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY paid_at DESC',
      [req.user.id]
    );
    res.json(txns);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// 4. Request Order Return
router.post('/return', verifyToken, async (req, res) => {
  const { order_id, reason, comments } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM returns WHERE order_id = ?', [order_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Return already requested for this order.' });
    }

    await pool.query(
      'INSERT INTO returns (order_id, user_id, reason, comments) VALUES (?, ?, ?, ?)',
      [order_id, req.user.id, reason, comments || '']
    );
    await pool.query("UPDATE orders SET order_status = 'Returned' WHERE id = ?", [order_id]);

    res.status(201).json({ message: 'Return request submitted! Our team will review it shortly.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit return request', error: error.message });
  }
});

// 5. ADMIN: Get All Orders & Returns
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.full_name, u.phone, t.transaction_ref, t.payment_method, t.payment_status,
              r.id AS return_id, r.return_status, r.reason AS return_reason
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN transactions t ON o.id = t.order_id
       LEFT JOIN returns r ON o.id = r.order_id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders' });
  }
});

// 6. ADMIN: Update Order Status or Return Status
router.put('/admin/status/:orderId', verifyAdmin, async (req, res) => {
  const { order_status, return_status } = req.body;
  try {
    if (order_status) {
      await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [
        order_status,
        req.params.orderId,
      ]);
    }
    if (return_status) {
      await pool.query('UPDATE returns SET return_status = ? WHERE order_id = ?', [
        return_status,
        req.params.orderId,
      ]);
      if (return_status === 'Refunded') {
        await pool.query("UPDATE transactions SET payment_status = 'Refunded' WHERE order_id = ?", [
          req.params.orderId,
        ]);
      }
    }
    res.json({ message: 'Status updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

export default router;