const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalownernSchema = new Schema({
  admin_id: { type: String },
  rentalowner_id: { type: String },
  rentalowner_firstName: { type: String },
  rentalOwner_lastName: { type: String },
  rentalOwner_companyName: { type: String },
  rentalOwner_primaryEmail: { type: String },
  rentalOwner_phoneNumber: { type: Number },
  rentalOwner_homeNumber: { type: Number },
  rentalOwner_businessNumber: { type: Number },
  createAt: { type: String },
});

module.exports = mongoose.model("rentalowner", rentalownernSchema);
