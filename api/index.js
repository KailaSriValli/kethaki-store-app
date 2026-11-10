import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import '../server/config/db.js';
import authRoutes from '../server/routes/authRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import cartRoutes from '../server/routes/cartRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import wishlistRoutes from '../server/routes/wishlistRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

export default app;