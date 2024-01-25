const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cosignerSchema = new Schema({
  cosigner_id: { type: String },

  admin_id: { type: String },
  tenant_id: { type: String },
  cosigner_firstName: { type: String },
  cosigner_lastName: { type: String },
  cosigner_phoneNumber: { type: Number },
  cosigner_alternativeNumber: { type: Number },
  cosigner_email: { type: String },
  cosigner_alternativeEmail: { type: String },
  cosigner_address: { type: String },
  cosigner_city: { type: String },
  cosigner_country: { type: String },
  cosigner_postalcode: { type: Number },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("cosigner", cosignerSchema);
