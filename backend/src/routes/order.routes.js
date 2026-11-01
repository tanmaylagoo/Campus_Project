const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    dismissReadyAlert,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer & Admin — Checkout / Place Order
router.post('/', protect, authorize('customer', 'admin'), createOrder);

// Customer — Get current customer's active orders and history
router.get('/my-orders', protect, getMyOrders);

// Admin only — Get all orders & live stats for canteen staff
router.get('/', protect, authorize('admin'), getAllOrders);

// Customer & Admin — Get single order tracking details
router.get('/:id', protect, getOrderById);

// Admin only — Update order status (e.g. advance or set to READY)
router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);

// Customer & Admin — Acknowledge and dismiss ready alert
router.patch('/:id/dismiss-alert', protect, dismissReadyAlert);

module.exports = router;


