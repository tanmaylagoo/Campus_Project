const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const FoodItem = require('../models/foodItem.model');

const IMGS_DIR = path.join(__dirname, '..', 'imgs');

// Explicit alias map for known items in src/imgs
const KNOWN_IMAGE_ALIASES = {
    'vada pav': 'vada_pav.JPG',
    'samosa pav': 'samosa_pav.jpg',
    'masala dosa': 'masala_dosa.jpg',
    'sada dosa': 'sada_dosa.jpg',
    'masala uttappa': 'masala_utttapa.jpg',
    'masala uttapam': 'masala_utttapa.jpg',
    'veg cheese sandwich': 'cheese_sandwich.jpg',
    'cheese sandwich': 'cheese_sandwich.jpg',
    'veg fried rice': 'veg_fried_rice.jpg',
    'fried rice': 'veg_fried_rice.jpg',
    'schezwan rice': 'veg_schezwan_rice.jpg',
    'veg schezwan rice': 'veg_schezwan_rice.jpg',
    'hakka noodles': 'hakka_noodles.jpg',
    'veg manchurian': 'veg_manchurian.jpg',
    'manchurian': 'veg_manchurian.jpg',
};

// Check if an image exists in backend/src/imgs for a food item
const getFoodItemImage = (item) => {
    if (!item || !item.name) return null;
    const itemName = String(item.name).trim().toLowerCase();

    const getBaseUrl = () =>
        process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    // 1. Check known explicit alias
    if (KNOWN_IMAGE_ALIASES[itemName]) {
        const file = KNOWN_IMAGE_ALIASES[itemName];
        if (fs.existsSync(path.join(IMGS_DIR, file))) {
            return `${getBaseUrl()}/imgs/${file}`;
        }
    }

    // 2. Scan directory dynamically for matches (by foodId, slug, or normalized name)
    try {
        if (fs.existsSync(IMGS_DIR)) {
            const files = fs.readdirSync(IMGS_DIR);
            const cleanName = itemName.replace(/[^a-z0-9]/g, '');
            const cleanWithoutVeg = cleanName.replace(/^veg/, '');

            for (const file of files) {
                const parsed = path.parse(file);
                const fileBase = parsed.name.toLowerCase().replace(/[^a-z0-9]/g, '');

                // Matches by foodId: e.g. "1.jpg"
                if (item.foodId && fileBase === String(item.foodId)) {
                    return `${getBaseUrl()}/imgs/${file}`;
                }

                // Matches by clean name or without 'veg'
                if (
                    fileBase === cleanName ||
                    fileBase === cleanWithoutVeg ||
                    cleanName === `veg${fileBase}`
                ) {
                    return `${getBaseUrl()}/imgs/${file}`;
                }
            }
        }
    } catch (err) {
        console.error('Error scanning imgs directory:', err);
    }

    // If not found in src/imgs, no image should be displayed
    return null;
};

// Helper to format a FoodItem document for the frontend
const formatFoodItem = (item) => {
    const imgUrl = getFoodItemImage(item);
    return {
        id: item.foodId,
        _id: item._id,
        name: item.name,
        category: item.category,
        ingredients: item.ingredients || [],
        price: item.price,
        avgPrepTimeMinutes: item.avgPrepTimeMinutes,
        image_url: imgUrl,
        imageUrl: imgUrl,
        isAvailable: item.isAvailable,
    };
};

// Helper to find an item by foodId (number) or MongoDB _id
const findItemByParam = async (idParam) => {
    const numId = Number(idParam);
    if (!Number.isNaN(numId)) {
        const byFoodId = await FoodItem.findOne({ foodId: numId });
        if (byFoodId) return byFoodId;
    }
    if (mongoose.Types.ObjectId.isValid(idParam)) {
        return await FoodItem.findById(idParam);
    }
    return null;
};

// Parse ingredients from array or comma-separated string
const parseIngredients = (ingredients) => {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) {
        return ingredients.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof ingredients === 'string') {
        return ingredients.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
};

