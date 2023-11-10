const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// for notification
const notificationSchema = new Schema({
  workorder_id: { type: String },
  notification_title: { type: String },
  notification_details: { type: String },
  isTenantread: { type:Boolean,default: false },
  isVendorread: { type:Boolean,default: false },
  isStaffread: { type:Boolean,default: false },
  isAdminread: { type:Boolean,default: false },
  istenant: { type:Boolean,default: false },
  vendor_name: { type: String },
  staffmember_name: { type: String },
  rental_adress: { type: String },
  notification_time: { type: String },
});

module.exports = mongoose.model("notification", notificationSchema);