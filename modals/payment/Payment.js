const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  admin_id: { type: String },
  lease_id: { type: String },
  payment_id: { type: String },
  tenant_id: { type: String },

  customer_vault_id: { type: Number },
  billing_id: { type: Number },
  check_number: { type: String },

  account: { type: String },
  type: { type: String },
  amount: { type: Number },
  payment_type: { type: String },
  memo: { type: String },
  surcharge_amount: { type: Number },
  // total_amount: { type: Number },
  status: { type: String },
  date: { type: String },
  payment_attachment: { type: Array },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("payment", paymentSchema);
