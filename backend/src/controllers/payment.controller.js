const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const FoodItem = require('../models/foodItem.model');
const { syncDailySalesForDate, formatDateStr } = require('./sales.controller');
const { formatOrderForClient } = require('./order.controller');

// Helper to initialize Razorpay SDK with test credentials
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.RAZOR_API_KEY;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZOR_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('Razorpay API keys are not configured in environment variables.');
    }

    return {
        instance: new Razorpay({ key_id, key_secret }),
        key_id,
        key_secret,
    };
};

// Timing-safe HMAC SHA256 signature verification
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
    try {
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        const expectedBuffer = Buffer.from(generatedSignature, 'utf8');
        const receivedBuffer = Buffer.from(signature, 'utf8');

        if (expectedBuffer.length !== receivedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch (err) {
        console.error('Signature verification error:', err);
        return false;
    }
};

/**
 * POST /api/payment/create-order
 * Initiates Razorpay Order for Online Payment Checkout
 * Securely calculates amounts from DB FoodItem collection (never trusts frontend amounts)
 */
const createRazorpayOrder = async (req, res) => {
    try {
        const {
            items,
            pickupLocation,
            customerName,
            customerEmail,
            notes,
            existingOrderNumber,
        } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Please add items before initiating payment.',
            });
        }

        // Validate items and calculate secure subtotal using database prices
        const validatedItems = [];
        let subtotal = 0;
        let maxPrepMinutes = 0;

        for (const item of items) {
            const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
            let foodDoc = null;

            const foodIdLookup = item.id || item.foodId;
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

            // Secure price from database; fallback to item.price only if item not found in DB
            const unitPrice = foodDoc && typeof foodDoc.price === 'number'
                ? foodDoc.price
                : Number(item.price) || 0;

            let itemPrep = foodDoc && typeof foodDoc.avgPrepTimeMinutes === 'number' && foodDoc.avgPrepTimeMinutes > 0
                ? foodDoc.avgPrepTimeMinutes
                : Number(item.avgPrepTimeMinutes) || 5;

            if (itemPrep > maxPrepMinutes) {
                maxPrepMinutes = itemPrep;
            }

            subtotal += unitPrice * qty;
            validatedItems.push({
                foodId: foodDoc?.foodId || item.id || item.foodId,
                name: foodDoc?.name || item.name || 'Food Item',
                category: foodDoc?.category || item.category || 'General',
                price: unitPrice,
                quantity: qty,
                avgPrepTimeMinutes: itemPrep,
                image_url: item.image_url || item.imageUrl || '',
            });
        }

        maxPrepMinutes = Math.max(1, maxPrepMinutes);
        const serviceFee = 2.00;
        const totalAmount = Number((subtotal + serviceFee).toFixed(2));
        const amountInPaise = Math.round(totalAmount * 100);

        if (amountInPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Order total must be greater than zero.',
            });
        }

        const user = req.user || null;
        const finalCustomerName =
            user?.username ||
            user?.name ||
            customerName ||
            'Campus Student';
        const finalCustomerEmail =
            user?.email ? user.email.toLowerCase().trim() : (customerEmail || 'student@campus.edu');

        const itemsSummary = validatedItems
            .map((i) => `${i.quantity > 1 ? `${i.quantity}x ` : ''}${i.name}`)
            .join(' + ');

        // Check if retrying for an existing pending order to avoid duplicates
        let order = null;
        if (existingOrderNumber) {
            order = await Order.findOne({
                orderNumber: existingOrderNumber,
                paymentStatus: { $in: ['PENDING', 'FAILED'] },
            });
        }

        const now = new Date();
        const estimatedReadyTime = new Date(now.getTime() + maxPrepMinutes * 60 * 1000);

        if (!order) {
            const orderCount = await Order.countDocuments();
            const orderNumber = `CH-${1000 + orderCount + 1}`;

            order = await Order.create({
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
                paymentMethod: 'Online Payment',
                paymentStatus: 'PENDING',
                avgPrepTimeMinutes: maxPrepMinutes,
                estimatedReadyTime,
                notes: notes || '',
            });
        } else {
            // Update existing order with refreshed cart items & amount
            order.items = validatedItems;
            order.itemsSummary = itemsSummary;
            order.subtotal = subtotal;
            order.serviceFee = serviceFee;
            order.totalAmount = totalAmount;
            order.pickupLocation = pickupLocation || order.pickupLocation;
            order.notes = notes || order.notes;
            order.paymentStatus = 'PENDING';
            order.avgPrepTimeMinutes = maxPrepMinutes;
            order.estimatedReadyTime = estimatedReadyTime;
            await order.save();
        }

        // Initialize Razorpay
        const { instance: razorpay, key_id } = getRazorpayInstance();

        // Create Razorpay Order
        const rzpOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
                canteenOrderId: order._id.toString(),
                orderNumber: order.orderNumber,
                customerEmail: finalCustomerEmail,
            },
        });

        // Associate Razorpay order ID with our order record
        order.razorpayOrderId = rzpOrder.id;
        await order.save();

        res.status(200).json({
            success: true,
            keyId: key_id,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount, // in paise
            currency: rzpOrder.currency,
            orderId: order._id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            customer: {
                name: finalCustomerName,
                email: finalCustomerEmail,
            },
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initialize Razorpay payment. Please try again.',
        });
    }
};

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and fetches captured status
 */
