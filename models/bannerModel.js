const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    bannername: {
        type: String,
    },
    bannerimage: {
        type: Array,
    },
    active: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("Banner", bannerSchema);
