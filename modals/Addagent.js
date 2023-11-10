const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const agentSchema = new Schema({
  agentId: { type: String },
  agent_name: { type: String },
  agent_phoneNumber: { type: Number },
  agent_email: { type: String },
  agent_password: { type: String },
});

module.exports = mongoose.model("add_agent", agentSchema);
