const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chargeSchema = new Schema({
//   admin_id: { type: String },
  rental_id: { type: String },
  unit_id: { type: String },
  charge_id: { type: String },
  tenant_id: { type: String },
  account: { type: String },
  amount: { type: Number },
  type: { type: String, default: "Charge" },
  memo: { type: String },
  status: { type: String },
  charge_date: { type: String },
  charge_attachment: { type: Array },
  rent_cycle: { type: String},
  isPaid:{ type:Boolean,default: false },
  islatefee:{ type:Boolean },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("charge", chargeSchema);

