const Order = require('../models/order.model');
const FoodItem = require('../models/foodItem.model');
const mongoose = require('mongoose');
const { syncDailySalesForDate, formatDateStr, getDateBounds } = require('./sales.controller');

// Helper to check if any active order has passed its estimatedReadyTime, and mark it READY
const checkAndAdvanceOrders = async (filter = {}) => {
    try {
        const now = new Date();
        const overdueOrders = await Order.find({
            ...filter,
            status: { $in: ['PLACED', 'ACCEPTED', 'PREPARING'] },
            $nor: [
                {
                    paymentMethod: { $in: ['Online Payment', 'ONLINE'] },
                    paymentStatus: { $in: ['PENDING', 'FAILED'] },
                },
            ],
            estimatedReadyTime: { $lte: now },
        });

        for (const ord of overdueOrders) {
            ord.status = 'READY';
            ord.readyAt = ord.readyAt || now;
            await ord.save();
        }
    } catch (err) {
        console.error('Error auto-advancing overdue orders:', err);
    }
};

// Helper to format order for frontend responses with time tracking metadata
const formatOrderForClient = (order) => {
    const now = Date.now();
    const createdTime = new Date(order.createdAt).getTime();
    const estReadyTime = new Date(order.estimatedReadyTime).getTime();
    const totalPrepSeconds = Math.max(60, (order.avgPrepTimeMinutes || 5) * 60);

    const elapsedSeconds = Math.max(0, Math.floor((now - createdTime) / 1000));
    const remainingSeconds = Math.max(0, Math.floor((estReadyTime - now) / 1000));
    const remainingMinutes = Math.ceil(remainingSeconds / 60);

    const isReady = order.status === 'READY' || order.status === 'COMPLETED';
    const progressPercent = isReady
        ? 100
        : Math.min(95, Math.max(5, Math.round((elapsedSeconds / totalPrepSeconds) * 100)));

    return {
        id: order.orderNumber,
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.itemsSummary,
        itemsList: order.items,
        total: order.totalAmount,
        subtotal: order.subtotal,
        serviceFee: order.serviceFee,
        totalAmount: order.totalAmount,
        status: order.status,
        pickupLocation: order.pickupLocation,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        avgPrepTimeMinutes: order.avgPrepTimeMinutes,
        createdAt: order.createdAt,
        date: new Date(order.createdAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        estimatedReadyTime: order.estimatedReadyTime,
        readyAt: order.readyAt,
        timeRemainingMinutes: remainingMinutes,
        timeRemainingSeconds: remainingSeconds,
        elapsedSeconds,
        progressPercent,
        isReady,
        shouldAlert: order.status === 'READY' && !order.readyAlertDismissed,
    };
};

// POST /api/orders — Customer Checkout
const createOrder = async (req, res) => {
    try {
        const {
            items,
            pickupLocation,
            paymentMethod,
            customerName,
            customerEmail,
            notes,
        } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Please add items before placing an order.',
            });
        }

        // Validate items and calculate prep times
        const validatedItems = [];
        let subtotal = 0;
        let maxPrepMinutes = 0;

        for (const item of items) {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;

            // Fetch actual menu item from DB if available to ensure exact prep time according to menu item
            let itemPrep = Number(item.avgPrepTimeMinutes);
            const foodIdLookup = item.id || item.foodId;
            let foodDoc = null;

            if (foodIdLookup) {
                const num = Number(foodIdLookup);
                if (!isNaN(num)) {
                    foodDoc = await FoodItem.findOne({ foodId: num });
                }
                if (!foodDoc && mongoose.Types.ObjectId.isValid(foodIdLookup)) {
                    foodDoc = await FoodItem.findById(foodIdLookup);
                }
            }
            if (!foodDoc && item.name) {
                foodDoc = await FoodItem.findOne({ name: item.name });
            }

            if (foodDoc && typeof foodDoc.avgPrepTimeMinutes === 'number' && foodDoc.avgPrepTimeMinutes > 0) {
                itemPrep = foodDoc.avgPrepTimeMinutes;
            } else if (!itemPrep || isNaN(itemPrep) || itemPrep <= 0) {
                itemPrep = 5;
            }

            if (itemPrep > maxPrepMinutes) {
                maxPrepMinutes = itemPrep;
            }

            subtotal += price * qty;
            validatedItems.push({
                foodId: item.id || item.foodId,
                name: foodDoc?.name || item.name || 'Food Item',
                category: foodDoc?.category || item.category || 'General',
                price: foodDoc?.price != null ? foodDoc.price : price,
                quantity: qty,
                avgPrepTimeMinutes: itemPrep,
                image_url: item.image_url || item.imageUrl || '',
            });
        }

        maxPrepMinutes = Math.max(1, maxPrepMinutes);

        const serviceFee = 2.00;
        const totalAmount = Number((subtotal + serviceFee).toFixed(2));

        // Create summary string (e.g. "2x Vada Pav + 1x Masala Dosa")
        const itemsSummary = validatedItems
            .map((i) => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`)
            .join(' + ');

        // Generate human-friendly order number (e.g. #CH-1042)
        const orderCount = await Order.countDocuments();
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const orderNumber = `CH-${1000 + orderCount + 1}`;

        // Customer details: Authenticated user takes strict priority over req.body
        const user = req.user || null;
        const finalCustomerName =
            user?.username ||
            user?.name ||
            customerName ||
            'Campus Student';
        const finalCustomerEmail =
            user?.email ? user.email.toLowerCase().trim() : (customerEmail || 'student@campus.edu');

        // Calculate estimated meal prep completion time
        const now = new Date();
        const estimatedReadyTime = new Date(now.getTime() + maxPrepMinutes * 60 * 1000);

        const newOrder = await Order.create({
            orderNumber,
            user: user?._id || undefined,
            customerName: finalCustomerName,
            customerEmail: finalCustomerEmail,
            items: validatedItems,
            itemsSummary,
            subtotal,
            serviceFee,
            totalAmount,
            status: 'PLACED',
            pickupLocation: pickupLocation || 'Main Canteen',
            paymentMethod: paymentMethod || 'Online Payment',
            paymentStatus: 'SIMULATED',
            avgPrepTimeMinutes: maxPrepMinutes,
            estimatedReadyTime,
            notes: notes || '',
        });

        // Synchronize today's DailySales document in the background
        syncDailySalesForDate(formatDateStr(newOrder.createdAt)).catch((err) => {
            console.error('Error auto-syncing daily sales on order creation:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully! Kitchen has received your ticket.',
            order: formatOrderForClient(newOrder),
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
    }
};

// GET /api/orders/my-orders — Fetch active orders and history for strictly the logged-in customer
const getMyOrders = async (req, res) => {
    try {
        await checkAndAdvanceOrders();

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Strictly isolate orders to the authenticated customer
        const queryOr = [];
        if (req.user._id) {
            queryOr.push({ user: req.user._id });
        }
        if (req.user.email) {
            queryOr.push({ customerEmail: req.user.email.toLowerCase().trim() });
        }

        const filter = queryOr.length > 0 ? { $or: queryOr } : { _id: null };

        const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);

        const formatted = orders.map(formatOrderForClient);
        const activeOrders = formatted.filter((o) =>
            ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status) &&
            !(['Online Payment', 'ONLINE'].includes(o.paymentMethod) && ['PENDING', 'FAILED'].includes(o.paymentStatus))
        );
        const history = formatted.filter((o) =>
            ['COMPLETED', 'CANCELLED'].includes(o.status)
        );

        res.status(200).json({
            success: true,
            activeOrders,
            history,
            allOrders: formatted,
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your orders' });
    }
};

// GET /api/orders/:id — Track specific order live (with customer ownership check)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        let order = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id);
        }
        if (!order) {
            order = await Order.findOne({ orderNumber: id.trim() });
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Customer access control: customers can only view their own order
        if (
            req.user &&
            req.user.role !== 'admin' &&
            order.user &&
            order.user.toString() !== req.user._id.toString() &&
            order.customerEmail &&
            order.customerEmail.toLowerCase() !== req.user.email.toLowerCase()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied: You do not own this order' });
        }

        // Auto-advance if prep time has elapsed and still in kitchen
        const now = new Date();
        if (
            ['PLACED', 'ACCEPTED', 'PREPARING'].includes(order.status) &&
            now >= order.estimatedReadyTime
        ) {
            order.status = 'READY';
            order.readyAt = order.readyAt || now;
            await order.save();
        }

        res.status(200).json({
            success: true,
            order: formatOrderForClient(order),
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ success: false, message: 'Failed to track order' });
    }
};

// GET /api/orders — Vendor/Admin list orders + live canteen stats
const getAllOrders = async (req, res) => {
    try {
        await checkAndAdvanceOrders();

        const { status, search, date, scope } = req.query;
        const filter = {};

        if (status && status !== 'All' && status !== 'ALL') {
            filter.status = status.toUpperCase();
        }

        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { itemsSummary: { $regex: search, $options: 'i' } },
            ];
        }

        // Date bounds in Asia/Kolkata (Indian Standard Time)
        const todayBounds = getDateBounds('today');

        let activeBounds = null;
        if (date && date !== 'all' && date !== 'ALL') {
            activeBounds = getDateBounds(date);
        } else if (scope === 'today') {
            activeBounds = todayBounds;
        }

        if (activeBounds) {
            filter.createdAt = { $gte: activeBounds.start, $lte: activeBounds.end };
        }

        // Exclude unpaid pending/failed online payment checkout attempts so staff only sees confirmed orders
        filter.$nor = [
            {
                paymentMethod: { $in: ['Online Payment', 'ONLINE'] },
                paymentStatus: { $in: ['PENDING', 'FAILED'] },
            },
        ];

        const orders = await Order.find(filter).sort({ createdAt: -1 });

        // Calculate stats strictly for the selected date window (defaulting to today's IST bounds)
        const statsBounds = (activeBounds && scope !== 'today' && date !== 'today') ? activeBounds : todayBounds;

        const statsOrders = await Order.find({
            createdAt: { $gte: statsBounds.start, $lte: statsBounds.end },
            $nor: [
                {
                    paymentMethod: { $in: ['Online Payment', 'ONLINE'] },
                    paymentStatus: { $in: ['PENDING', 'FAILED'] },
                },
            ],
        });

        const stats = {
            todayOrdersCount: statsOrders.length,
            pendingCount: statsOrders.filter((o) =>
                ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status)
            ).length,
            readyCount: statsOrders.filter((o) => o.status === 'READY').length,
            completedCount: statsOrders.filter((o) => o.status === 'COMPLETED').length,
            todayRevenue: statsOrders
                .filter((o) => o.status !== 'CANCELLED')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        };

        res.status(200).json({
            success: true,
            stats,
            todayOrdersCount: statsOrders.length,
            orders: orders.map(formatOrderForClient),
        });
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vendor orders' });
    }
};

// PATCH /api/orders/:id/status — Vendor updates order status (e.g. mark READY)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        let order = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id);
        }
        if (!order) {
            order = await Order.findOne({ orderNumber: id.trim() });
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const normalizedStatus = status.toUpperCase();
        order.status = normalizedStatus;

        if (normalizedStatus === 'READY') {
            order.readyAt = new Date();
            order.readyAlertDismissed = false; // Reset so user receives ready alert
        } else if (normalizedStatus === 'COMPLETED') {
            order.readyAt = order.readyAt || new Date();
        }

        await order.save();

        // Synchronize DailySales document for order's date
        syncDailySalesForDate(formatDateStr(order.createdAt)).catch((err) => {
            console.error('Error auto-syncing daily sales on status update:', err);
        });

        res.status(200).json({
            success: true,
            message: `Order status updated to ${normalizedStatus}`,
            order: formatOrderForClient(order),
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

// PATCH /api/orders/:id/dismiss-alert — Customer acknowledges ready alert
const dismissReadyAlert = async (req, res) => {
    try {
        const { id } = req.params;

        let order = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id);
        }
        if (!order) {
            order = await Order.findOne({ orderNumber: id.trim() });
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.readyAlertDismissed = true;
        await order.save();

        // Synchronize DailySales document for order's date
        syncDailySalesForDate(formatDateStr(order.createdAt)).catch((err) => {
            console.error('Error auto-syncing daily sales on status update:', err);
        });

        res.status(200).json({ success: true, message: 'Alert dismissed' });
    } catch (error) {
        console.error('Error dismissing alert:', error);
        res.status(500).json({ success: false, message: 'Failed to dismiss alert' });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    dismissReadyAlert,
    formatOrderForClient,
};
