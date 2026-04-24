import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import promotionRoutes from './routes/promotions.js';

dotenv.config();

// Test MySQL (non bloquant)
testConnection();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/promotions', promotionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'AVELINE API is running'
  });
});

// 404 API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Port Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});