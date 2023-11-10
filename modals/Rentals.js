const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  rental_id: { type: String },
  entryIndex: { type: String },
  property_type: { type: String },
  rental_adress: { type: String },
  isrenton: { type: Boolean, default: false },
  rental_city: { type: String },
  rental_country: { type: String },
  rental_postcode: { type: Number },

  rentalOwner_operatingAccount: { type: String },
  rentalOwner_propertyReserve: { type: Number },
  staffMember: { type: String },
  //rooms
  //RESIDENTIAL
  rental_bed: { type: String },
  rental_bath: { type: String },
  propertyres_image: { type: Array },

  rental_soft: { type: String },
  rental_units: { type: String },
  rental_unitsAdress: { type: String },

  //COMMERCIAL
  rentalcom_soft: { type: String },
  rentalcom_units: { type: String },
  rentalcom_unitsAdress: { type: String },
  property_image: { type: Array },
});


const registerSchema = new Schema({
  //   Add Rental owner
  rentalOwner_firstName: { type: String },
  rentalOwner_lastName: { type: String },
  rentalOwner_companyName: { type: String },
  rentalOwner_primaryEmail: { type: String },
  rentalOwner_phoneNumber: { type: Number },
  rentalOwner_homeNumber: { type: Number },
  rentalOwner_businessNumber: { type: Number },
  entries: [entrySchema],
});

module.exports = mongoose.model("rentals", registerSchema);
