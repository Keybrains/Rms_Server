const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carddetailSchema = new Schema({
  response_code: { type: String },
  billing_id: { type: Number },
});

const creditCardSchema = new Schema({
  admin_id: { type: String },
  tenant_id: { type: String },
  customer_vault_id: { type: Number },
  card_detail: [carddetailSchema],
});

module.exports = mongoose.model("creditcard", creditCardSchema);
