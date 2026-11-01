const mongoose = require('mongoose');
const Order = require('../models/order.model');
const DailySales = require('../models/dailySales.model');

// Helper to get YYYY-MM-DD in Asia/Kolkata (Indian Standard Time)
const formatDateStr = (date = new Date()) => {
    return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// Helper to get start and end UTC Date objects for a YYYY-MM-DD string in Asia/Kolkata (+05:30)
const getDateBounds = (dateStr) => {
    let target = dateStr;
    if (!target || target === 'today') {
        target = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    } else if (target === 'yesterday') {
        const d = new Date();
        const localNow = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        localNow.setDate(localNow.getDate() - 1);
        const y = localNow.getFullYear();
        const m = String(localNow.getMonth() + 1).padStart(2, '0');
        const day = String(localNow.getDate()).padStart(2, '0');
        target = `${y}-${m}-${day}`;
    }

    const [y, m, d] = target.split('-').map(Number);
    const pad = (n) => String(n).padStart(2, '0');
    const dateFormatted = `${y}-${pad(m)}-${pad(d)}`;

    const start = new Date(`${dateFormatted}T00:00:00.000+05:30`);
    const end = new Date(`${dateFormatted}T23:59:59.999+05:30`);
    return { dateStr: dateFormatted, start, end };
};

// Synchronize / aggregate Order documents into a DailySales record for a specific date
const syncDailySalesForDate = async (dateStr) => {
    try {
        const { start, end } = getDateBounds(dateStr);
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
        }).sort({ createdAt: -1 });

        const totalOrders = orders.length;
        const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
        const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
        const pendingOrders = orders.filter((o) =>
            ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
        ).length;

        const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
        const totalRevenue = Number(
            validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)
        );

        const payingOrdersCount = validOrders.length;
        const averageOrderValue = payingOrdersCount > 0
            ? Number((totalRevenue / payingOrdersCount).toFixed(2))
            : 0;

        // Item breakdown
        const itemMap = {};
        const categoryMap = {};

        for (const ord of validOrders) {
            for (const itm of ord.items || []) {
                const name = itm.name || 'Unknown Item';
                const cat = itm.category || 'General';
                const qty = Number(itm.quantity) || 1;
                const rev = (Number(itm.price) || 0) * qty;

                if (!itemMap[name]) {
                    itemMap[name] = { name, category: cat, quantity: 0, revenue: 0 };
                }
                itemMap[name].quantity += qty;
                itemMap[name].revenue += rev;

                if (!categoryMap[cat]) {
                    categoryMap[cat] = { category: cat, count: 0, revenue: 0 };
                }
                categoryMap[cat].count += qty;
                categoryMap[cat].revenue += rev;
            }
        }

        const topSellingItems = Object.values(itemMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        const categoryBreakdown = Object.values(categoryMap)
            .sort((a, b) => b.revenue - a.revenue);

        const record = await DailySales.findOneAndUpdate(
            { date: dateStr },
            {
                date: dateStr,
                dateTimestamp: start,
                totalOrders,
                completedOrders,
                cancelledOrders,
                pendingOrders,
                totalRevenue,
                averageOrderValue,
                categoryBreakdown,
                topSellingItems,
                orders: orders.map((o) => o._id),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return record;
    } catch (err) {
        console.error(`Error syncing daily sales for ${dateStr}:`, err);
        return null;
    }
};

// Seed realistic historical data for past days if DB is sparse
const ensureHistoricalSeed = async () => {
    try {
        const existingCount = await DailySales.countDocuments();
        if (existingCount > 3) return; // Already has historical data

        console.log('Seeding historical sales data for vendor analytics...');
        const now = new Date();

        // Sample campus items for historical generation
        const sampleDishes = [
            { name: 'Vada Pav', category: 'Snacks', price: 22, prep: 5 },
            { name: 'Masala Dosa', category: 'Dosa', price: 68, prep: 10 },
            { name: 'Samosa Pav', category: 'Snacks', price: 22, prep: 5 },
            { name: 'Sada Dosa', category: 'Dosa', price: 47, prep: 8 },
            { name: 'Veg Hakka Noodles', category: 'Chinese', price: 97, prep: 12 },
            { name: 'Veg Fried Rice', category: 'Chinese', price: 100, prep: 12 },
            { name: 'Veg Cheese Sandwich', category: 'Sandwiches', price: 55, prep: 8 },
            { name: 'Masala Uttappa', category: 'Uttappam', price: 79, prep: 10 },
            { name: 'Chai', category: 'Beverages', price: 15, prep: 3 },
            { name: 'Filter Coffee', category: 'Beverages', price: 20, prep: 3 },
        ];

        const sampleNames = ['Rohan S.', 'Pooja K.', 'Amit P.', 'Neha M.', 'Varun T.', 'Sneha R.', 'Vikram S.', 'Aditi J.'];

        // Seed previous 7 days (day -7 to day -1)
        for (let i = 7; i >= 1; i--) {
            const pastDate = new Date();
            pastDate.setDate(now.getDate() - i);
            const dateStr = formatDateStr(pastDate);

            // Check if orders already exist for this date
            const { start, end } = getDateBounds(dateStr);
            const count = await Order.countDocuments({ createdAt: { $gte: start, $lte: end } });

            if (count === 0) {
                // Generate 8-18 realistic completed orders for this past day
                const ordersToCreate = Math.floor(10 + Math.random() * 10);
                const orderDocs = [];

                for (let j = 0; j < ordersToCreate; j++) {
                    const dish1 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
                    const dish2 = Math.random() > 0.4 ? sampleDishes[Math.floor(Math.random() * sampleDishes.length)] : null;
                    const qty1 = Math.floor(1 + Math.random() * 2);
                    const qty2 = dish2 ? Math.floor(1 + Math.random() * 2) : 0;

                    const items = [{
                        foodId: Math.floor(1 + Math.random() * 10),
                        name: dish1.name,
                        category: dish1.category,
                        price: dish1.price,
                        quantity: qty1,
                        avgPrepTimeMinutes: dish1.prep,
                    }];

                    let subtotal = dish1.price * qty1;
                    if (dish2) {
                        items.push({
                            foodId: Math.floor(1 + Math.random() * 10),
                            name: dish2.name,
                            category: dish2.category,
                            price: dish2.price,
                            quantity: qty2,
                            avgPrepTimeMinutes: dish2.prep,
                        });
                        subtotal += dish2.price * qty2;
                    }

                    const serviceFee = 2.00;
                    const totalAmount = Number((subtotal + serviceFee).toFixed(2));
                    const student = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                    const hour = Math.floor(9 + Math.random() * 10);
                    const minute = Math.floor(Math.random() * 59);

                    const orderTime = new Date(yearFrom(pastDate), monthFrom(pastDate), dayFrom(pastDate), hour, minute);

                    orderDocs.push({
                        orderNumber: `CH-HIST-${dateStr.replace(/-/g, '').slice(4)}-${j + 1}`,
                        customerName: student,
                        customerEmail: `${student.toLowerCase().replace(/[^a-z]/g, '')}@campus.edu`,
                        items,
                        itemsSummary: items.map(it => `${it.quantity > 1 ? `${it.quantity}x ` : ''}${it.name}`).join(' + '),
                        subtotal,
                        serviceFee,
                        totalAmount,
                        status: 'COMPLETED',
                        pickupLocation: 'Main Canteen',
                        paymentMethod: j % 2 === 0 ? 'Pay at Counter' : 'Online Payment',
                        paymentStatus: 'SIMULATED',
                        avgPrepTimeMinutes: Math.max(...items.map(it => it.avgPrepTimeMinutes)),
                        createdAt: orderTime,
                        updatedAt: orderTime,
                        estimatedReadyTime: new Date(orderTime.getTime() + 10 * 60 * 1000),
                        readyAt: new Date(orderTime.getTime() + 8 * 60 * 1000),
                    });
                }

                await Order.insertMany(orderDocs);
                await syncDailySalesForDate(dateStr);
            }
        }
    } catch (err) {
        console.error('Error seeding historical sales:', err);
    }
};

function yearFrom(d) { return d.getFullYear(); }
function monthFrom(d) { return d.getMonth(); }
function dayFrom(d) { return d.getDate(); }

// GET /api/sales/today — Vendor dashboard current day metrics
const getTodaySales = async (req, res) => {
    try {
        const todayStr = formatDateStr();
        const { start, end } = getDateBounds(todayStr);

        // Fetch live orders for today
        const todayOrders = await Order.find({
            createdAt: { $gte: start, $lte: end },
        }).sort({ createdAt: -1 });

        const totalOrders = todayOrders.length;
        const pendingCount = todayOrders.filter((o) =>
            ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status)
        ).length;
        const readyCount = todayOrders.filter((o) => o.status === 'READY').length;
        const completedCount = todayOrders.filter((o) => o.status === 'COMPLETED').length;
        const cancelledCount = todayOrders.filter((o) => o.status === 'CANCELLED').length;

        const todayRevenue = todayOrders
            .filter((o) => o.status !== 'CANCELLED')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Also sync DailySales document
        const syncedRecord = await syncDailySalesForDate(todayStr);

        res.status(200).json({
            success: true,
            date: todayStr,
            stats: {
                todayOrdersCount: totalOrders,
                pendingCount,
                readyCount,
                completedCount,
                cancelledCount,
                todayRevenue: Number(todayRevenue.toFixed(2)),
                averageOrderValue: totalOrders > 0
                    ? Number((todayRevenue / (totalOrders - cancelledCount || 1)).toFixed(2))
                    : 0,
            },
            record: syncedRecord,
            orders: todayOrders,
        });
    } catch (error) {
        console.error('Error fetching today sales:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch today sales' });
    }
};

