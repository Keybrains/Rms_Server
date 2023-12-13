var express = require("express");
var router = express.Router();
const webhookRoutes = express.Router();
var NmiPayment = require("../../modals/NmiPayment");

var crypto = require("crypto");



// Verification function
const webhookIsVerified = (webhookBody, signingKey, nonce, sig) => {
  // Dynamically generate the expected signature using the received nonce
  const expectedSignature = crypto.createHmac('sha256', signingKey)
    .update(nonce + '.' + webhookBody)
    .digest('hex');
  console.log('Expected Signature:', expectedSignature);
  return sig === expectedSignature;
};








module.exports = webhookRoutes;