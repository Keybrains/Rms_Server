const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carddetailSchema = new Schema({
  card_number: { type: String },
  exp_date: { type: String },
});

const creditCardSchema = new Schema({
  tenant_id: { type: String },
  card_detail: [carddetailSchema],
});

module.exports = mongoose.model("creditcard", creditCardSchema);
