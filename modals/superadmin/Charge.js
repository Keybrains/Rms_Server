const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chargeSchema = new Schema({
  charge_id: { type: String },
  admin_id: { type: String },
  tenant_id: { type: String },
  lease_id: { type: String },

  entry: [
    {
      entry_id: { type: String },
      memo: { type: String },
      account: { type: String },
      amount: { type: Number },
      date: { type: String },
      rent_cycle: { type: String },
      is_paid: { type: Boolean, default: false },
      is_lateFee: { type: Boolean, default: false },
      is_repeatable: { type: Boolean },
      charge_type: { type: String },
    },
  ],

  total_amount: { type: Number },
  is_leaseAdded: { type: Boolean },
  type: { type: String, default: "Charge" },
  uploaded_file: { type: Array },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("charge", chargeSchema);
