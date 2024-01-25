const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tenantSchema = new Schema({
  tenant_id: { type: String },

  admin_id: { type: String },
  tenant_firstName: { type: String },
  tenant_lastName: { type: String },
  tenant_phoneNumber: { type: Number },
  tenant_alternativeNumber: { type: Number },
  tenant_email: { type: String },
  tenant_alternativeEmail: { type: String },
  tenant_password: { type: String },
  tenant_birthDate: { type: String },
  taxPayer_id: { type: String },
  comments: { type: String },
  emergency_contact: {
    name: { type: String },
    relation: { type: String },
    email: { type: String },
    phoneNumber: { type: Number },
  },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("tenants", tenantSchema);
