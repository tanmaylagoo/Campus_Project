const express = require('express');
const router = express.Router();
const {
    getAllItems,
    addItem,
    deleteItem,
    toggleAvailability,
    updateItem,
} = require('../controllers/menu.controller');

// Public — fetch all menu items
router.get('/', getAllItems);

// Admin — add a new item
router.post('/', addItem);

// Admin — update an item
router.put('/:id', updateItem);

// Admin — toggle availability
router.patch('/:id/availability', toggleAvailability);

// Admin — delete an item
router.delete('/:id', deleteItem);

module.exports = router;