const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const partsAndLaborSchema = new Schema({
  parts_id: { type: String },

  workOrder_id: { type: String },
  parts_quantity: { type: Number },
  account: { type: String },
  charge_type: { type: String },
  description: { type: String },
  parts_price: { type: Number },
  amount: { type: Number }, // parts_price * parts_quantity

  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("parts_labors", partsAndLaborSchema);
