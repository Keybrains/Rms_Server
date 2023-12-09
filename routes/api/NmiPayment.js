var express = require("express");
var router = express.Router();
var NmiPayment = require("../../modals/NmiPayment");
var axios = require("axios");
const bodyParser = require('body-parser');


//#region sahil
// const hmsApiEndpoint = "https://gymsoft.cloudpress.host/api/webhook/nmi"; // Replace with the actual HMS API endpoint
// const apiKey = "b6F87GPCBSYujtQFW26583EM8H34vM5r"; // Replace with your actual API key

// const headers = {
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${apiKey}`,
// };

// const paymentData = {
//   // Replace with the actual payment data required by HMS
//   amount: 100,
//   cardNumber: "4111111111111111",
//   expirationDate: "12/2024",
//   cvv: "123",
//   first_name: "Shivam",
//   last_name: "Shukla",
//   email_name: "shivam@gmail.com",
//   // Add other required fields
// };

// axios
//   .post(`${hmsApiEndpoint}/process-payment`, paymentData, { headers })
//   .then((response) => {
//     console.log("HMS API Response:", response.data);
//     // Process the response as needed
//     if (response.data.result === "approved") {
//       console.log("Payment was successful");
//       // Your additional logic for a successful payment
//     } else {
//       console.log("Payment failed:", response.data.message);
//       // Your additional logic for a failed payment
//     }
//   })
//   .catch((error) => {
//     console.error("Error making HMS API request:", error.message);
//     // Handle errors
//   });
//#endregion



const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const NMI_API_ENDPOINT = 'https://propertymanager.cloudpress.host/api/webhook/nmi';

// Route for processing a payment
router.post('/process-payment', async (req, res) => {
  try {
    // Extract required data from the request body
    const { amount, cardNumber, expiration, cvv } = req.body;

    // Create a payload for the NMI request
    const payload = {
      apikey: 'b6F87GPCBSYujtQFW26583EM8H34vM5r', // Replace with your actual API key
      amount,
      ccnumber: cardNumber,
      ccexp: expiration,
      cvv,
      type: 'sale',
    };

    // Make a POST request to the NMI API endpoint
    const response = await axios.post(NMI_API_ENDPOINT, payload);

    // Handle the response from NMI API
    // Process the response data accordingly

    res.status(200).json({ message: 'Payment processed successfully', responseData: response.data });
  } catch (error) {
    // Handle any errors that occur during payment processing
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
