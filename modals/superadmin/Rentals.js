const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalsSchema = new Schema({
  admin_id: { type: String },
  rentalowner_id: { type: String },
  rental_id: { type: String },
  property_type: { type: String },
  rental_adress: { type: String },
  isrenton: { type: Boolean, default: false },
  rental_city: { type: String },
  rental_state: { type: String },
  rental_country: { type: String },
  rental_postcode: { type: String },
  staffMember: { type: String },
  createAt: { type: String },
});

module.exports = mongoose.model("new_rental", rentalsSchema);
