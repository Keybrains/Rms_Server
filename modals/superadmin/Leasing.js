const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leasesSchema = new Schema({
  lease_id: { type: String },

  admin_id: { type: String },
  tenant_id: { type: String },
  rental_id: { type: String },
  unit_id: { type: String },
  lease_type: { type: String },
  start_date: { type: String },
  end_date: { type: String },
  uploaded_file: { type: String },
  
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("lease", leasesSchema);
