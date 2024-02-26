const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalsSchema = new Schema({
  rental_id: { type: String },

  admin_id: { type: String },
  rentalowner_id: { type: String },
  property_id: { type: String },
  rental_adress: { type: String },
  is_rent_on: { type: Boolean, default: false },
  rental_city: { type: String },
  rental_state: { type: String },
  rental_country: { type: String },
  rental_postcode: { type: String },
  rental_image: { type: String, default: "" },
  staffmember_id: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("rental", rentalsSchema);
