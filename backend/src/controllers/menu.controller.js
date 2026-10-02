const FoodItem = require('../models/foodItem.model');

// GET /api/menu — Fetch all menu items (public, used by customer + admin)
const getAllItems = async (req, res) => {
    try {
        const items = await FoodItem.find().sort({ foodId: 1 });

        // Map to the same shape the frontend expects
        const mapped = items.map((item) => ({
            id: item.foodId,
            _id: item._id,
            name: item.name,
            category: item.category,
            ingredients: item.ingredients,
            price: item.price,
            avgPrepTimeMinutes: item.avgPrepTimeMinutes,
            image_url: item.imageUrl,
            isAvailable: item.isAvailable,
        }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch menu items' });
    }
};

// POST /api/menu — Add a new menu item (admin only)
const addItem = async (req, res) => {
    try {
        const { name, category, ingredients, price, avgPrepTimeMinutes, imageUrl } = req.body;

        if (!name || !category || price == null) {
            return res.status(400).json({ success: false, message: 'name, category, and price are required' });
        }

        // Auto-increment foodId
        const lastItem = await FoodItem.findOne().sort({ foodId: -1 });
        const foodId = lastItem ? lastItem.foodId + 1 : 1;

        const newItem = await FoodItem.create({
            foodId,
            name: name.trim(),
            category: category.trim(),
            ingredients: ingredients || [],
            price: Number(price),
            avgPrepTimeMinutes: avgPrepTimeMinutes || 10,
            isAvailable: true,
            imageUrl: imageUrl || '',
        });

        res.status(201).json({
            success: true,
            message: 'Menu item added',
            item: {
                id: newItem.foodId,
                _id: newItem._id,
                name: newItem.name,
                category: newItem.category,
                ingredients: newItem.ingredients,
                price: newItem.price,
                avgPrepTimeMinutes: newItem.avgPrepTimeMinutes,
                image_url: newItem.imageUrl,
                isAvailable: newItem.isAvailable,
            },
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Item with this ID already exists' });
        }
        res.status(500).json({ success: false, message: 'Failed to add menu item' });
    }
};

// DELETE /api/menu/:id — Remove a menu item by foodId (admin only)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await FoodItem.findOneAndDelete({ foodId: Number(id) });

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        res.status(200).json({ success: true, message: 'Menu item removed' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, message: 'Failed to delete menu item' });
    }
};

// PATCH /api/menu/:id/availability — Toggle availability (admin only)
const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await FoodItem.findOne({ foodId: Number(id) });

        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        item.isAvailable = !item.isAvailable;
        await item.save();

        res.status(200).json({
            success: true,
            message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`,
            isAvailable: item.isAvailable,
        });
    } catch (error) {
        console.error('Error toggling availability:', error);
        res.status(500).json({ success: false, message: 'Failed to update availability' });
    }
};

// PUT /api/menu/:id — Update a menu item (admin only)
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, ingredients, price, avgPrepTimeMinutes, imageUrl } = req.body;

        const item = await FoodItem.findOne({ foodId: Number(id) });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        if (name) item.name = name.trim();
        if (category) item.category = category.trim();
        if (ingredients) item.ingredients = ingredients;
        if (price != null) item.price = Number(price);
        if (avgPrepTimeMinutes != null) item.avgPrepTimeMinutes = Number(avgPrepTimeMinutes);
        if (imageUrl !== undefined) item.imageUrl = imageUrl;

        await item.save();

        res.status(200).json({
            success: true,
            message: 'Menu item updated',
            item: {
                id: item.foodId,
                _id: item._id,
                name: item.name,
                category: item.category,
                ingredients: item.ingredients,
                price: item.price,
                avgPrepTimeMinutes: item.avgPrepTimeMinutes,
                image_url: item.imageUrl,
                isAvailable: item.isAvailable,
            },
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ success: false, message: 'Failed to update menu item' });
    }
};

module.exports = {
    getAllItems,
    addItem,
    deleteItem,
    toggleAvailability,
    updateItem,
};
