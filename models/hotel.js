const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
    type: String,
    unique: true,
    required: true
    },
    rooms: [{ //number,occupied, guests, price, suitetype
        number:{
            type: Number,
        },
        occupied:{
            type: Boolean,
        },
        guests:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        }],
        price:{
            type: Number
        },
        suitetype: {
            type: String,
            enum : ['Junior','Deluxe', 'Executive', 'President'],
            default: 'Junior'
        }
    }],
    hotelManager:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" ,
        required: false
    }
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;