const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/coupons (admin — full list)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/coupons/suggestions?subtotal=XXX
router.get('/suggestions', requireAuth, async (req, res) => {
  try {
    const subtotal = parseFloat(req.query.subtotal) || 0;
    const activeCoupons = await Coupon.find({ active: true }).sort({ minOrder: 1 });

    const applicable = [];
    const nearlyEligible = [];

    for (const c of activeCoupons) {
      const savingAmount = c.type === 'percent'
        ? Math.round(subtotal * c.discount / 100)
        : c.discount;

      if (subtotal >= c.minOrder) {
        applicable.push({
          code: c.code,
          discount: c.discount,
          type: c.type,
          minOrder: c.minOrder,
          savingAmount,
          label: c.type === 'percent' ? `${c.discount}% off` : `₹${c.discount} off`
        });
      } else {
        const amountNeeded = c.minOrder - subtotal;
        if (amountNeeded <= 200) {
          nearlyEligible.push({
            code: c.code,
            discount: c.discount,
            type: c.type,
            minOrder: c.minOrder,
            amountNeeded: Math.round(amountNeeded),
            label: c.type === 'percent' ? `${c.discount}% off` : `₹${c.discount} off`
          });
        }
      }
    }

    res.json({ applicable, nearlyEligible });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons/validate
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired promo code' });
    if (subtotal < coupon.minOrder) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, discount, type, minOrder } = req.body;
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Promo code already exists' });
    const coupon = await Coupon.create({ code, discount, type, minOrder });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/coupons/:id/toggle (admin)
router.put('/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Promo code not found' });
    coupon.active = !coupon.active;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
