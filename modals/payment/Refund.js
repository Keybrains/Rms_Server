const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refundSchema = new Schema({
  admin_id: { type: String },
  refund_id: { type: String },
  payment_id: { type: String },

  type: { type: String, default: "Refund" },
  refund_type: { type: String },
  memo: { type: String },
  status: { type: String },
  refund_date: { type: String },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("refund", refundSchema);
