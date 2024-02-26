const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  payment_id: { type: String },
  admin_id: { type: String },
  lease_id: { type: String },
  tenant_id: { type: String },

  customer_vault_id: { type: Number },
  billing_id: { type: Number },
  check_number: { type: String },

  entry: [
    {
      entry_id: { type: String },
      account: { type: String },
      amount: { type: Number },
      memo: { type: String },
      surcharge_amount: { type: Number },
      status: { type: String },
      date: { type: String },
      charge_type: { type: String },
    },
  ],

  total_amount: { type: Number },
  is_autoPayment: { type: Boolean },
  payment_type: { type: String },
  type: { type: String, default: "Payment" },
  payment_attachment: { type: Array },

  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },

});

module.exports = mongoose.model("payment", paymentSchema);
