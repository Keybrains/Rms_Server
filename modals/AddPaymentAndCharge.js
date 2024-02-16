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
  status: {
    type: String,
  },
  account: {
    type: String,
  },
  amount: {
    type: Number,
  },  
  surcharge: {
    type: Number,
  },  
  total_amount: {
    type: Number,
  },
  customer_vault_id: {
    type: Number,
  },
  billing_id: {
    type: Number,
  },
  check_number: {
    type: String,
  },
  rental_adress: {
    type: String,
  },
  tenant_firstName: {
    type: String,
  },
  tenant_lastName: {
    type: String,
  },
  email_name: {
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
    type: String,
  },
  cvvresponse: {
    type: String,
  },
  type2: {
    type: String,
  },
  response_code: {
    type: String,
  },
  cc_type: {
    type: String,
  },
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
