const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cronjobSchema = new Schema({
  isCronjobRunning: { type: Boolean },
  updateAt: { type: String },
  createdAt: { type: String },
});

module.exports = mongoose.model("cronjobs", cronjobSchema);