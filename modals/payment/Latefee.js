const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lateFeeSchema = new Schema({
  admin_id: { type: String },
  latefee_id: {type: String},
  duration: { type: Number },
  late_fee: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("late-fee", lateFeeSchema);
