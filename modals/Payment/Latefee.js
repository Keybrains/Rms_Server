const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lateFeeSchema = new Schema({
  admin: { type: String },
  duration: { type: Number },
});

module.exports = mongoose.model("late-fee", lateFeeSchema);