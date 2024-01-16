const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the 'Properties' schema
const propertiesSchema = new mongoose.Schema({
  rental_adress: {
    type: String,
  },
  property_id: {
    type: String,
  },
});

// // Define the 'payment' schema
// const paymentSchema = new mongoose.Schema({
//   response: {
//     type: Number,
//   },
//   responsetext: {
//     type: String,
//   },
//   authcode: {
//     type: String,
//   },
//   transactionid: {
//     type: String,
//   },
//   avsresponse: {
//     type: Number,
//   },
//   cvvresponse: {
//     type: String,
//   },
//   type: {
//     type: String,
//   },
//   response_code: {
//     type: String,
//   },
//   cc_type: {
//     type: String,
//   },
//   cc_exp: {
//     type: String,
//   },
//   cc_number: {
//     type: String,
//   },
// });

// Define the 'Payment and Charge' schema
const paymentAndChargeSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  charge_type:{
    type: String,
  },
  payment_type: {
    type: String,
  },
  account: {
    type: String,
  },
  amount: {
    type: Number,
  },
  rental_adress: {
    type: String,
  },
  tenant_firstName: {
    type: String,
  },
  tenant_id: {
    type: String,
  },
  memo: String,
  charges_attachment :{ type: Array },
  date: {
    type: String,
  },
  month_year: String,
  rent_cycle: {
    type: String,
  },
  isPaid:{ type:Boolean,default: false },
  islatefee:{ type:Boolean },
  // paymentDetails: [paymentSchema],
});

// Define the 'Unit' schema
const unitSchema = new mongoose.Schema({
  unit: {
    type: String,
  },
  unit_id: {
    type: String,
  },
  paymentAndCharges: [paymentAndChargeSchema],
});

// Define the 'Payment' schema that embeds 'Unit' and 'Properties' schemas
const paymentAndChargeCombinedSchema = new mongoose.Schema({
  properties: propertiesSchema,
  unit: [unitSchema]
});

module.exports = mongoose.model(
  "payment-charge",
  paymentAndChargeCombinedSchema
);
