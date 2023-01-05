const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    tittle: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Category", categorySchema);
