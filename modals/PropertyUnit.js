const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertyUnitSchema = new Schema({
  rental_adress: { type: String },
  tenantId: { type: String },

  rental_city: { type: String },
  rental_country: { type: String },
  rental_postcode: { type: Number },
  rental_state: { type: String },


  rentalId: { type: String },
  propertyId: { type: String },
  description: { type: String },
  market_rent: { type: String },

  //RESIDENTIAL
  rental_bed: { type: String },
  rental_bath: { type: String },
  propertyres_image: { type: Array },
  rental_sqft: { type: String },
  rental_units: { type: String },
  rental_unitsAdress: { type: String },

  //COMMERCIAL
  rentalcom_unitsAdress: { type: String },
  rentalcom_sqft: { type: String },
  rentalcom_units: { type: String },
  property_image: { type: Array },
});

module.exports = mongoose.model("property_unit", propertyUnitSchema);
