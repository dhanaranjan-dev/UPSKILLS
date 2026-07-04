const express = require('express');
const router = express.Router();
const Astronaut = require('../models/User');
const Order = require('../models/Order');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await Astronaut.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Astronaut.countDocuments({ role: 'user' });
    const revenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
    const totalRevenue = revenueResult[0]?.total || 0;
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    res.json({ totalOrders, totalCustomers, totalRevenue, deliveredOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
