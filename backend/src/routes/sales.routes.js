const express = require('express');
const router = express.Router();
const {
    getTodaySales,
    getSalesHistory,
    getSalesByDate,
    syncDailySalesForDate,
    formatDateStr,
} = require('../controllers/sales.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/sales/today — Admin/Vendor dashboard today's metrics
router.get('/today', protect, authorize('admin'), getTodaySales);

// GET /api/sales/history — Daily sales records of other days
router.get('/history', protect, authorize('admin'), getSalesHistory);

// GET /api/sales/date/:date — Detailed sales and orders for a specific day (YYYY-MM-DD)
router.get('/date/:date', protect, authorize('admin'), getSalesByDate);

// POST /api/sales/sync — Sync a specific date or today
router.post('/sync', protect, authorize('admin'), async (req, res) => {
    try {
        const dateStr = req.body?.date || formatDateStr();
        const record = await syncDailySalesForDate(dateStr);
        res.status(200).json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Sync failed' });
    }
});

module.exports = router;

