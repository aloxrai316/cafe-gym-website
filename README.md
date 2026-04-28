# FitBite - Cafe & Gym QR Ordering System

A QR-based cafe ordering system with a separate admin dashboard. Customers scan a single common QR code, select their table, and order — no login required.

## Quick Setup

```bash
# 1. Unzip and open in VS Code
unzip cafe-gym-website.zip
cd cafe-gym-website

# 2. Start backend (needs MongoDB running)
cd backend
npm install
node seeds/seed.js    # Seeds demo data
npm run dev           # Runs on :5000

# 3. Start frontend (new terminal)
cd frontend
npm install
npm start             # Runs on :3000
```

## Demo Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cafegym.com | admin123 |

## Features

### Customer Side (No Login Required)
- Scan single common QR code → opens menu in browser
- Select table number from 1-15
- Browse menu by category: **Food Items**, **Beverages**, **Coffee**, **Liquors**
- Add items to cart (max 20 per item)
- Place order linked to table
- Call waiter for assistance
- Submit food & service ratings
- Track order status

### Menu Items (Pre-seeded)
- **Food Items:** Momo, Chowmein, Fried Rice, Pizza, Burger
- **Beverages:** Coke, Dew, Fanta
- **Coffee:** Espresso, Americano, Latte, Cappuccino, Flat White, Mocha, Macchiato
- **Liquors:** Draft Beer, Whiskey, Vodka, Rum, Wine

### Admin Dashboard (Login Required)
- Daily sales calculation
- Daily customer count
- Total orders tracking
- Real-time incoming orders with table numbers (e.g., "Table 5 ordered: Momo, Coke")
- Waiter call management
- Menu item availability toggle (In Stock / Out of Stock)
- Customer reviews
- QR code generator for printing

## API Endpoints

### Public (No Auth)
- `GET /api/menu` - Get all menu items
- `POST /api/orders/guest` - Place guest order
- `GET /api/orders/table/:tableNumber` - Get orders by table
- `POST /api/waiter/call` - Call waiter
- `POST /api/reviews` - Submit review

### Admin (Auth Required)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/reports/sales` - Sales report
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/waiter/active` - Active waiter calls
- `PATCH /api/waiter/:id/resolve` - Resolve waiter call
- `PATCH /api/menu/:id/toggle` - Toggle item availability

## Tech Stack
- **Frontend:** React 18, React Router 6, react-icons, react-toastify, react-qr-code
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Architecture:** REST API, Mobile-first responsive design