const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderNumber,
        } = req.body || {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required Razorpay payment verification parameters.',
            });
        }

        // Find corresponding order in our database
        let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order && orderNumber) {
            order = await Order.findOne({ orderNumber });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No corresponding order record found for this Razorpay order ID.',
            });
        }

        // Idempotency: If already verified and marked as PAID, return immediately
        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({
                success: true,
                message: 'Payment has already been verified and processed.',
                order: formatOrderForClient(order),
            });
        }

        // Check user ownership if authenticated
        if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to verify this payment.',
            });
        }

        const { instance: razorpay, key_secret } = getRazorpayInstance();

        // 1. Timing-safe cryptographic HMAC SHA256 signature verification
        const isValidSignature = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            key_secret
        );

        if (!isValidSignature) {
            order.paymentStatus = 'FAILED';
            await order.save();
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature. Payment verification rejected.',
            });
        }

        // 2. Fetch payment details from Razorpay to verify server-side state
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

        if (!paymentDetails) {
            order.paymentStatus = 'FAILED';
            await order.save();
            return res.status(400).json({
                success: false,
                message: 'Failed to retrieve payment details from Razorpay.',
            });
        }

        // 3. Verify Razorpay Order ID matches
        if (paymentDetails.order_id !== razorpay_order_id) {
            order.paymentStatus = 'FAILED';
            await order.save();
            return res.status(400).json({
                success: false,
                message: 'Payment order ID mismatch.',
            });
        }

        // 4. Verify Currency
        if (paymentDetails.currency !== 'INR') {
            order.paymentStatus = 'FAILED';
            await order.save();
            return res.status(400).json({
                success: false,
                message: 'Currency mismatch. Expected INR.',
            });
        }

        // 5. Verify Amount
        const expectedAmountPaise = Math.round(order.totalAmount * 100);
        if (paymentDetails.amount !== expectedAmountPaise) {
            order.paymentStatus = 'FAILED';
            await order.save();
            return res.status(400).json({
                success: false,
                message: `Payment amount mismatch: expected ${expectedAmountPaise} paise, received ${paymentDetails.amount} paise.`,
            });
        }

        // 6. Verify or execute capture
        let paymentStatus = paymentDetails.status;
        if (paymentStatus === 'authorized') {
            try {
                const captureResult = await razorpay.payments.capture(
                    razorpay_payment_id,
                    expectedAmountPaise,
                    'INR'
                );
                paymentStatus = captureResult.status;
            } catch (captureErr) {
                console.error('Error auto-capturing authorized payment:', captureErr);
            }
        }

        if (paymentStatus !== 'captured') {
            order.paymentStatus = 'PENDING';
            await order.save();
            return res.status(400).json({
                success: false,
                message: `Payment is not captured. Current status: ${paymentStatus}.`,
            });
        }

        // 7. Success: Mark order as PAID and active for kitchen preparation
        const now = new Date();
        const prepMinutes = order.avgPrepTimeMinutes || 5;

        order.paymentStatus = 'PAID';
        order.paymentMethod = 'Online Payment';
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = 'PLACED';
        order.estimatedReadyTime = new Date(now.getTime() + prepMinutes * 60 * 1000);
        order.readyAlertDismissed = false;

        await order.save();

        // 8. Auto-sync daily sales
        syncDailySalesForDate(formatDateStr(order.createdAt)).catch((err) => {
            console.error('Error auto-syncing daily sales on payment verification:', err);
        });

        res.status(200).json({
            success: true,
            message: 'Online payment verified successfully! Kitchen has received your ticket.',
            order: formatOrderForClient(order),
        });
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed due to internal server error.',
        });
    }
};

/**
 * POST /api/payment/cancel
 * Handles customer dismissal/cancellation of Checkout modal safely
 */
const cancelRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, orderNumber } = req.body || {};

        let order = null;
        if (razorpay_order_id) {
            order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        }
        if (!order && orderNumber) {
            order = await Order.findOne({ orderNumber });
        }

        if (order && order.paymentStatus !== 'PAID') {
            // Keep status as PENDING so they can retry without duplicates
            order.paymentStatus = 'PENDING';
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: 'Checkout closed. You may retry payment when ready.',
        });
    } catch (error) {
        console.error('Error handling checkout cancellation:', error);
        res.status(500).json({ success: false, message: 'Internal error' });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    cancelRazorpayPayment,
};

