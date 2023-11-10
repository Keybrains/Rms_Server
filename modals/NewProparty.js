const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newpropartySchema = new Schema({
  propertyId: { type: String },
  property_type: { type: String },
  propertysub_type: { type: String },
});

module.exports = mongoose.model("newproparties", newpropartySchema);
