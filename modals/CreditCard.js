const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carddetailSchema = new Schema({
  card_number: { type: String },
  exp_date: { type: String },
  card_type: { type: String },
  response_code: { type: String },
  customer_vault_id: { type: Number },
});

const creditCardSchema = new Schema({
  tenant_id: { type: String },
  card_detail: [carddetailSchema],
});

module.exports = mongoose.model("creditcard", creditCardSchema);
