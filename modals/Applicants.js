const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
  //   Add  applicant
  applicant_id: { type: String },
  tenant_firstName: { type: String },
  tenant_lastName: { type: String },
  tenant_unitNumber: { type: String },
  tenant_email: { type: String },
  tenant_mobileNumber: { type: Number },
  tenant_workNumber: { type: Number },
  tenant_homeNumber: { type: Number },
  tenant_faxPhoneNumber: { type: Number },
  rental_adress: { type: String },
  status: { type: String, default: "" },
  rental_units: { type: String },
  applicant_checklist: { type: Array },
  applicant_emailsend_date: { type: String},
  createAt: { type: String },

  applicant_status: [
    {
      status: String,
      updateAt: String,
      statusUpdatedBy: String,
    },
  ],



  applicant: {
    applicant_firstName: { type: String },
    applicant_lastName: { type: String },
    applicant_socialSecurityNumber: { type: Number },
    applicant_dob: { type: String },
    applicant_country: { type: String },
    applicant_adress: { type: String },
    applicant_city: { type: String },
    applicant_state: { type: String },
    applicant_zipcode: { type: String },
    applicant_email: { type: String },
    applicant_cellPhone: { type: Number },
    applicant_homePhone: { type: Number },
    applicant_emergencyContact_firstName: { type: String },
    applicant_emergencyContact_lasttName: { type: String },
    applicant_emergencyContact_relationship: { type: String },
    applicant_emergencyContact_email: { type: String },
    applicant_emergencyContact_phone: { type: Number },


    rental_country: { type: String },
    rental_adress: { type: String },
    rental_city: { type: String },
    rental_state: { type: String },
    rental_zipcode: { type: String },
    rental_data_from: { type: String },
    rental_date_to: { type: String },
    rental_monthlyRent: { type: String },
    rental_resaonForLeaving: { type: String },
    rental_landlord_firstName: { type: String },
    rental_landlord_lasttName: { type: String },
    rental_landlord_phoneNumber: { type: String },
    rental_landlord_email: { type: String },


    // Employment
    employment_name: { type: String },
    employment_country: { type: String },
    employment_adress: { type: String },
    employment_city: { type: String },
    employment_state: { type: String },
    employment_zipcode: { type: String },
    employment_phoneNumber: { type: String },
    employment_email: { type: String },
    employment_position: { type: String },
    employment_date_from: { type: String },
    employment_date_to: { type: String },
    employment_monthlyGrossSalary: { type: String },
    employment_supervisor_first: { type: String },
    employment_supervisor_last: { type: String },
    employment_supervisor_title: { type: String },

  },
});

module.exports = mongoose.model("applicant", applicantSchema);
