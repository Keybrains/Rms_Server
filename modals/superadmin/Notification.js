const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  admin_id: { type: String },
  notification_id: { type: String },
  unit_id: { type: String },
  rental_id: { type: String },
  tenant_id: { type: String },
  notification_title: { type: String },
  notification_detail: { type: String },

  notification_type: { type: Object },
  notification_send_to: { type: Array },

  notification_read: { type: Object },
  
  is_rental: { type: Boolean, default: false },
  is_lease: { type: Boolean, default: false },
  is_workorder: { type: Boolean, default: false },
  is_staffmember: { type: Boolean, default: false },

  payment_type: { type: String },

  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("notification", notificationSchema);
