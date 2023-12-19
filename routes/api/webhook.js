var express = require("express");
var router = express.Router();
const webhookRoutes = express.Router();
var NmiPayment = require("../../modals/NmiPayment");


router.post("/nmis", (req, res) => {
  console.log("Webhook received:", req.body);
  const signingKey = "CC8775A4CFD933614985209F6F68768B"; // Your signing key
  const receivedSignature = req.headers["x-nmi-signature"];
  console.log("chal gaya webhook................");
  // Validate the signature to ensure the request is from NMI
  if (receivedSignature === signingKey) {
    // Process the webhook data
    const event = req.body.event;
    console.log("Received NMI webhook:", event);

    // Handle different events accordingly
    if (event === "recurring_payment") {
      console.log("Recurring payment added!");
      // Add your logic for recurring payment event here
    } else if (event === "custom_subscription") {
      console.log("New custom subscription added!");
      // Add your logic for new custom subscription event here
    }

    res.sendStatus(200); // Respond with 200 to acknowledge receipt of the webhook
  } else {
    res.sendStatus(401); // Invalid signature, reject the request
  }
});

module.exports = webhookRoutes;
