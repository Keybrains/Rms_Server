const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
  admin_id: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String },
  company_name: { type: String },
  phone_number: { type: Number },
  password: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  isAdmin_delete: { type: Boolean, default: false },
  is_addby_superdmin: { type: Boolean, default: false },
  role: { type: String },
  trial: {
    status: { type: String },
    start_date: { type: String },
    end_date: { type: String },
  },
  subscription: {
    status: { type: String },
    start_date: { type: String },
    end_date: { type: String },
    plan_purchase_id: { type: Schema.Types.ObjectId, ref: "plan-purchase" },
  },
});

module.exports = mongoose.model("admin-register", registerSchema);
