const { validationResult } = require('express-validator');
const FoodItem = require('../models/foodItem.model');
const Order = require('../models/order.model');

// ==========================================
// FOOD ITEM CONTROLLERS (Menu Management)
// ==========================================

const createFoodItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, description, price, category, isAvailable, imageUrl } = req.body;

        const foodItem = await FoodItem.create({
            name,
            description,
            price,
            category,
            isAvailable,
            imageUrl
        });

        res.status(201).json({
            success: true,
            message: 'Food item created successfully',
            data: foodItem
        });
    } catch (error) {
        next(error);
    }
};

const getAllFoodItems = async (req, res, next) => {
    try {
        // Find all available items. If worker, maybe they want to see unavailable too, 
        // but for now let's just return everything and let frontend filter.
        const filter = req.query.available === 'true' ? { isAvailable: true } : {};
        
        const foodItems = await FoodItem.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: foodItems.length,
            data: foodItems
        });
    } catch (error) {
        next(error);
    }
};

const updateFoodItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const foodItem = await FoodItem.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!foodItem) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Food item updated',
            data: foodItem
        });
    } catch (error) {
        next(error);
    }
};


const deleteFoodItem = async(req, res, next)=>{

    try {
        const {id} = req.params
        const foodItem = await FoodItem.findByIdAndDelete(id);
        if(!foodItem){
            return res.status(400).json({
                success:false,
                message:'Food Item not found!',

            })
        }
        else{
            return res.status(200).json({
                success:true,
                message:'Food Item Deleted Successfully!'
            })
        }
        
    } catch (error) {
        next(error);
        
    }
}

// ==========================================
// ORDER CONTROLLERS
// ==========================================

const placeOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { items } = req.body; // Expecting array of { foodItem (id), quantity }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate items and calculate price
        for (const item of items) {
            const food = await FoodItem.findById(item.foodItem);
            if (!food) {
                return res.status(404).json({ success: false, message: `Food item not found: ${item.foodItem}` });
            }
            if (!food.isAvailable) {
                return res.status(400).json({ success: false, message: `${food.name} is currently unavailable` });
            }

            const itemTotal = food.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                foodItem: food._id,
                quantity: item.quantity,
                price: food.price
            });
        }

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

const getOrders = async (req, res, next) => {
    try {
        let filter = {};
        
        // If user is a student, only show their orders. 
        // If worker, show all orders (or filter by status via query)
        if (req.user.role === 'student') {
            filter.user = req.user._id;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const orders = await Order.find(filter)
            .populate('user', 'username email')
            .populate('items.foodItem', 'name price category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            id, 
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'username email').populate('items.foodItem', 'name');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Note: We will add Socket.IO event emission here in Phase 5 to notify the student!

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// Exporting everything at the end as requested
module.exports = {
    createFoodItem,
    getAllFoodItems,
    updateFoodItem,
    deleteFoodItem,
    placeOrder,
    getOrders,
    updateOrderStatus
};