// GET /api/sales/history — List daily sales records of other days
const getSalesHistory = async (req, res) => {
    try {
        await ensureHistoricalSeed();

        const days = Math.min(60, Math.max(1, Number(req.query.days) || 14));
        const todayStr = formatDateStr();

        // Ensure today is synced
        await syncDailySalesForDate(todayStr);

        // Fetch daily sales records sorted newest first
        const records = await DailySales.find({})
            .sort({ date: -1 })
            .limit(days);

        // Compute overall totals across the history window
        const totalRevenue = records.reduce((s, r) => s + (r.totalRevenue || 0), 0);
        const totalOrders = records.reduce((s, r) => s + (r.totalOrders || 0), 0);
        const totalCompleted = records.reduce((s, r) => s + (r.completedOrders || 0), 0);
        const avgDailyRevenue = records.length > 0
            ? Number((totalRevenue / records.length).toFixed(2))
            : 0;

        res.status(200).json({
            success: true,
            summary: {
                totalDays: records.length,
                totalRevenue: Number(totalRevenue.toFixed(2)),
                totalOrders,
                totalCompleted,
                avgDailyRevenue,
            },
            history: records,
        });
    } catch (error) {
        console.error('Error fetching sales history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sales history' });
    }
};

// GET /api/sales/date/:date — Detailed sales and order data for a specific date (YYYY-MM-DD)
const getSalesByDate = async (req, res) => {
    try {
        const targetDate = req.params.date || formatDateStr();

        // Validate YYYY-MM-DD pattern
        if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Expected YYYY-MM-DD.',
            });
        }

        // Sync and get DailySales record
        const record = await syncDailySalesForDate(targetDate);

        // Fetch actual orders for that date
        const { start, end } = getDateBounds(targetDate);
        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            date: targetDate,
            record: record || {
                date: targetDate,
                totalOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                categoryBreakdown: [],
                topSellingItems: [],
            },
            orders,
        });
    } catch (error) {
        console.error('Error fetching sales by date:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sales for date' });
    }
};

module.exports = {
    formatDateStr,
    getDateBounds,
    syncDailySalesForDate,
    getTodaySales,
    getSalesHistory,
    getSalesByDate,
};

