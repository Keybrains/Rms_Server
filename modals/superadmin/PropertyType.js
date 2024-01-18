const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertyTypeSchema = new Schema({
  admin_id: { type: String },
  property_id: { type: String },
  property_type: { type: String },
  propertysub_type: { type: String },
  is_multiunit: { type:Boolean,default: false },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("property-type", propertyTypeSchema);
