const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vendorSchema = new Schema({
  vendor_id: { type: String },

  admin_id: { type: String },
  vendor_name: { type: String },
  vendor_phoneNumber: { type: Number },
  vendor_email: { type: String },
  vendor_password: { type: String },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("vendor", vendorSchema);
