const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  charges_account: { type: String },
  charges_balance: { type: Number},
  charges_amount: { type: Number },
  charges_total_amount:{type: Number},
});

const chargesSchema = new Schema({  
charges_tenant_id:{type: String},
charges_type:{type: String, default:"Charge"}, 
charges_entryIndex:{type: String},
charges_payment_id:{type: String},
charges_rental_adress: { type: String },
charges_date: { type: String },
charges_amount: { type: Number },
charges_payment_method:{ type: String },
charges_tenant_firstName: { type: String },
charges_tenant_lastName: { type: String },
charges_memo: { type: String },
charges_attachment :[{ type: Array }],
charges_entries: [entrySchema],  
});

module.exports = mongoose.model("charges", chargesSchema);
