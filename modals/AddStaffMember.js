const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffmemberSchema = new Schema({
  staffmemberId: { type: String },
  staffmember_name: { type: String },
  staffmember_designation : { type: String },
  staffmember_phoneNumber: { type: Number },
  staffmember_email: { type: String },
  staffmember_password: { type: String },
});

module.exports = mongoose.model("add_staffmember", staffmemberSchema);
