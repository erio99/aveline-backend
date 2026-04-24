import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import promotionRoutes from './routes/promotions.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check AVANT les autres routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AVELINE API running' });
});

// ✅ Routes API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/promotions', promotionRoutes);

// ✅ Route racine
app.get('/', (req, res) => {
  res.json({ message: 'AVELINE API', docs: '/api/health' });
});

// Port Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
});
