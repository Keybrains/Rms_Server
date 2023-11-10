const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const entrySchema = new Schema({
    part_qty: { type: Number },
    account_type: { type: String },
    description: { type: String },
    part_price: { type: Number },
    total_amount: { type: Number },
  });


const workorderSchema = new Schema({
 // add workorder
workorder_id:{type: String},
work_subject:{ type: String },
rental_adress:{ type: String },
unit_no:{ type: String },
work_category:{ type: String },
vendor_name:{ type: String },
invoice_number: { type: Number },
work_charge: { type: String },
entry_allowed:{ type: String },
detail:{ type: String },
entry_contact:{ type: String },
work_performed:{ type: String },
vendor_note:{ type: String },
staffmember_name:{ type: String },
collaborators: { type: String },
status: { type: String },
due_date: { type: String },
priority: { type: String },
upload_file:{ type: String },
final_total_amount: { type: Number },
 // Parts and Labor Entries
 entries: [entrySchema],
});

module.exports = mongoose.model("workorder", workorderSchema);
