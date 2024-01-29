const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plan_PurchaseSchema = new Schema({
  admin_id: { type: String },
  plan_id: { type: String },
  purchase_id: { type: String },
  plan_name: { type: String },
  plan_price: { type: Number },
  purchase_date: { type: String },
  expiration_date: { type: String },
  plan_duration_monts: { type: Number },
  status: { type: String },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("plans_purchase", plan_PurchaseSchema);
