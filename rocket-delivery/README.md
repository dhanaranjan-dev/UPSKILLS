# 🚀 Rocket Delivery

Rocket Delivery is a full-stack grocery delivery web app built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB. It lets users browse groceries, add items to a cart, place orders, apply coupon codes, and track deliveries. An admin dashboard is also included to manage products, orders, users, and coupons.

## Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript (Vanilla)

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB with Mongoose

---

# Project Structure

```text
rocket-delivery/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── catalog.js
│       ├── account.js
│       └── mission-control.js
│
└── backend/
    ├── server.js
    ├── seed.js
    ├── package.json
    ├── .env.example
    ├── config/
    ├── models/
    ├── routes/
    └── middleware/
```

---

# Getting Started

## Requirements

* Node.js (v16 or later)
* MongoDB (Local or Atlas)

---

## Backend

```bash
cd backend
npm install
```

Create a `.env` file from the example.

```bash
cp .env.example .env
```

Seed the database.

```bash
npm run seed
```

Start the server.

```bash
npm start
```

or

```bash
npm run dev
```

Backend URL:

```
http://localhost:5050
```

---

## Frontend

Go to the frontend folder.

```bash
cd frontend
```

Run a simple local server.

```bash
npx serve .
```

or

```bash
python -m http.server 3000
```

Open:

```
http://localhost:3000
```

If you deploy the backend somewhere else, update the API URL in `frontend/js/app.js`.

---

# Demo Login

### Admin

```
Email: admin@rocketdelivery.com
Password: admin123
```

### User

```
Email: priya@example.com
Password: user123
```

---

# Coupon Codes

| Code       | Offer   |
| ---------- | ------- |
| BLASTOFF10 | 10% off |
| ORBIT50    | ₹50 off |
| ROCKET20   | 20% off |

---

# Features

### User

* Register and login
* Browse grocery products
* Search and filter by category
* Add items to cart
* Update cart quantity
* Apply coupon codes
* Place orders
* Track order status
* Rate completed orders

### Admin

* View dashboard
* Manage orders
* Update delivery status
* View users
* Create and enable/disable coupons

---

# API Endpoints

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/api/auth/register`       | Register              |
| POST   | `/api/auth/login`          | Login                 |
| GET    | `/api/products`            | Get products          |
| GET    | `/api/products/categories` | Get categories        |
| POST   | `/api/orders`              | Place order           |
| GET    | `/api/orders/my`           | User orders           |
| GET    | `/api/orders/:id`          | Order details         |
| PUT    | `/api/orders/:id/rate`     | Rate order            |
| POST   | `/api/coupons/validate`    | Validate coupon       |
| GET    | `/api/orders`              | All orders (Admin)    |
| PUT    | `/api/orders/:id/status`   | Update order status   |
| GET    | `/api/coupons`             | Get coupons (Admin)   |
| POST   | `/api/coupons`             | Create coupon         |
| PUT    | `/api/coupons/:id/toggle`  | Enable/Disable coupon |
| GET    | `/api/admin/users`         | Get users             |
| GET    | `/api/admin/stats`         | Dashboard statistics  |

---

