import express from 'express';
import cors from 'cors';
import './config/db.js'; // Ensure DB connects

import authRoutes from './modules/auth/auth.routes.js';
import companyRoutes from './modules/company/company.routes.js';
import productRoutes from './modules/products/product.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import requestRoutes from './modules/gift-request/request.routes.js';
import userRoutes from './modules/users/user.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import supportRoutes from './modules/support/support.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  if (process.env.ENABLE_LOGGING === 'true') {
    const start = Date.now();
    console.log(`\n[>>> REQUEST] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length) console.log('Body:', JSON.stringify(req.body, null, 2));

    const oldJson = res.json;
    res.json = function (body) {
      console.log(`[<<< RESPONSE] ${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`);
      console.log('Body:', JSON.stringify(body, null, 2));
      return oldJson.call(this, body);
    };
  }
  next();
});

// API Endpoints
app.use('/auth', authRoutes);
app.use('/companies', companyRoutes);
app.use('/products', productRoutes);
app.use('/events', eventRoutes);
app.use('/cart', cartRoutes);
app.use('/gift-requests', requestRoutes);
app.use('/users', userRoutes);
app.use('/support', supportRoutes);

// Error Middleware (Standard)
app.use((err, req, res, next) => {
  console.error('[!!! ERROR]', err);
  res.status(500).json({ message: err.message });
});

export default app;