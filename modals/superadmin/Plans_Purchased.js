const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plan_PurchaseSchema = new Schema({
  admin_id: { type: String },
  plan_id: { type: String },
  purchase_id: { type: String },
  // plan_name: { type: String },
  plan_amount: { type: Number },
  purchase_date: { type: String },
  expiration_date: { type: String },
  plan_duration_monts: { type: Number },
  status: { type: String },
  street_address: {type: String},
  city: {type: String},
  state: {type: String},
  postal_code: {type: String},
  country: {type: String},
  card_type: {type: String},
  card_number: {type: String},
  expiration_date: {type: String},
  cvv: {type: String},
  card_holder_name: {type: String},
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("plans_purchase", plan_PurchaseSchema);