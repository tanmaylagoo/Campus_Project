const mongoose = require('mongoose');
const mongoose = require('mongoose');

const orderSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    items:[
        {
            foodItem:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'FoodItem',
                required:true,

            },
            quantity:{
            type:Number,
            required:true,
            min:1
        },
        price:{
            type:Number,
            required:true
        }
        },
    ],
     totalAmount:{
            type:Number,
            required:true,
        },
    status:{
        type:String,
        enum:['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default:'pending'


    },

    

},{timestamps:true}
);
module.exports = mongoose.model('Order', orderSchema)
