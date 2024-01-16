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
  // tenantId: {
  //   type: String,
  //   required: true,
  // },
  // propertyId: {
  //   type: String,
  //   required: true,
  // },
  // unitId: {
  //   type: String,
  //   required: true,
  // },
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
