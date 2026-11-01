const express = require('express');
const router = express.Router();
const {
    createRazorpayOrder,
    verifyRazorpayPayment,
    cancelRazorpayPayment,
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer & Admin — Create Razorpay Order for Online Payment
router.post('/create-order', protect, authorize('customer', 'admin'), createRazorpayOrder);

// Customer & Admin — Verify Razorpay Payment Signature and Capture
router.post('/verify', protect, authorize('customer', 'admin'), verifyRazorpayPayment);

// Customer & Admin — Record Checkout Modal Cancellation/Dismissal
router.post('/cancel', protect, cancelRazorpayPayment);

module.exports = router;

