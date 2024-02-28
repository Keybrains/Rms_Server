const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emailSchema = new Schema({
  email_configration_id: { type: String },
  superadmin_id: { type: String },
  admin_id: { type: String },

  host: { type: String },
  port: { type: Number },
  user: { type: String },
  pass: { type: String },
  secure: { type: Boolean },

  // From
  from_name: { type: String },
  from_email: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("email", emailSchema);
