const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newpropartySchema = new Schema({
  propertyId: { type: String },
  property_type: { type: String },
  propertysub_type: { type: String },
  ismultiunit: { type:Boolean,default: false },
  createAt: { type: String },
  updateAt: { type: String },
});

module.exports = mongoose.model("newproparties", newpropartySchema);
