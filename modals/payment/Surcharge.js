const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surchargeSchema = new Schema({
  admin_id: { type: String },
  surcharge_percent: { type: Number },
});

module.exports = mongoose.model("surcharge", surchargeSchema);
