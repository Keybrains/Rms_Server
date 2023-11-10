const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalownernSchema = new Schema({

  //   Add Rental owner
  rentalowner_firstName: { type: String },
  rentalOwner_lastName: { type: String },
  rentalOwner_companyName: { type: String },
  birth_date: { type: String },

  //management agreement
  start_date: { type: String },
  end_date: { type: String },

  //Contact information
  rentalOwner_primaryEmail: { type: String },
  rentalOwner_alternateEmail: { type: String },
  rentalOwner_phoneNumber: { type: Number },
  rentalOwner_homeNumber: { type: Number },
  rentalOwner_businessNumber: { type: Number },
  rentalOwner_homeNumber: { type: Number },
  rentalOwner_telephoneNumber: { type: Number },
  rentalOwner_streetAdress: { type: String },
  rentalOwner_city: { type: String },
  rentalOwner_state: { type: String },
  rentalOwner_zip: { type: String },
  rentalOwner_country: { type: String },
  rentalOwner_comments: { type: String },

  //1099 -NEC tax filling information

  text_identityType: { type: String },
  textpayer_id: { type: String },
  rentalOwner_properties: { type: Array },
});

module.exports = mongoose.model("rentalowner", rentalownernSchema);
