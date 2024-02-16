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

  entry: [
    {
      account: { type: String },
      amount: { type: Number },
      memo: { type: String },
      surcharge_amount: { type: Number },
      status: { type: String },
      date: { type: String },
      charge_type: { type: String },
    },
  ],
  
  is_autoPayment: { type: Boolean },
  payment_type: { type: String },
  type: { type: String, default: "Payment" },
  payment_attachment: { type: Array },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("payment", paymentSchema);
