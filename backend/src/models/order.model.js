const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.Mixed,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        default: 'General',
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    avgPrepTimeMinutes: {
        type: Number,
        default: 5,
    },
    image_url: {
        type: String,
        default: '',
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    customerName: {
        type: String,
        default: 'Student Eater',
        trim: true,
    },
    customerEmail: {
        type: String,
        default: '',
        trim: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [v => Array.isArray(v) && v.length > 0, 'Order must contain at least one item'],
    },
    itemsSummary: {
        type: String,
        default: '',
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    serviceFee: {
        type: Number,
        default: 1.50,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
        default: 'PLACED',
    },
    pickupLocation: {
        type: String,
        default: 'Main Canteen',
    },
    paymentMethod: {
        type: String,
        default: 'Online Payment',
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'SIMULATED'],
        default: 'PENDING',
    },
    razorpayOrderId: {
        type: String,
        default: null,
    },
    razorpayPaymentId: {
        type: String,
        default: null,
    },
    razorpaySignature: {
        type: String,
        default: null,
    },
    avgPrepTimeMinutes: {
        type: Number,
        default: 5,
    },
    estimatedReadyTime: {
        type: Date,
        required: true,
    },
    readyAt: {
        type: Date,
        default: null,
    },
    readyAlertSent: {
        type: Boolean,
        default: false,
    },
    readyAlertDismissed: {
        type: Boolean,
        default: false,
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

// Index for fast queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
