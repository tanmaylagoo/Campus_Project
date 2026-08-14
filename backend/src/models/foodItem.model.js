const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    foodId: {
        type: Number, 
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    ingredients: [{
        type: String
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    avgPrepTimeMinutes: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', foodItemSchema);