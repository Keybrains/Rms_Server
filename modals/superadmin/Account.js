const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  account_id: { type: String },

  admin_id: { type: String },
  account: { type: String },
  account_type: { type: String },
  charge_type: { type: String },
  fund_type: { type: String },
  notes: { type: String },
  date: { type: String },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("accounts", accountSchema);
