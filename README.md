# 🍽️ Campus CanteenHub — Smart Campus Food Ordering & Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://campus-project-kappa.vercel.app/)
[![Backend API](https://img.shields.io/badge/API%20Status-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://campus-project-a88j.onrender.com/)
[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://campus-project-kappa.vercel.app/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay%20Test%20Mode-0C2340?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75C4?style=for-the-badge&logo=googlebard&logoColor=white)](https://ai.google.dev/)

> 🚀 **Live Application URL**: [https://campus-project-kappa.vercel.app/](https://campus-project-kappa.vercel.app/)  
> 🔗 **Production Backend API**: [https://campus-project-a88j.onrender.com/](https://campus-project-a88j.onrender.com/)

---

## 📌 Overview

**Campus CanteenHub** is a production-ready, full-stack dining automation platform engineered to streamline university dining hall operations. It connects college students directly with cafeteria kitchen staff to eliminate physical queues, automate meal preparation countdowns, enable dual payment methods (Physical Counter & Online Test Mode), provide AI-driven dietary meal recommendations, and offer real-time kitchen operations tracking with daily sales analytics.

---

## ✨ Key Features

### 👤 Student / Customer Experience
- **Interactive Menu Catalog**: Browse categorized dishes (South Indian, Street Food, Chinese, Beverages, Snacks) with dietary indicators (Veg/Non-Veg), spice levels, and prices.
- **Smart Cart System**: Persistent shopping cart with real-time subtotal, fixed campus facility fee (₹2.00), and quantity adjustments.
- **Intelligent Parallel Prep Time Calculation**: Prep time when ordering multiple items is dynamically computed using parallel station cooking logic ($\max(\text{prep times})$) rather than an unrealistic linear sum.
- **Live Meal Prep Tracking**: Visual countdown with animated progress bar showing elapsed prep window and automatic "Meal is Ready for Pickup!" alerts.
- **Single Pickup Counter**: Fixed, clear pickup designated at **Main Canteen**.
- **Dual Payment Flexibility**:
  - **Pay at Counter**: 100% offline-ready cash/counter ticket dispatch.
  - **Online Payment**: Integrated Razorpay Test Mode checkout supporting Cards, Netbanking, and Wallets with cryptographic server-side HMAC SHA256 signature verification.
- **Strict Account Isolation**: Customer order histories and active tickets are securely isolated by verified JWT token identity—preventing cross-customer data leakage.
- **AI-Powered Campus Canteen Chatbot**: Integrated Google Gemini 1.5/2.0 dining assistant with smart fallback handling for illness/stomach upset, fasting/vrat diets, gym/calorie tracking, and rush-hour fast meals (<10 mins).

### 👨‍🍳 Canteen Staff & Admin Portal
- **Live Kitchen Operations Dashboard**: Real-time kitchen queue tracking (Pending vs. In-Prep vs. Ready vs. Completed tickets).
- **Status Advancement Controls**: Staff can advance orders across their lifecycle: `PLACED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`.
- **Menu Management (CRUD)**: Add new dishes, edit pricing, adjust preparation windows, delete items, and toggle live stock availability (`isAvailable`).
- **Daily Sales Analytics**: Automated aggregation of total revenue, Average Order Value (AOV), best-selling menu items, and category revenue distribution.

### 🔒 Security & Architecture
- **JWT Authentication & Role-Based Access Control (RBAC)**: Secure separation between `customer` and `admin` roles.
- **Route Protection**: Client-side route guards (`ProtectedRoute`, `PublicOnlyRoute`) paired with server-side middleware (`protect`, `authorize`).
- **Stateful Token Blacklisting**: Server-side token invalidation on logout backed by MongoDB's native Time-To-Live (`TTL`) auto-expiring index.
- **IDOR Protection**: Backend ownership assertions prevent customers from accessing other users' order tickets.
- **SPA Refresh Routing**: Dedicated Vercel rewrite configuration (`vercel.json`) eliminating 404 errors on direct page reloads.

---

## 🛠️ Tech Stack & Concepts

| Layer | Technologies & Libraries | Key Concepts Utilized |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Axios | React Context API, Custom Hooks (`useCart`), React Router v6 Nested Routes & Route Guards, Controlled Forms, Dynamic Script Injection |
| **Backend** | Node.js, Express.js | RESTful APIs, Middleware chaining (`protect`, `authorize`), Crypto HMAC SHA256, Cookie Parser, Static Asset Serving |
| **Database** | MongoDB Atlas, Mongoose ODM | Schema Validation, Subdocuments (`orderItemSchema`), Relational References (`ObjectId`), TTL Indexes (`expireAfterSeconds`), Aggregation Pipelines |
| **Payments** | Razorpay Node SDK & Checkout.js | Test Mode Gateway, Order Pre-creation in Paise, Server-Side Cryptographic Signature Verification |
| **Artificial Intelligence** | Google Gemini API (`@google/genai`) | System Prompt Engineering with live MongoDB menu injection, Rule-Based Fallback Engine |
| **DevOps & Hosting** | Vercel (Frontend), Render (Backend), Git | SPA Rewrites (`/(.*)` $\rightarrow$ `/index.html`), Environment Variable Injection, CORS with Credentials |

---

## 📐 Parallel Meal Prep Time Model

When multiple items are added to an order, preparation happens simultaneously across kitchen stations:

$$\text{Estimated Order Prep Time} = \max_{i \in \text{Items}} (\text{Item Prep Time}_i)$$

- **Example**: An order with **Schezwan Rice (12m)** and **Hakka Noodles (10m)** estimates a total prep window of $\max(12, 10) = 12 \text{ minutes}$.
- **Live Progress Formula**:
  $$\text{Progress \%} = \min\left(95, \max\left(5, \left\lfloor\frac{\text{Elapsed Seconds}}{\text{Total Prep Seconds}} \times 100\right\rfloor\right)\right)$$
  *(Automatically locks at $100\%$ and triggers a pickup alert when status reaches `READY`)*.

---

## 📁 Repository Structure

```text
Campus_Project/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & env setup
│   │   ├── controllers/     # Business logic (auth, menu, order, payment, sales, chatbot)
│   │   ├── middleware/      # JWT auth, role authorization, error handling
│   │   ├── models/          # Mongoose models (User, FoodItem, Order, DailySales, Blacklist)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Auxiliary background routines
│   │   ├── imgs/            # Localized static menu assets
│   │   ├── app.js           # Express app & CORS configuration
│   │   └── server.js        # Server listener
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/              # Static web assets
│   ├── src/
│   │   ├── assets/          # Icons & UI media
│   │   ├── components/      # Layouts, Sidebar, ProtectedRoute, TrackingModal, ReadyAlertModal
│   │   ├── context/         # CartContext (State, Cart Math, Order Polling)
│   │   ├── pages/           # Customer pages (Landing, Login, Register, Home, Menu, Cart, Checkout, Orders, Chatbot)
│   │   │   └── admin/       # Staff pages (AdminDashboard, AdminOrders, AdminMenu, AdminAnalytics)
│   │   ├── App.jsx          # Route hierarchy & providers
│   │   └── main.jsx         # React root entry
│   ├── vercel.json          # SPA rewrite configuration
│   ├── vite.config.js       # Vite bundler configuration
│   └── package.json
├── vercel.json              # Root SPA rewrite configuration for Vercel
├── PROJECT_DOCUMENTATION.md # In-depth technical architecture documentation
└── README.md                # Project documentation & overview
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection URI)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/tanmaylagoo/Campus_Project.git
cd Campus_Project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Razorpay Test Mode Credentials (Optional for local testing)
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

# Google Gemini API Key (Optional for chatbot AI)
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:
```bash
npm run dev
# or: node server.js
```
The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📡 Core API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer or admin user | Public |
| `POST` | `/api/auth/login` | Login user & issue JWT token | Public |
| `POST` | `/api/auth/logout` | Invalidate token & store in blacklist | Yes |
| `GET` | `/api/menu` | Fetch active menu items (with category filters) | Public |
| `POST` | `/api/menu` | Create a new menu item | Admin only |
| `PUT` | `/api/menu/:id` | Update pricing, prep time, or availability | Admin only |
| `DELETE`| `/api/menu/:id` | Remove a menu item | Admin only |
| `GET` | `/api/orders/my-orders`| Fetch isolated active orders and history for current customer | Customer / Admin |
| `POST` | `/api/orders` | Place order (Pay at Counter / Cash) | Customer / Admin |
| `GET` | `/api/orders/:id` | Live tracking status for specific order ticket | Owner or Admin |
| `POST` | `/api/payment/create-order` | Create server-validated Razorpay order (Paise) | Customer / Admin |
| `POST` | `/api/payment/verify-payment` | Verify HMAC SHA256 payment signature & dispatch ticket | Customer / Admin |
| `GET` | `/api/orders/admin/all` | Fetch kitchen order queue for today | Admin only |
| `PATCH`| `/api/orders/:id/status`| Update order status (`PLACED` $\rightarrow$ `COMPLETED`) | Admin only |
| `POST` | `/api/chatbot/ask` | Send question to AI dining assistant | Customer / Admin |
| `GET` | `/api/sales/today` | Fetch daily sales, revenue KPIs, and AOV metrics | Admin only |

---

## ☁️ Deployment Guide

### Deploy Backend on Render
1. Create a **New Web Service** connected to your GitHub repository.
2. Set Root Directory to `backend`.
3. Set **Build Command** to: `npm install`
4. Set **Start Command** to: `node server.js`
5. Under **Environment Variables**, add:
   - `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=5000`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `GEMINI_API_KEY`
   - `FRONTEND_URL=https://campus-project-kappa.vercel.app`

### Deploy Frontend on Vercel
1. Import the repository in Vercel.
2. Set Root Directory to `frontend`.
3. Framework Preset: **Vite**.
4. Set **Build Command** to: `npm run build`
5. Set **Output Directory** to: `dist`
6. Under **Environment Variables**, add:
   - `VITE_API_URL=https://campus-project-a88j.onrender.com/api`
7. Ensure [`vercel.json`](file:///c:/Campus_Project/vercel.json) rewrite rule is present to allow direct URL refreshing without 404s.

---

## 📄 License & Credits

Developed with ❤️ for campus dining automation. Built using the MERN stack with modern full-stack best practices.
