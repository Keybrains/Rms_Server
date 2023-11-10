const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
    
  //   Add  applicant
  applicant_id:{type: String},
  tenant_firstName: { type: String },
  tenant_lastName: { type: String },
  tenant_unitNumber:{ type: String },
  tenant_email: { type: String },
  tenant_mobileNumber: { type: Number },
  tenant_workNumber: { type: Number },
  tenant_homeNumber: { type: Number },
  tenant_faxPhoneNumber: { type: Number },
  rental_adress: { type: String },
  status: { type: String },
  applicant_checklist: {type: Array}
});

module.exports = mongoose.model("applicant", applicantSchema);
