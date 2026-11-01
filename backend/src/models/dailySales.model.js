const mongoose = require('mongoose');

const itemBreakdownSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    quantity: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
}, { _id: false });

const categoryBreakdownSchema = new mongoose.Schema({
    category: { type: String, required: true },
    count: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
}, { _id: false });

const dailySalesSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true,
        index: true,
    },
    dateTimestamp: {
        type: Date,
        required: true,
        index: true,
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    completedOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    cancelledOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    pendingOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
        min: 0,
    },
    averageOrderValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    categoryBreakdown: [categoryBreakdownSchema],
    topSellingItems: [itemBreakdownSchema],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('DailySales', dailySalesSchema);

