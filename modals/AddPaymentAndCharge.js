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
  date: {
    type: String,
  },
  month_year: String,
  rent_cycle: {
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
  unit: [unitSchema],
});

module.exports = mongoose.model(
  "payment-charge",
  paymentAndChargeCombinedSchema
);