// GET /api/menu — Fetch all menu items (public, used by customer + admin)
const getAllItems = async (req, res) => {
    try {
        const { category, available, search } = req.query;
        const filter = {};

        if (category && category !== 'All' && category !== 'All Categories') {
            filter.category = category;
        }
        if (available === 'true') {
            filter.isAvailable = true;
        } else if (available === 'false') {
            filter.isAvailable = false;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { ingredients: { $elemMatch: { $regex: search, $options: 'i' } } },
            ];
        }

        const items = await FoodItem.find(filter).sort({ foodId: 1 });
        const mapped = items.map(formatFoodItem);

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch menu items' });
    }
};

// GET /api/menu/:id — Fetch a single menu item by foodId or _id
const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await findItemByParam(id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        res.status(200).json({
            success: true,
            item: formatFoodItem(item),
        });
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch menu item' });
    }
};

// POST /api/menu — Add a new menu item (vendor/admin)
const addItem = async (req, res) => {
    try {
        const { name, category, ingredients, price, avgPrepTimeMinutes, isAvailable } = req.body;

        if (!name || !name.trim() || !category || !category.trim() || price == null || price === '') {
            return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
        }

        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
        }

        // Auto-increment foodId
        const lastItem = await FoodItem.findOne().sort({ foodId: -1 });
        const foodId = lastItem ? lastItem.foodId + 1 : 1;

        const newItem = await FoodItem.create({
            foodId,
            name: name.trim(),
            category: category.trim(),
            ingredients: parseIngredients(ingredients),
            price: numericPrice,
            avgPrepTimeMinutes: Number(avgPrepTimeMinutes) > 0 ? Number(avgPrepTimeMinutes) : 10,
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        });

        res.status(201).json({
            success: true,
            message: 'Menu item added',
            item: formatFoodItem(newItem),
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Item with this ID already exists' });
        }
        res.status(500).json({ success: false, message: 'Failed to add menu item' });
    }
};

// DELETE /api/menu/:id — Remove a menu item by foodId or _id (vendor/admin)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await findItemByParam(id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        await FoodItem.deleteOne({ _id: item._id });

        res.status(200).json({
            success: true,
            message: 'Menu item removed',
            deletedId: item.foodId,
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, message: 'Failed to delete menu item' });
    }
};

// PATCH /api/menu/:id/availability — Toggle availability (vendor/admin)
const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await findItemByParam(id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        if (req.body && typeof req.body.isAvailable === 'boolean') {
            item.isAvailable = req.body.isAvailable;
        } else {
            item.isAvailable = !item.isAvailable;
        }
        await item.save();

        res.status(200).json({
            success: true,
            message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`,
            isAvailable: item.isAvailable,
            item: formatFoodItem(item),
        });
    } catch (error) {
        console.error('Error toggling availability:', error);
        res.status(500).json({ success: false, message: 'Failed to update availability' });
    }
};

// PUT /api/menu/:id — Update a menu item (vendor/admin)
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, ingredients, price, avgPrepTimeMinutes, isAvailable } = req.body;

        const item = await findItemByParam(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({ success: false, message: 'Item name cannot be empty' });
            }
            item.name = String(name).trim();
        }
        if (category !== undefined) {
            if (!String(category).trim()) {
                return res.status(400).json({ success: false, message: 'Category cannot be empty' });
            }
            item.category = String(category).trim();
        }
        if (ingredients !== undefined) {
            item.ingredients = parseIngredients(ingredients);
        }
        if (price !== undefined && price !== null && price !== '') {
            const numericPrice = Number(price);
            if (Number.isNaN(numericPrice) || numericPrice < 0) {
                return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
            }
            item.price = numericPrice;
        }
        if (avgPrepTimeMinutes !== undefined && avgPrepTimeMinutes !== null && avgPrepTimeMinutes !== '') {
            const numericPrep = Number(avgPrepTimeMinutes);
            if (!Number.isNaN(numericPrep) && numericPrep > 0) {
                item.avgPrepTimeMinutes = numericPrep;
            }
        }
        if (isAvailable !== undefined) {
            item.isAvailable = Boolean(isAvailable);
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: 'Menu item updated',
            item: formatFoodItem(item),
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ success: false, message: 'Failed to update menu item' });
    }
};

module.exports = {
    getAllItems,
    getItemById,
    addItem,
    deleteItem,
    toggleAvailability,
    updateItem,
};
