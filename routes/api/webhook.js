var express = require("express");
var router = express.Router();
const webhookRoutes = express.Router();
var NmiPayment = require("../../modals/NmiPayment");
const crypto = require('crypto');


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

function webhookIsVerified(webhookBody, signingKey, nonce, sig) {
  const calculatedSig = crypto.createHmac('sha256', signingKey)
    .update(`${nonce}.${webhookBody}`)
    .digest('hex');
  return sig === calculatedSig;
}


router.post("/nmi", async(req, res) => {
  try {
    const signingKey = 'CC8775A4CFD933614985209F6F68768B';
    const webhookBody = JSON.stringify(req.body); // Assuming body is JSON
    const sigHeader = req.headers['webhook-signature'];

    if (!sigHeader || sigHeader.length < 1) {
      throw new Error('Invalid webhook - signature header missing');
    }

    const sigMatches = sigHeader.match(/t=(.*),s=(.*)/);
    if (!sigMatches || sigMatches.length !== 3) {
      throw new Error('Unrecognized webhook signature format');
    }

    const nonce = sigMatches[1];
    const signature = sigMatches[2];

    if (!webhookIsVerified(webhookBody, signingKey, nonce, signature)) {
      throw new Error('Invalid webhook - invalid signature, cannot verify sender');
    }

    // Webhook is now verified to have been sent by you, continue processing
    console.log('Webhook is verified');
    const webhook = req.body; // Assuming JSON payload
    if(webhook.event_type === 'recurring.subscription.update') {
      console.log("successfully update recurring subscription")
      const gymOwner = await User.findOne({nmiSubscriptionId: parsedWebhook.event_body.subscription_id});

      if(gymOwner) {
      const payment = await Payment.create({
          gymId: gymOwner.parentId,
          paymentplanId: gymOwner.nmiplanId,
          memberId: gymOwner._id,
          email: parsedWebhook.event_body.email,
          description: "Recurring charging",
          amount: parsedWebhook.event_body.plan.amount
      });

      //Save payment details of the user in payment collection
      await payment.save();

      //update user payment status to true
      await User.findOneAndUpdate(
          {
              nmiSubscriptionId: parsedWebhook.event_body.subscription_id,
              userRole: ROLE_MEMBER
          },
          {
              paymentStatus: true
          }
        ); 
      }
  }
    
    // console.log(webhook);

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error processing webhook');
  }

});

module.exports = webhookRoutes;
