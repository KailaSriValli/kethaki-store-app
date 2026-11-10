import express from 'express';
import pool from '../config/db.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. GET All Products (with optional search, category, material, pincode filters)
router.get('/', async (req, res) => {
  const { search, category, material, pincode } = req.query;
  try {
    let query = 'SELECT DISTINCT p.* FROM products p';
    const params = [];

    if (pincode) {
      query += `
        JOIN product_location_stock pls ON p.id = pls.product_id
        JOIN serviceable_locations sl ON pls.location_id = sl.id
        WHERE sl.pincode = ? AND pls.is_available = TRUE
      `;
      params.push(pincode);
    } else {
      query += ' WHERE 1=1';
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)';
      const likeTerm = `%${search}%`;
      params.push(likeTerm, likeTerm, likeTerm);
    }

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (material) {
      query += ' AND p.material = ?';
      params.push(material);
    }

    query += ' ORDER BY p.created_at DESC';
    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// 2. Check Location Availability by Pincode
router.get('/location/:pincode', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM serviceable_locations WHERE pincode = ?',
      [req.params.pincode]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        available: false,
        message: 'Delivery not yet available for this pincode. Try 502313, 502110, or 500043.',
      });
    }
    res.json({ available: true, location: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error checking location' });
  }
});

// 3. CREATE Single Product (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  const {
    name,
    category,
    material,
    purity,
    weight_grams,
    price,
    discount_price,
    available_sizes,
    stock_quantity,
    image_url,
    description,
    is_virtual_trial_enabled,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO products 
      (name, category, material, purity, weight_grams, price, discount_price, available_sizes, stock_quantity, image_url, description, is_virtual_trial_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category || 'Other',
        material || '1 Gram Gold',
        purity || 'Standard',
        weight_grams || 0,
        price,
        discount_price || price,
        available_sizes || 'Free Size',
        stock_quantity || 10,
        image_url,
        description || '',
        is_virtual_trial_enabled ?? true,
      ]
    );

    await pool.query(
      'INSERT IGNORE INTO product_location_stock (product_id, location_id, is_available) SELECT ?, id, TRUE FROM serviceable_locations',
      [result.insertId]
    );

    res.status(201).json({ id: result.insertId, message: 'Product added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

// 4. BULK CREATE Products (Admin Only)
router.post('/bulk', verifyAdmin, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Please provide a valid list of jewellery items.' });
  }

  try {
    const values = items.map((item) => [
      item.name,
      item.category || 'Other',
      item.material || '1 Gram Gold',
      item.purity || 'Standard',
      item.weight_grams || 0,
      item.price,
      item.discount_price || item.price,
      item.available_sizes || 'Free Size',
      item.stock_quantity || 10,
      item.image_url,
      item.description || '',
      item.is_virtual_trial_enabled ?? true,
    ]);

    await pool.query(
      `INSERT INTO products 
      (name, category, material, purity, weight_grams, price, discount_price, available_sizes, stock_quantity, image_url, description, is_virtual_trial_enabled)
      VALUES ?`,
      [values]
    );

    await pool.query(
      'INSERT IGNORE INTO product_location_stock (product_id, location_id, is_available) SELECT p.id, l.id, TRUE FROM products p CROSS JOIN serviceable_locations l'
    );

    res.status(201).json({ message: `Successfully added ${items.length} jewellery items!` });
  } catch (error) {
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
});

// 5. UPDATE Product (Admin Only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const {
    name,
    category,
    material,
    purity,
    weight_grams,
    price,
    discount_price,
    available_sizes,
    stock_quantity,
    image_url,
    description,
    is_virtual_trial_enabled,
  } = req.body;

  try {
    await pool.query(
      `UPDATE products SET 
      name=?, category=?, material=?, purity=?, weight_grams=?, price=?, discount_price=?, 
      available_sizes=?, stock_quantity=?, image_url=?, description=?, is_virtual_trial_enabled=?
      WHERE id=?`,
      [
        name,
        category,
        material,
        purity,
        weight_grams,
        price,
        discount_price || price,
        available_sizes,
        stock_quantity,
        image_url,
        description,
        is_virtual_trial_enabled ?? true,
        req.params.id,
      ]
    );
    res.json({ message: 'Product updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// 6. DELETE Product (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

export default router;