const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const superAdminRegisterSchema = new Schema({
  superadmin_id: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String },
  company_name: { type: String },
  phone_number: { type: Number },
  password: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("superadmin-register", superAdminRegisterSchema);
