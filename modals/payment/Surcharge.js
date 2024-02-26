const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surchargeSchema = new Schema({
  admin_id: { type: String },
  surcharge_id: { type: String },
  surcharge_percent: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("surcharge", surchargeSchema);
