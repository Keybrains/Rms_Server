const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const unitSchema = new Schema({
  unit_id: { type: String },
  rental_unit: { type: String },
  admin_id: { type: String },
  rental_id: { type: String },
  rental_unit_adress: { type: String },
  rental_sqft: { type: String },
  rental_bath: { type: String },
  rental_bed: { type: String },
  rental_images: { type: Array },

  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("unit", unitSchema);
