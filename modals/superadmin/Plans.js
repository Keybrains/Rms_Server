const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionPlanSchema = new Schema({
  plan_id: { type: String },
  plan_name: { type: String },
  plan_price: { type: Number },
  plan_duration_monts: { type: Number },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("subscription_plans", subscriptionPlanSchema);
