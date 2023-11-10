const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
  userName: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cPassword: { type: String },
  // isTenant: { type: Boolean },
});

module.exports = mongoose.model("admin-register", registerSchema);
