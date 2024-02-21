const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leasesSchema = new Schema({
  lease_id: { type: String },
  tenant_id: { type: String },

  admin_id: { type: String },
  rental_id: { type: String },
  unit_id: { type: String },
  lease_type: { type: String, default: "" },
  start_date: { type: String, default: "" },
  end_date: { type: String, default: "" },
  uploaded_file: { type: Array, default: "" },

  entry: [
    {
      entry_id: { type: String },
      date: { type: String },
      charge_type: { type: String },
      account: { type: String },
      rent_cycle: { type: String },
      amount: { type: Number },
    },
  ],

  moveout_notice_given_date: { type: String, default: "" },
  moveout_date: { type: String, default: "" },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("lease", leasesSchema);
