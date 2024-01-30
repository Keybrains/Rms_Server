const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalownernSchema = new Schema({
  rentalowner_id: { type: String },

  admin_id: { type: String },
  rentalOwner_firstName: { type: String },
  rentalOwner_lastName: { type: String },
  rentalOwner_companyName: { type: String },
  rentalOwner_primaryEmail: { type: String },
  rentalOwner_phoneNumber: { type: Number },
  rentalOwner_homeNumber: { type: Number },
  rentalOwner_businessNumber: { type: Number },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postal_code: { type: Number },
  
  createAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("rental-owner", rentalownernSchema);
