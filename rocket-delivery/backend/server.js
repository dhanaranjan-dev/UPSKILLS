require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: '🚀 Rocket Delivery API is live and orbiting' }));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Rocket Delivery server launched on http://localhost:${PORT}`));
