# 🚀 Rocket Delivery – Full Stack Grocery Delivery App

A full-stack grocery delivery web application built with:
- **Frontend**: HTML, CSS, JavaScript (Vanilla) — dark "mission control" sidebar theme with an orange/teal rocket brand
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)

This is a fully-featured, independently designed sibling of a grocery delivery app — same core feature set, entirely different visual design, layout, component structure, and code organization.

---

## 📁 Project Structure

```
rocket-delivery/
├── frontend/
│   ├── index.html              # Sidebar + topbar + bottom-nav shell
│   ├── css/
│   │   └── style.css           # All styles (rocket/space theme)
│   └── js/
│       ├── app.js              # State, API helper, sidebar/topbar/routing
│       ├── catalog.js          # Home & Shop pages, product cards
│       ├── account.js          # Cart, Auth, Orders, Tracking, Ratings
│       └── mission-control.js  # Admin panel ("Mission Control")
│
└── backend/
    ├── server.js
    ├── seed.js
    ├── .env.example
    ├── package.json
    ├── config/db.js
    ├── models/{User,Product,Order,Coupon}.js
    ├── routes/{auth,products,orders,coupons,admin}.js
    └── middleware/auth.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # adjust values if needed
npm run seed            # seed products, coupons & demo accounts
npm start                # or: npm run dev (auto-reload)
```
Server runs at `http://localhost:5050`

### 2. Frontend Setup
No build step needed — just serve the static folder:
```bash
cd frontend
npx serve .
# or
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.

> The frontend calls the API at `http://localhost:5050/api` (see `API_ROOT` in `frontend/js/app.js`). Update this if you deploy the backend elsewhere.

---

## 🔑 Demo Accounts

| Role  | Email                        | Password  |
|-------|-------------------------------|-----------|
| Admin | admin@rocketdelivery.com      | admin123  |
| User  | priya@example.com             | user123   |

## 🎟️ Demo Promo Codes

| Code        | Discount | Min Order |
|-------------|----------|-----------|
| BLASTOFF10  | 10% off  | ₹100      |
| ORBIT50     | ₹50 off  | ₹300      |
| ROCKET20    | 20% off  | ₹250      |

---

## ✨ Features

- **Crew accounts** — Register, Login, JWT sessions
- **Product catalog** — 30 products across 10 categories, search & category filters
- **Cargo Bay (cart)** — Add, adjust quantity with steppers, remove items
- **Promo codes** — Apply codes at checkout, with smart "nearly eligible" suggestions
- **Checkout wizard** — Two-step flow: delivery coordinates → review & confirm
- **Live order tracking** — Horizontal animated rocket progress tracker with delivery pilot info
- **Order rating** — Star rating + review after delivery
- **Mission Control (Admin panel)**
  - Dashboard with revenue/orders/crew/delivered stats
  - Manage all orders + advance mission status
  - Crew roster (all users)
  - Create/toggle promo codes
  - Delivery pilot fleet stats

---

## 🌐 API Endpoints

| Method | Path                       | Description             | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | /api/auth/register          | Register user            | Public   |
| POST   | /api/auth/login             | Login                    | Public   |
| GET    | /api/products                | List products             | Public   |
| GET    | /api/products/categories     | List categories           | Public   |
| POST   | /api/orders                 | Place order               | User     |
| GET    | /api/orders/my               | My orders                 | User     |
| GET    | /api/orders/:id               | Order details              | User     |
| PUT    | /api/orders/:id/rate           | Rate order                 | User     |
| POST   | /api/coupons/validate         | Validate promo code          | User     |
| GET    | /api/orders                 | All orders                | Admin    |
| PUT    | /api/orders/:id/status         | Advance order status         | Admin    |
| GET    | /api/coupons                 | All promo codes             | Admin    |
| POST   | /api/coupons                 | Create promo code             | Admin    |
| PUT    | /api/coupons/:id/toggle        | Toggle promo code             | Admin    |
| GET    | /api/admin/users              | All users                  | Admin    |
| GET    | /api/admin/stats              | Dashboard stats               | Admin    |
