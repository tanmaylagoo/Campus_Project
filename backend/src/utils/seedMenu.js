require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('../models/foodItem.model');
const menu = require('../data/menu');

const seedDatabase = async () => {
    try {
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

    
        await FoodItem.deleteMany();
        console.log('Cleared existing food menu.');

        
        const formattedMenu = menu.map(item => ({
            foodId: item.id,
            name: item.name,
            category: item.category,
            ingredients: item.ingredients,
            price: item.price,
            avgPrepTimeMinutes: item.avgPrepTimeMinutes,
            isAvailable: true
        }));

        
        await FoodItem.insertMany(formattedMenu);
        console.log(`Successfully seeded ${formattedMenu.length} food items into the database!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();