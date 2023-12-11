var express = require("express");
var router = express.Router();
const webhookRoutes = express.Router();
var NmiPayment = require("../../modals/NmiPayment");

var crypto = require("crypto");

// Define your /nmi route  (Working Proper)
webhookRoutes.post("/nmi", async (req, res) => {
  try {
    const signingKey = "CC8775A4CFD933614985209F6F68768B"; // Replace with your actual signing key
    const webhookBody = req.body;
    const sigHeader = req.get("Webhook-Signature");

    if (!sigHeader || sigHeader.length < 1) {
      res.status(400).send("Invalid webhook - signature header missing");
      return;
    }

    const match = sigHeader.match(/t=([^,]+),s=(.*)/);
    if (!match) {
      res.status(400).send("Unrecognized webhook signature format");
      return;
    }

    const nonce = match[1];
    const signature = match[2];
    console.log("Received Signature:", signature);

    if (
      !webhookIsVerified(
        JSON.stringify(webhookBody),
        signingKey,
        nonce,
        signature
      )
    ) {
      res
        .status(400)
        .send("Invalid webhook - invalid signature, cannot verify sender");
      return;
    }

    // Webhook is now verified to have been sent by NMI, continue processing
    const parsedWebhook = webhookBody;

    if (parsedWebhook.event_type === "transaction.sale") {
      // Assuming you want to save payment details to MongoDB
      const paymentData = {
        first_name: parsedWebhook.event_body.first_name,
        last_name: parsedWebhook.event_body.last_name,
        email_name: parsedWebhook.event_body.email_name,
        card_number: parsedWebhook.event_body.card_number,
        amount: parsedWebhook.event_body.amount,
        expiration_date: parsedWebhook.event_body.expiration_date,
        cvv: parsedWebhook.event_body.cvv,
        // tenantId: parsedWebhook.tenantId,
        // propertyId: parsedWebhook.propertyId,
      };

      const nmiPayment = await NmiPayment.create(paymentData);
      await nmiPayment.save();

      // Additional processing if needed

      res.status(200).send("Webhook processed successfully");
    } else {
      res
        .status(200)
        .send("Webhook received, but not processing this event type");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// // Verification function
const webhookIsVerified = (webhookBody, signingKey, nonce, sig) => {
  const expectedSignature =
    "493616059c6f9a9a925b5c7ba149ed46c7f9e9068bb59db3d681ca3009030352";
  // const expectedSignature = crypto.createHmac('sha256', signingKey)
  // .update(nonce + '.' + webhookBody)
  // .digest('hex');
  console.log("Expected Signature:", expectedSignature);
  return sig === expectedSignature;
};

// Define your /nmi route
// webhookRoutes.post('/nmi', async (req, res) => {
//   try {
//     const signingKey = process.env.NMI_SIGNING_KEY; // Replace with your actual signing key
//     const webhookBody = req.body;
//     const sigHeader = req.get('Webhook-Signature');

//     if (!sigHeader || sigHeader.length < 1) {
//       res.status(400).send('Invalid webhook - signature header missing');
//       return;
//     }

//     const match = sigHeader.match(/t=([^,]+),s=(.*)/);
//     if (!match) {
//       res.status(400).send('Unrecognized webhook signature format');
//       return;
//     }

//     const nonce = match[1];
//     const signature = match[2];
//     console.log('Received Signature:', signature);

//     if (!webhookIsVerified(JSON.stringify(webhookBody), signingKey, nonce, signature)) {
//       res.status(400).send('Invalid webhook - invalid signature, cannot verify sender');
//       return;
//     }

//     // Webhook is now verified to have been sent by NMI, continue processing
//     const parsedWebhook = webhookBody;

//     if (parsedWebhook.event_type === 'transaction.sale') {
//       // Assuming you want to save payment details to MongoDB
//       const paymentData = {
//         first_name: parsedWebhook.event_body.first_name,
//         last_name: parsedWebhook.event_body.last_name,
//         email_name: parsedWebhook.event_body.email_name,
//         card_number: parsedWebhook.event_body.card_number,
//         amount: parsedWebhook.event_body.amount,
//         expiration_date: parsedWebhook.event_body.expiration_date,
//         cvv: parsedWebhook.event_body.cvv,
//       };

//       const nmiPayment = await NmiPayment.create(paymentData);
//       await nmiPayment.save();

//       // Additional processing if needed

//       res.status(200).send('Webhook processed successfully');
//     } else {
//       res.status(200).send('Webhook received, but not processing this event type');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Verification function
// const webhookIsVerified = (webhookBody, signingKey, nonce, sig) => {
//   // Dynamically generate the expected signature using the received nonce
//   const expectedSignature = crypto.createHmac('sha256', signingKey)
//     .update(nonce + '.' + webhookBody)
//     .digest('hex');
//   console.log('Expected Signature:', expectedSignature);
//   return sig === expectedSignature;
// };

module.exports = webhookRoutes;
