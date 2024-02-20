const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  plan_id: { type: String },
  plan_name: { type: String },

  plan_price: { type: Number },
  billing_interval: { type: String },
  features: {
    type: Array,
  },
  plan_days: {
    type: Number,
  },
  day_of_month: {
    type: Number,
  },
  plan_periods: {
    type: Number,
  },
  billingOption: {
    type: String,
  },
  // is_free_trial: {
  //   type: Boolean,
  //   default: false,
  // },
  is_annual_discount: {
    type: Boolean,
    default: false,
  },
  maximum_add: {
    type: Number,
  },
  annual_discount: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("plans", planSchema);
