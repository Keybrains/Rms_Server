const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
 // add account 
 account_id:{type: String},
account_name:{ type: String },
account_type:{ type: String },

//account level (sub account)
parent_account:{ type: String },
account_number: { type: Number },
fund_type:{ type: String },
cash_flow:{ type: String },
notes:{ type: String },

});

module.exports = mongoose.model("add_account", accountSchema);