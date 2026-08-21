const express = require('express');
const { body } = require('express-validator');
const foodController = require('../controllers/food.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// =======================
// Food Menu Routes
// =======================
// Anyone logged in can view the menu
router.get('/items', protect, foodController.getAllFoodItems);

// Only workers can create/update food items
router.post(
    '/items',
    protect,
    authorize('worker'),
    [
        body('name').notEmpty().withMessage('Food name is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('category').isIn(['veg', 'non-veg', 'beverage', 'snack']).withMessage('Invalid category')
    ],
    foodController.createFoodItem
);

router.delete(
    '/items',
    protect,
    authorize('worker'),
    foodController.deleteFoodItem

)

router.patch('/items/:id', protect, authorize('worker'), foodController.updateFoodItem);

// =======================
// Order Routes
// =======================
// Students place orders (Workers theoretically could too if they use the app to eat)
router.post(
    '/orders',
    protect,
    [
        body('items').isArray({ min: 1 }).withMessage('Items array is required and cannot be empty')
    ],
    foodController.placeOrder
);

// Get orders (Logic inside controller restricts what students vs workers see)
router.get('/orders', protect, foodController.getOrders);

// Only workers update order statuses
router.patch('/orders/:id/status', protect, authorize('worker'), foodController.updateOrderStatus);

module.exports = router;