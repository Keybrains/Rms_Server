const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
  admin_id: { type: String },
  first_name: { type: String },
  last_name: { type: String, unique: true },
  email: { type: String },
  compony_name: { type: String },
  phone_number: { type: Number },
  password: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  subscription: { type: Object },
});

module.exports = mongoose.model("admin-register", registerSchema);
