const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surchargeSchema = new Schema({
    surcharge_percent: { type: Number },
});

module.exports = mongoose.model("surcharge", surchargeSchema);