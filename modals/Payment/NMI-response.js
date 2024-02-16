const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NmiResponseSchema = new Schema({
        nmi_responce_id: { type: String },
        // admin_id: { type: String },
        payment_id: { type: String },
      
        response: {
          type: Number,
        },
        responsetext: {
          type: String,
        },
        authcode: {
          type: String,
        },
        transactionid: {
          type: String,
        },
        avsresponse: {
          type: String,
        },
        cvvresponse: {
          type: String,
        },
        type: {
          type: String,
        },
        response_code: {
          type: String,
        },
        cc_type: {
          type: String,
        },
        cc_exp: {
          type: String,
        },
        cc_number: {
          type: String,
        },
        createdAt: { type: String },
});

module.exports = mongoose.model("nmi-response", NmiResponseSchema);

