const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
  applicant_id: { type: String },
  admin_id: { type: String },
  applicant_firstName: { type: String },
  applicant_lastName: { type: String },
  applicant_email: { type: String },
  applicant_phoneNumber: { type: Number },
  applicant_homeNumber: { type: Number },
  applicant_businessNumber: { type: Number },
  applicant_telephoneNumber: { type: Number },
  applicant_checklist: { type: Array },
  applicant_checkedChecklist: { type: Array },
  applicant_emailsend_date: { type: String },
  isMovedin:{type:Boolean, default:false},
  createdAt: { type: String },
  updatedAt: { type: String },
  applicant_NotesAndFile: [
    {
      applicant_notes: String,
      applicant_file: String,
    },
  ],
  applicant_status: [
    {
      status: String,
      updateAt: String,
      statusUpdatedBy: String,
    },
  ],
});

module.exports = mongoose.model("applicant", applicantSchema);
