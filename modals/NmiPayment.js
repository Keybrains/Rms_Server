const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nmiPaymentSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email_name: {
    type: String,
    required: true,
  },
  card_number: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expiration_date: {
    type: Number,
    required: true,
  },
  cvv: {
    type: Number,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
  },
  propertyId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("nmi-payment", nmiPaymentSchema);
