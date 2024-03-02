const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantDetailsSchema = new Schema({
  applicant_id: { type: String },
  admin_id: { type: String },

  applicant_birthDate: { type: String },
  applicant_streetAddress: { type: String },
  applicant_city: { type: String },
  applicant_state: { type: String },
  applicant_country: { type: String },
  applicant_postalCode: { type: String },

  emergency_contact: {
    first_name: { type: String },
    last_name: { type: String },
    relationship: { type: String },
    email: { type: String },
    phone_number: { type: String },
  },

  rental_history: {
    rental_adress: { type: String },
    rental_city: { type: String },
    rental_state: { type: String },
    rental_country: { type: String },
    rental_postcode: { type: String },
    start_date: { type: String },
    end_date: { type: String },
    rent: { type: String },
    leaving_reason: { type: String },
    rentalOwner_firstName: { type: String },
    rentalOwner_lastName: { type: String },
    rentalOwner_primaryEmail: { type: String },
    rentalOwner_phoneNumber: { type: String },
  },

  employment: {
    name: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    employment_primaryEmail: { type: String },
    employment_phoneNumber: { type: String },
    employment_position: { type: String },
  },
});

module.exports = mongoose.model("applicantDetails", applicantDetailsSchema);
