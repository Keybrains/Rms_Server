const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  plan_id: { type: String },
  plan_name: { type: String },
  plan_price: { type: Number },
  billing_interval: { type: String },
  day_of_month: { type: Number },
  plan_days: { type: Number },
  plan_payments: { type: Number },
  month_frequency: { type: Number },
  features: {
    type: Array,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("plans", planSchema);
