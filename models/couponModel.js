const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
    },
    code: {
        type: String,
    },
    expirydate: {
        type: String,
    },
    Minimumbill: {
        type: Number,
    },
    coustomer: {
        type: Array,
    },
    isActive: {
        type:Number,
        default:1
    }
});

module.exports = mongoose.model("Coupon", couponSchema);
