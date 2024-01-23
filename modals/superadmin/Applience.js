const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applianceSchema = new Schema({
  appliance_id: { type: String },
  admin_id: { type: String },
  unit_id: { type: String },

  appliance_name: { type: String },
  appliance_description: { type: String },
  installed_date: { type: String },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("appliance", applianceSchema);
