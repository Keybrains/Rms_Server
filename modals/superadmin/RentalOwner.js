const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalownernSchema = new Schema({
  rentalowner_id: { type: String },

  admin_id: { type: String },
  rentalOwner_firstName: { type: String },
  rentalOwner_lastName: { type: String },
  rentalOwner_companyName: { type: String },
  rentalOwner_primaryEmail: { type: String },
  rentalOwner_alternateEmail: { type: String },
  rentalOwner_phoneNumber: { type: Number },
  rentalOwner_homeNumber: { type: Number },
  rentalOwner_businessNumber: { type: Number },
  rentalOwner_telephoneNumber: { type: Number },
  birth_date: { type: String },
  start_date: { type: String },
  end_date: { type: String },
  texpayer_id: { type: String },
  text_identityType: { type: String },
  street_address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postal_code: { type: Number },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("rental-owner", rentalownernSchema);
