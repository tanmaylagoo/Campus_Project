/**
 * One-time seed script: Loads menu.js data into MongoDB FoodItem collection.
 * Run with:  node src/scripts/seedMenu.js
 * 
 * Safe to re-run — clears existing items first.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('../models/foodItem.model');
const menu = require('../data/menu');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing menu items
        await FoodItem.deleteMany({});
        console.log('Cleared existing menu items');

        // Map static data to model schema
        const docs = menu.map((item) => ({
            foodId: item.id,
            name: item.name,
            category: item.category,
            ingredients: item.ingredients,
            price: item.price,
            avgPrepTimeMinutes: item.avgPrepTimeMinutes,
            isAvailable: true,
        }));

        await FoodItem.insertMany(docs);
        console.log(`Seeded ${docs.length} menu items into MongoDB`);

        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
