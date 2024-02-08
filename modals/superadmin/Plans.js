const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  plan_id: { type: String },
  plan_name: { type: String },

  plan_price: { type: Number },
  features: {
    type: Array,
  },
  plan_days: {
    type: Number,
  },
  is_free_trial: {
    type: Boolean,
    default: false,
  },
  is_annual_discount: {
    type: Boolean,
  },
  maximum_add: {
    type: Number,
  },
  annual_discount: {
    type: Number,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("plans", planSchema);
