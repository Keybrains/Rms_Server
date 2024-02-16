const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refundSchema = new Schema({
//   admin_id: { type: String },
  refund_id: { type: String },
  payment_id: { type: String },
  tenant_id: { type: String },
  refund_amount: { type: Number },
  refund_type: { type: String },
  type: { type: String, default: "Refund" },
  memo: { type: String },
  status: { type: String },
  refund_date: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("refund", refundSchema);

