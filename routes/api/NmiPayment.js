var express = require("express");
var router = express.Router();
var NmiPayment = require("../../modals/NmiPayment");
var axios = require("axios");
var crypto = require("crypto");
var querystring = require("querystring");



// router.post("/purchase", async (req, res) => {
//   try {
//     // Extract necessary data from the request body
//     const { paymentDetails, planId } = req.body;

//     // Save the payment details to MongoDB
//     const nmiPayment = await NmiPayment.create({
//       first_name: paymentDetails.first_name,
//       last_name: paymentDetails.last_name,
//       email_name: paymentDetails.email_name,
//       card_number: paymentDetails.card_number,
//       amount: paymentDetails.amount,
//       expiration_date: paymentDetails.expiration_date,
//       cvv: paymentDetails.cvv,
//       tenantId: paymentDetails.tenantId,
//       propertyId: paymentDetails.propertyId,
//     });

//     // Save the payment details to the database

//     // Integrate with NMI transaction API to process the payment
//     const nmiConfig = {
//       recurring: "process_sale",
//       amount: paymentDetails.amount,
//       plan_id: planId,
//       security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
//     };

//     const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

//     // Check the response from NMI
//     // if (nmiResponse.response_code === "100") {
//     //   // Payment was successful
//     //   const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
//     //   console.log(successMessage);
//     //   res.status(200).send(successMessage);
//     //   await nmiPayment.save();
//     // } else {
//     //   // Payment failed
//     //   console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//     //   res
//     //     .status(400)
//     //     .send(`Failed to process payment: ${nmiResponse.responsetext}`);
//     // }
//     // Check the response from NMI
// // Check the response from NMI
// // Check the response from NMI
// // Check the response from NMI
// if (nmiResponse.response_code === "100") {
//   // Payment was successful
//   const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
//   console.log(successMessage);
//   await nmiPayment.save();
//   return res.status(200).json({
//     statusCode: 100,
//     message: successMessage,
//   });
// } else if (nmiResponse.response_code === "300") {
//   // Duplicate transaction
//   console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//   return res.status(200).json({
//     statusCode: 300,
//     message: `Failed to process payment: ${nmiResponse.responsetext}`,
//   });
// } else {
//   // Payment failed
//   console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//   return res.status(400).send(`Failed to process payment: ${nmiResponse.responsetext}`);
// }



//   } catch (error) {
//     // Handle errors
//     console.error("Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });


// // Helper function to send a request to the NMI API
// const sendNmiRequest = async (config, paymentDetails) => {
//   // Include the card number and expiration date in the request
//   config.ccnumber = paymentDetails.card_number;
//   config.ccexp = paymentDetails.expiration_date; // Assuming expiration_date is in the format MMYY

//   const postData = querystring.stringify(config);

//   const nmiConfig = {
//     method: "post",
//     url: "https://secure.nmi.com/api/transact.php",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     data: postData,
//   };

//   try {
//     const response = await axios(nmiConfig);
//     const parsedResponse = querystring.parse(response.data);

//     console.log("NMI API Response:", parsedResponse);

//     return parsedResponse;
//   } catch (error) {
//     console.error("NMI API Error:", error);
//     throw error;
//   }
// };


// ===========================================================================================================================

router.post("/purchase", async (req, res) => {
  try {
    // Extract necessary data from the request body
    const { paymentDetails, planId } = req.body;

    // Save the payment details to MongoDB
    const nmiPayment = await NmiPayment.create({
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email_name: paymentDetails.email_name,
      card_number: paymentDetails.card_number,
      amount: paymentDetails.amount,
      expiration_date: paymentDetails.expiration_date,
      cvv: paymentDetails.cvv,
      tenantId: paymentDetails.tenantId,
      propertyId: paymentDetails.propertyId,
    });

    // Save the payment details to the database

    // Integrate with NMI transaction API to process the payment
    const nmiConfig = {
      recurring: "process_sale",
      amount: paymentDetails.amount,
      plan_id: planId,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

    // Check the response from NMI
    // if (nmiResponse.response_code === "100") {
    //   // Payment was successful
    //   const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
    //   console.log(successMessage);
    //   res.status(200).send(successMessage);
    //   await nmiPayment.save();
    // } else {
    //   // Payment failed
    //   console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
    //   res
    //     .status(400)
    //     .send(`Failed to process payment: ${nmiResponse.responsetext}`);
    // }
    // Check the response from NMI
    // Check the response from NMI
    // Check the response from NMI
    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      // Payment was successful
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
      console.log(successMessage);
      await nmiPayment.save();
      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
      });
    } else if (nmiResponse.response_code === "200") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "201") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 201,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else {
      // Payment failed
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res
        .status(400)
        .send(`Failed to process payment: ${nmiResponse.responsetext}`);
    }
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Helper function to send a request to the NMI API
const sendNmiRequest = async (config, paymentDetails) => {
  // Include the card number and expiration date in the request
  config.ccnumber = paymentDetails.card_number;
  config.ccexp = paymentDetails.expiration_date; // Assuming expiration_date is in the format MMYY

  const postData = querystring.stringify(config);

  const nmiConfig = {
    method: "post",
    url: "https://secure.nmi.com/api/transact.php",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: postData,
  };

  try {
    const response = await axios(nmiConfig);
    const parsedResponse = querystring.parse(response.data);

    console.log("NMI API Response:", parsedResponse);

    return parsedResponse;
  } catch (error) {
    console.error("NMI API Error:", error);
    throw error;
  }
};


module.exports = router;
