const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  account: { type: String },
  balance: { type: Number},
  amount: { type: Number },
  total_amount:{type: Number},
});

const paymentSchema = new Schema({  
tenant_id:{type: String},
entryIndex:{type: String},
payment_id:{type: String},
rental_adress: { type: String },
date: { type: String },
amount: { type: Number },
payment_method:{ type: String },
tenant_firstName: { type: String },
tenant_lastName: { type: String },
memo: { type: String },
attachment :[{ type: Array }],
entries: [entrySchema],  
});

module.exports = mongoose.model("payment", paymentSchema);
