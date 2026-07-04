const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const DELIVERY_PILOTS = [
  { id: 1, name: 'Vikram Rathore', phone: '+91 98765 43210', rating: 4.9, avatar: 'VR', vehicle: 'Rocket Bike #21' },
  { id: 2, name: 'Ananya Deshmukh', phone: '+91 87654 32109', rating: 4.7, avatar: 'AD', vehicle: 'Rocket Bike #07' },
  { id: 3, name: 'Farhan Sheikh', phone: '+91 76543 21098', rating: 4.8, avatar: 'FS', vehicle: 'Rocket Van #14' }
];
const ORDER_STATUSES = ['Launch Confirmed', 'Preparing Payload', 'Packed', 'In Transit', 'Delivered'];

function generateOrderId() { return 'RD' + Date.now().toString().slice(-6); }

// POST /api/orders (place order)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, address, couponCode } = req.body;
    if (!items || !items.length || !address) return res.status(400).json({ message: 'Items and address are required' });

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percent' ? Math.round(subtotal * coupon.discount / 100) : coupon.discount;
        appliedCoupon = coupon;
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { used: 1 } });
      }
    }

    const deliveryFee = subtotal > 500 ? 0 : 30;
    const total = subtotal - discount + deliveryFee;
    const pilot = DELIVERY_PILOTS[Math.floor(Math.random() * DELIVERY_PILOTS.length)];

    const order = await Order.create({
      orderId: generateOrderId(),
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      items,
      subtotal,
      discount,
      deliveryFee,
      total,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      pilot,
      address,
      status: 'Launch Confirmed',
      statusIndex: 0
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my
router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/rate
router.put('/:id/rate', requireAuth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findOneAndUpdate({ orderId: req.params.id, user: req.user._id }, { rating, review }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders (admin — all orders)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const newIndex = Math.min(order.statusIndex + 1, ORDER_STATUSES.length - 1);
    order.statusIndex = newIndex;
    order.status = ORDER_STATUSES[newIndex];
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
