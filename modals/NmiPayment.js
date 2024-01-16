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
  },
  account: {
    type: String,
  },
  paymentType: {
    type: String,
  },
  type2: {
    type: String,
  },
  memo: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  expiration_date: {
    type: Number,
  },
  cvv: {
    type: Number,
  },
  date: {
    type: String,
  },
  tenantId: {
    type: String,
  },
  propertyId: {
    type: String,
  },
  unitId: {
    type: String,
  },
  response: {
    type: Number,
  },
  responsetext: {
    type: String,
  },
  authcode: {
    type: String,
  },
  transactionid: {
    type: String,
  },
  avsresponse: {
    type: Number,
  },
  cvvresponse: {
    type: String,
  },
  type: {
    type: String,
  },
  response_code: {
    type: String,
  },
  cc_type: {
    type: String,
  },
  cc_exp: {
    type: String,
  },
  cc_number: {
    type: String,
  },
});

module.exports = mongoose.model("nmi-payment", nmiPaymentSchema);
