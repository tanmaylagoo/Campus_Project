const express = require('express');
const router = express.Router();
const {
    getAllItems,
    getItemById,
    addItem,
    deleteItem,
    toggleAvailability,
    updateItem,
} = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Authenticated users — fetch all menu items
router.get('/', protect, getAllItems);

// Authenticated users — fetch a single menu item by id
router.get('/:id', protect, getItemById);

// Admin only — add a new item
router.post('/', protect, authorize('admin'), addItem);

// Admin only — update an item
router.put('/:id', protect, authorize('admin'), updateItem);

// Admin only — toggle availability
router.patch('/:id/availability', protect, authorize('admin'), toggleAvailability);

// Admin only — delete an item
router.delete('/:id', protect, authorize('admin'), deleteItem);

module.exports = router;
