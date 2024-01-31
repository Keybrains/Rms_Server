const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
  plan_id: { type: String },
  plan_name: { type: String },

  plan_price: { type: Number },
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
