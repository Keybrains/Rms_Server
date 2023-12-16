const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentPlanSchema = new Schema({
  planId: {
    type: String,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  planAmount: {
    type: String,
    required: true,
  },
  planPayments: {
    type: Number,
    default:0 
  },
  chargeDayFrequency: {
    type: Number,
    default:30   
  },
  billingCycle: {
    type: String,
    required: false 
  },
  chargeAmount: {
    type: String,
    default: ""
  },
});

module.exports = mongoose.model("paymentplans", paymentPlanSchema);
