const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workOrderSchema = new Schema({
  workOrder_id: { type: String },
  admin_id: { type: String },

  rental_id: { type: String },
  unit_id: { type: String },
  vendor_id: { type: String },
  tenant_id: { type: String },
  staffmember_id: { type: String },
  work_subject: { type: String },
  work_category: { type: String },
  entry_allowed: { type: Boolean },
  work_performed: { type: String },
  workOrder_images: { type: Array },
  vendor_notes: { type: String },
  priority: { type: String },
  work_charge_to: { type: String },
  status: { type: String },
  date: { type: String },
  workorder_updates: [
    {
      status: { type: String },
      date: { type: String },
      updated_by: { type: Object },
      staffmember_name: { type: String },
      createdAt: { type: String },
      updatedAt: { type: String },
      statusUpdatedBy: { type: String },
    },
  ],
  createdAt: { type: String },
  updatedAt: { type: String },
  is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("workOrders", workOrderSchema);
