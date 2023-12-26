const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertiesSchema = new mongoose.Schema({
    rental_adress: {
      type: String,
    },
    property_id: {
      type: String,
    },
  });

const property_expenseSchema = new mongoose.Schema({
  
    account: {
      type: String,
    },
    amount: {
      type: Number,
    },
    date: {
      type: String,
    },
    month_year: String,
    charge_type:{
      type: String,
    },
    // rent_cycle: {
    //   type: String,
    // },
     isPaid:{ type:Boolean,default: false },
  });
  
  // Define the 'Unit' schema
  const unitSchema = new mongoose.Schema({
    unit: {
      type: String,
    },
    unit_id: {
      type: String,
    },
    property_expense: [property_expenseSchema],
  });

  // Define the 'Payment' schema that embeds 'Unit' and 'Properties' schemas
const CombinedSchema = new mongoose.Schema({
    properties: propertiesSchema,
    unit: [unitSchema]
  });

  module.exports = mongoose.model(
    "property_expense",
    CombinedSchema
  );