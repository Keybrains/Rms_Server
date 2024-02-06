const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  plan_id: { type: String },
  plan_name: { type: String },

  plan_price: { type: Number },
  features: {
    type: Array,
  },
  billing_interval: {
    type: String,
  },
  plan_days: {
    type: Number,
  },
  is_free_trial: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("plans", planSchema);
