const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keySchema = new Schema({
  admin_id: { type: String },
  key_id: {type: String},
  security_key: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("nmi-keys", keySchema);
