require('dotenv').config();
const connectDB = require('./config/db');
const Astronaut = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const mongoose = require('mongoose');

const products = [
  { name: "Fresh Red Apples", category: "Fruits", price: 130, originalPrice: 160, image: "🍎", unit: "1 kg", stock: 55, description: "Crisp, juicy apples picked at peak freshness.", tag: "Popular" },
  { name: "Robusta Bananas", category: "Fruits", price: 55, originalPrice: 75, image: "🍌", unit: "Dozen", stock: 45, description: "Naturally ripened, sweet Robusta bananas." },
  { name: "Nagpur Oranges", category: "Fruits", price: 95, originalPrice: 115, image: "🍊", unit: "1 kg", stock: 38, description: "Juicy oranges packed with Vitamin C." },
  { name: "Alphonso Mango", category: "Fruits", price: 220, originalPrice: 260, image: "🥭", unit: "1 kg", stock: 22, description: "The king of mangoes — sweet and fragrant.", tag: "Seasonal" },
  { name: "Seedless Watermelon", category: "Fruits", price: 55, originalPrice: 70, image: "🍉", unit: "Per piece", stock: 18, description: "Chilled, refreshing seedless watermelon." },
  { name: "Green Grapes", category: "Fruits", price: 85, originalPrice: 100, image: "🍇", unit: "500g", stock: 30, description: "Sweet seedless green grapes." },
  { name: "Farm Tomatoes", category: "Vegetables", price: 38, originalPrice: 50, image: "🍅", unit: "500g", stock: 65, description: "Vine-ripened farm-fresh tomatoes." },
  { name: "Red Onions", category: "Vegetables", price: 32, originalPrice: 45, image: "🧅", unit: "1 kg", stock: 85, description: "Pungent, flavourful red onions." },
  { name: "Potatoes", category: "Vegetables", price: 34, originalPrice: 48, image: "🥔", unit: "1 kg", stock: 95, description: "Clean, sorted farm potatoes." },
  { name: "Organic Broccoli", category: "Vegetables", price: 85, originalPrice: 105, image: "🥦", unit: "500g", stock: 28, description: "Nutrient-packed organic broccoli.", tag: "Organic" },
  { name: "Carrots", category: "Vegetables", price: 42, originalPrice: 55, image: "🥕", unit: "500g", stock: 50, description: "Sweet and crunchy farm carrots." },
  { name: "Bell Peppers Mix", category: "Vegetables", price: 90, originalPrice: 110, image: "🫑", unit: "500g", stock: 32, description: "Colourful mix of red, yellow & green peppers." },
  { name: "Toned Milk", category: "Dairy", price: 60, originalPrice: 68, image: "🥛", unit: "1 Litre", stock: 110, description: "Pasteurised toned milk, delivered chilled." },
  { name: "Fresh Paneer", category: "Dairy", price: 125, originalPrice: 145, image: "🧀", unit: "200g", stock: 40, description: "Soft, home-style cottage cheese." },
  { name: "Salted Butter", category: "Dairy", price: 58, originalPrice: 68, image: "🧈", unit: "100g", stock: 60, description: "Creamy salted table butter." },
  { name: "Greek Yogurt", category: "Dairy", price: 95, originalPrice: 115, image: "🍦", unit: "400g", stock: 42, description: "Thick, protein-rich Greek yogurt.", tag: "Popular" },
  { name: "Whole Wheat Bread", category: "Bakery", price: 48, originalPrice: 58, image: "🍞", unit: "400g", stock: 70, description: "Soft, freshly baked whole wheat loaf." },
  { name: "Butter Croissants", category: "Bakery", price: 130, originalPrice: 150, image: "🥐", unit: "4 pcs", stock: 26, description: "Buttery, flaky croissants baked daily." },
  { name: "Chocolate Muffins", category: "Bakery", price: 110, originalPrice: 130, image: "🧁", unit: "4 pcs", stock: 20, description: "Rich chocolate chip muffins." },
  { name: "Basmati Rice", category: "Grains", price: 190, originalPrice: 220, image: "🌾", unit: "1 kg", stock: 80, description: "Long-grain, aromatic Basmati rice." },
  { name: "Toor Dal", category: "Grains", price: 145, originalPrice: 165, image: "🫘", unit: "500g", stock: 75, description: "Clean, sorted yellow toor dal." },
  { name: "Rolled Oats", category: "Grains", price: 160, originalPrice: 190, image: "🥣", unit: "500g", stock: 45, description: "Wholesome rolled oats for breakfast.", tag: "Healthy" },
  { name: "Chicken Breast", category: "Meat", price: 295, originalPrice: 330, image: "🍗", unit: "500g", stock: 24, description: "Boneless, skinless chicken breast." },
  { name: "Farm Eggs (12)", category: "Eggs", price: 95, originalPrice: 110, image: "🥚", unit: "12 pcs", stock: 85, description: "Farm-fresh brown eggs, rich in protein." },
  { name: "Mango Juice", category: "Beverages", price: 80, originalPrice: 95, image: "🧃", unit: "1 Litre", stock: 58, description: "100% natural mango juice, no added sugar." },
  { name: "Himalayan Green Tea", category: "Beverages", price: 155, originalPrice: 185, image: "🍵", unit: "25 bags", stock: 48, description: "Organic green tea from the Himalayas." },
  { name: "Cold Brew Coffee", category: "Beverages", price: 175, originalPrice: 205, image: "☕", unit: "500ml", stock: 34, description: "Smooth, low-acid cold brew coffee.", tag: "New" },
  { name: "Extra Virgin Olive Oil", category: "Pantry", price: 460, originalPrice: 530, image: "🫒", unit: "500ml", stock: 28, description: "Cold-pressed extra virgin olive oil." },
  { name: "Forest Honey", category: "Pantry", price: 290, originalPrice: 340, image: "🍯", unit: "500g", stock: 38, description: "Pure, unprocessed forest honey." },
  { name: "Mixed Nuts Jar", category: "Snacks", price: 340, originalPrice: 390, image: "🥜", unit: "400g", stock: 30, description: "Roasted almonds, cashews & walnuts.", tag: "Popular" }
];

const coupons = [
  { code: 'BLASTOFF10', discount: 10, type: 'percent', minOrder: 100, used: 0, active: true },
  { code: 'ORBIT50', discount: 50, type: 'flat', minOrder: 300, used: 4, active: true },
  { code: 'ROCKET20', discount: 20, type: 'percent', minOrder: 250, used: 2, active: true }
];

async function seed() {
  await connectDB();
  await Astronaut.deleteMany();
  await Product.deleteMany();
  await Coupon.deleteMany();

  await Astronaut.create({ name: 'Mission Admin', email: 'admin@rocketdelivery.com', password: 'admin123', role: 'admin', phone: '+91 99999 00000' });
  await Astronaut.create({ name: 'Priya Sharma', email: 'priya@example.com', password: 'user123', role: 'user', phone: '+91 98765 11111' });
  await Astronaut.create({ name: 'Rahul Singh', email: 'rahul@example.com', password: 'user123', role: 'user', phone: '+91 87654 22222' });

  await Product.insertMany(products);
  await Coupon.insertMany(coupons);

  console.log('🚀 Rocket Delivery database seeded successfully!');
  console.log('Admin login: admin@rocketdelivery.com / admin123');
  console.log('User login:  priya@example.com / user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
