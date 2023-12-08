var express = require("express");
var router = express.Router();
var NmiPayment = require("../../modals/NmiPayment");
var axios = require("axios");

// router.post("/process-payment", async (req, res) => {
//     try {
//       const nmiApiKey = "b6F87GPCBSYujtQFW26583EM8H34vM5r";
//       const nmiApiEndpoint = "https://gymsoft.cloudpress.host/api/webhook/nmi";

//       const paymentData = {
//         // Your payment data here, e.g., req.body.first_name, req.body.card_number, etc.
//       };

//       const response = await axios.post(nmiApiEndpoint, paymentData, {
//         headers: {
//           Authorization: `Basic ${Buffer.from(`${nmiApiKey}:`).toString("base64")}`,
//           "Content-Type": "application/json",
//         },
//       });

//       // Handle NMI API response
//       console.log(response.data);
//       res.json(response.data);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });

// router.post("/process-payment", async (req, res) => {
//     try {
//       // Retrieve the actual API key from environment variables
//       const nmiApiKey = "b6F87GPCBSYujtQFW26583EM8H34vM5r";
//       const nmiApiEndpoint = "https://gymsoft.cloudpress.host/api/webhook/nmi";

//       // Extract payment data from the request body
//       const { first_name, last_name, card_number, expiration_date, cvv, email_name, amount } = req.body;

//       const paymentData = {
//         first_name,
//         last_name,
//         card_number,
//         expiration_date,
//         cvv,
//       };

//       // Make a POST request to the NMI API
//       const response = await axios.post(nmiApiEndpoint, paymentData, {
//         headers: {
//           Authorization: `Basic ${Buffer.from(`${nmiApiKey}:`).toString("base64")}`,
//           "Content-Type": "application/json",
//         },
//       });

//       // Handle NMI API response
//       if (response.data.result === "approved") {
//         // Payment was successful
//         // Save transaction details to your database (if needed)
//         const newPayment = new NmiPayment({
//           first_name,
//           last_name,
//           email_name,
//           card_number,
//           amount,
//           expiration_date,
//           cvv,
//         });
//         await newPayment.save();

//         res.json({ message: "Payment successful" });
//       } else {
//         // Payment failed
//         res.status(400).json({ error: "Payment failed", message:  .data.message });
//       }
//     } catch (error) {
//       console.error("Error making NMI API request:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });

const hmsApiEndpoint = "https://gymsoft.cloudpress.host/api/webhook/nmi"; // Replace with the actual HMS API endpoint
const apiKey = "b6F87GPCBSYujtQFW26583EM8H34vM5r"; // Replace with your actual API key

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${apiKey}`,
};

const paymentData = {
  // Replace with the actual payment data required by HMS
  amount: 100,
  cardNumber: "4111111111111111",
  expirationDate: "12/2024",
  cvv: "123",
  first_name: "Shivam",
  last_name: "Shukla",
  email_name: "shivam@gmail.com",
  // Add other required fields
};

axios
  .post(`${hmsApiEndpoint}/process-payment`, paymentData, { headers })
  .then((response) => {
    console.log("HMS API Response:", response.data);
    // Process the response as needed
    if (response.data.result === "approved") {
      console.log("Payment was successful");
      // Your additional logic for a successful payment
    } else {
      console.log("Payment failed:", response.data.message);
      // Your additional logic for a failed payment
    }
  })
  .catch((error) => {
    console.error("Error making HMS API request:", error.message);
    // Handle errors
  });

module.exports = router;
