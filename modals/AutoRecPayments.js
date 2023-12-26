const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autoRecpaymentSchema = new Schema({
    // gymId: {
    //     type: Schema.Types.ObjectId, 
    //     ref: "users",
    //     required: true
    // },
    // paymentplanId: {
    //     type: Schema.Types.ObjectId, 
    //     ref: "paymentplans",
    //     required: true
    // },
    // memberId: {
    //     type: Schema.Types.ObjectId, 
    //     ref: "users",
    //     required: true
    // },
    nmisubscriptionId: {
        type:String,
        default:null
      },
    email: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    amount: { 
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model("autorecpayments", autoRecpaymentSchema);
