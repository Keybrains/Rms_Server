const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantPropertySchema = new Schema({
  lease_id: { type: String },
  applicant_id: { type: String },

  admin_id: { type: String },
  rental_id: { type: String },
  unit_id: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("applicantProprty", applicantPropertySchema);
