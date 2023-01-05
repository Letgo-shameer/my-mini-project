const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: Number,
    },
    author: {
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    offer: {
        type: Number,
        default:0
    },
    stock: {
        type: Number,
    },
    bestseller: {
        type: Number,
        default: 0,
    },
    image: {
        type: Array,
    },
    isActive:{
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Product", productSchema);
