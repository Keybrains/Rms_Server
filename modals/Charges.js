const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  chargeIndex:{type: String},
  charges_account: { type: String },
  charges_amount: { type: Number },
  charges_total_amount:{type: Number},
});

const chargesSchema = new Schema({  
tenant_id:{type: String},
entryIndex:{type: String},
type:{type: String, default:"Charge"}, 
rental_adress: { type: String },
// charges_date: { type: String },
date: { type: String },
charges_amount: { type: Number },
tenant_firstName: { type: String },
charges_memo: { type: String },
charges_attachment :[{ type: Array }],
entries: [entrySchema],  
});

module.exports = mongoose.model("charges", chargesSchema);
