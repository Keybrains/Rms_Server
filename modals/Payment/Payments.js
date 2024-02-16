const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
//   admin_id: { type: String },
  rental_id: { type: String },
  payment_id: { type: String },
  tenant_id: { type: String },

  customer_vault_id: { type: Number },
  billing_id: { type: Number },
  check_number: { type: String },

  account: { type: String },
  amount: { type: Number },
  payment_type: { type: String },
  type: { type: String, default: "Payment" },
  memo: { type: String },
  surcharge_amount: { type: Number },
  total_amount: { type: Number },
  status: { type: String },
  payment_date: { type: String },
  unit_id: { type: String },
  payment_attachment: { type: Array },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("payment", paymentSchema);

