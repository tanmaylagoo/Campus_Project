# 🍽️ CanteenHub

CanteenHub is a full-stack canteen food ordering and management system designed to simplify food ordering for students/customers and provide canteen staff with an efficient way to manage orders, menus, and analytics.

The system provides separate experiences for **Customers** and **Canteen Staff/Admins**, with role-based authentication and dedicated dashboards.

---

## 🚀 Features

### 👤 Customer

- User registration and login
- Browse available food items
- View food item details, prices, and preparation time
- Add items to cart
- Place food orders
- Track order status
- View previous orders
- Customer dashboard
- AI chatbot/assistant integration

### 👨‍💼 Canteen Staff / Admin

- Admin registration and login
- Dedicated admin dashboard
- View current orders
- View customer/order information
- Update order status
- Add new menu items
- Remove menu items
- Update menu items
- Manage menu item availability
- View analytics and dashboard statistics

### 🔐 Authentication

- JWT-based authentication
- HTTP-only authentication cookies
- Role-based authorization
- Customer and Admin roles
- Protected routes
- Logout functionality
- Token blacklist on logout

### 📡 Real-Time Order Tracking

The project can use **Socket.IO** for real-time order status updates.

For example:

```text
Customer places order
↓
Admin receives order
↓
Admin changes status
↓
Customer receives live update
