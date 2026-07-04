const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  image: String,
  unit: String,
  price: Number,
  qty: Number
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userEmail: String,
  userPhone: String,
  items: [orderItemSchema],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 30 },
  total: Number,
  coupon: { type: String, default: null },
  pilot: {
    id: Number,
    name: String,
    phone: String,
    rating: Number,
    avatar: String,
    vehicle: String
  },
  address: { type: String, required: true },
  status: { type: String, enum: ['Launch Confirmed', 'Preparing Payload', 'Packed', 'In Transit', 'Delivered'], default: 'Launch Confirmed' },
  statusIndex: { type: Number, default: 0 },
  rating: { type: Number, default: null },
  review: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
