//#region var
var express = require("express");
var router = express.Router();
var NmiPayment = require("../../modals/NmiPayment");
var Tenant = require("../../modals/Tenants");
var PaymentPlans = require("../../modals/PaymentPlans");
var AutoRecPayments = require("../../modals/AutoRecPayments");
var PaymentCharges = require("../../modals/AddPaymentAndCharge");
const auth = require("../../authentication");
var axios = require("axios");
var crypto = require("crypto");
var querystring = require("querystring");
//#endregion
// ===========================================================================================================================

// router.post("/purchase", async (req, res) => {
//   try {
//     // Extract necessary data from the request
//     const { paymentDetails, planId } = req.body;
//     // Save the payment details to MongoDB
//     const nmiPayment = await NmiPayment.create({
//       first_name: paymentDetails.first_name,
//       last_name: paymentDetails.last_name,
//       email_name: paymentDetails.email_name,
//       //paymentType: paymentDetails.paymentType,
//       card_number: paymentDetails.card_number,
//       amount: paymentDetails.amount,
//       expiration_date: paymentDetails.expiration_date,
//       cvv: paymentDetails.cvv,
//       // tenantId: paymentDetails.tenantId,
//       // propertyId: paymentDetails.propertyId,
//       // unitId: paymentDetails.unitId,
//     });

//     const nmiConfig = {
//       type: "sale",
//       payment: paymentType,
//       amount: paymentDetails.amount,
//       first_name: paymentDetails.first_name,
//       last_name: paymentDetails.last_name,
//       email: paymentDetails.email_name,
//       plan_id: planId,
//       security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
//     };

//     const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

//     // Check the response from NMI
//     if (nmiResponse.response_code === "100") {
//       // Payment was successful
//       const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
//      // const nmiPayments = new NmiPayment.push(paymentData);

//       await nmiPayment.save();

//       await NmiPayment.findOneAndUpdate(
//         { _id: nmiPayment._id },
//         { $set: { response: nmiResponse.response, ...otherFields } },
//         { new: true }
//        );
//       return res.status(200).json({
//         statusCode: 100,
//         message: successMessage,
//       });
//     } else if (nmiResponse.response_code === "200") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(200).json({
//         statusCode: 200,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "201") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(201).json({
//         statusCode: 201,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "202") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(202).json({
//         statusCode: 202,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "203") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(203).json({
//         statusCode: 203,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "204") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(204).json({
//         statusCode: 204,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "220") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(220).json({
//         statusCode: 220,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "221") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(221).json({
//         statusCode: 221,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "222") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(222).json({
//         statusCode: 222,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "223") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(223).json({
//         statusCode: 223,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "224") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(224).json({
//         statusCode: 224,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "225") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(225).json({
//         statusCode: 225,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "226") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(226).json({
//         statusCode: 226,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "240") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(240).json({
//         statusCode: 240,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "250") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(250).json({
//         statusCode: 250,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "251") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(251).json({
//         statusCode: 251,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "252") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(252).json({
//         statusCode: 252,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "253") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(253).json({
//         statusCode: 253,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "260") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(260).json({
//         statusCode: 260,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "261") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(261).json({
//         statusCode: 261,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "262") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(262).json({
//         statusCode: 262,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "263") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(263).json({
//         statusCode: 263,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "264") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(264).json({
//         statusCode: 264,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "300") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(300).json({
//         statusCode: 300,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "400") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(400).json({
//         statusCode: 400,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "410") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(410).json({
//         statusCode: 410,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "411") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(411).json({
//         statusCode: 411,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "420") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(420).json({
//         statusCode: 420,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "421") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(421).json({
//         statusCode: 421,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "430") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(430).json({
//         statusCode: 430,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "440") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(440).json({
//         statusCode: 440,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "441") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(441).json({
//         statusCode: 441,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "460") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(460).json({
//         statusCode: 460,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else if (nmiResponse.response_code === "461") {
//       // Duplicate transaction
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res.status(461).json({
//         statusCode: 461,
//         message: `Failed to process payment: ${nmiResponse.responsetext}`,
//       });
//     } else {
//       // Payment failed
//       console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
//       return res
//         .status(400)
//         .send(`Failed to process payment: ${nmiResponse.responsetext}`);
//     }
//   } catch (error) {
//     // Handle errors
//     console.error("Error:", error);
//     res.status(500).send(error);
//   }
// });

router.post("/sale", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails, planId } = req.body;

    const nmiConfig = {
      type: "sale",
      //payment: paymentDetails.paymentType,
      amount: paymentDetails.amount,
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email: paymentDetails.email_name,
      plan_id: planId,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

    // Save the payment details to MongoDB
    const nmiPayment = await NmiPayment.create({
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email_name: paymentDetails.email_name,
      //paymentType: paymentDetails.paymentType,
      card_number: paymentDetails.card_number,
      amount: paymentDetails.amount,
      expiration_date: paymentDetails.expiration_date,
      cvv: paymentDetails.cvv,
      // tenantId: paymentDetails.tenantId,
      // propertyId: paymentDetails.propertyId,
      // unitId: paymentDetails.unitId,
      response: nmiResponse.response,
      responsetext: nmiResponse.responsetext,
      authcode: nmiResponse.authcode,
      transactionid: nmiResponse.transactionid,
      avsresponse: nmiResponse.avsresponse,
      cvvresponse: nmiResponse.cvvresponse,
      type: nmiResponse.type,
      response_code: nmiResponse.response_code,
      cc_type: nmiResponse.cc_type,
      cc_exp: nmiResponse.cc_exp,
      cc_number: nmiResponse.cc_number,
    });

    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      // Payment was successful
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;

      await nmiPayment.save();

      await NmiPayment.findOneAndUpdate(
        { _id: nmiPayment._id },
        { $set: { response: nmiResponse.response, ...otherFields } },
        { new: true }
      );

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
      return res.status(201).json({
        statusCode: 201,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(202).json({
        statusCode: 202,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(203).json({
        statusCode: 203,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(204).json({
        statusCode: 204,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(220).json({
        statusCode: 220,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(221).json({
        statusCode: 221,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(222).json({
        statusCode: 222,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(223).json({
        statusCode: 223,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(224).json({
        statusCode: 224,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(225).json({
        statusCode: 225,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(226).json({
        statusCode: 226,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(240).json({
        statusCode: 240,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(250).json({
        statusCode: 250,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(251).json({
        statusCode: 251,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(252).json({
        statusCode: 252,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(253).json({
        statusCode: 253,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(260).json({
        statusCode: 260,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(261).json({
        statusCode: 261,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(262).json({
        statusCode: 262,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(263).json({
        statusCode: 263,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(264).json({
        statusCode: 264,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(300).json({
        statusCode: 300,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(400).json({
        statusCode: 400,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(410).json({
        statusCode: 410,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(411).json({
        statusCode: 411,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(420).json({
        statusCode: 420,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(421).json({
        statusCode: 421,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(430).json({
        statusCode: 430,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(440).json({
        statusCode: 440,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(441).json({
        statusCode: 441,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(460).json({
        statusCode: 460,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(461).json({
        statusCode: 461,
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
    res.status(500).send(error);
  }
});

router.get("/nmipayments", async (req, res) => {
  try {
    // Retrieve all NmiPayment records from the database
    const nmipayments = await NmiPayment.find();

    // Return the retrieved data as JSON
    res.status(200).json({
      statusCode: 200,
      data: nmipayments,
    });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

router.get("/nmipayments/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const nmipayment = await NmiPayment.findById(id);

    if (nmipayment) {
      res.status(200).json({
        statusCode: 200,
        data: nmipayment,
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: `NmiPayment with ID ${id} not found`,
      });
    }
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

router.put('/updatepayment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate updateData based on your requirements

    // Use findByIdAndUpdate to update the document by ID
    const updatedNmiPayment = await NmiPayment.findByIdAndUpdate(id, updateData, { new: true });

    if (updatedNmiPayment) {
      // Return the updated document
      res.status(200).json({
        statusCode: 200,
        message: 'NmiPayment updated successfully',
        data: updatedNmiPayment,
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'NmiPayment not found',
      });
    }
  } catch (error) {
    console.error('Error updating NmiPayment:', error);
    res.status(500).send(error);
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { transactionId, amount, paymentType } = req.body;

    if (!transactionId || !amount || !paymentType) {
      return sendResponse(res, "Missing required parameters.", 400);
    }

    const nmiConfig = {
      type: "refund",
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      transactionid: transactionId,
      amount: amount,
      payment: paymentType,
    };

    const nmiResponse = await sendNmiRequestrefund(nmiConfig);

    if (nmiResponse.response_code === "100") {
      // Refund successful
      const successMessage = `Refund processed successfully! Transaction ID: ${nmiResponse.transactionid}`;
      console.log(successMessage);
      return sendResponse(res, successMessage, 200);
    } else {
      // Refund failed
      console.log(`Failed to process refund: ${nmiResponse.responsetext}`);
      return sendResponse(
        res,
        `Failed to process refund: ${nmiResponse.responsetext}`,
        400
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, "Something went wrong!", 500);
  }
});

router.post("/void", async (req, res) => {
  try {
    const { transactionId, paymentType } = req.body;

    if (!transactionId || !paymentType) {
      return sendResponse(res, "Missing required parameters.", 400);
    }

    const nmiConfig = {
      type: "update",
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      transactionid: transactionId,
      payment: paymentType,
    };

    const nmiResponse = await sendNmiRequestrefund(nmiConfig);

    if (nmiResponse.response_code === "100") {
      // Void successful
      const successMessage = `Void processed successfully! Transaction ID: ${nmiResponse.transactionid}`;
      console.log(successMessage);
      return sendResponse(res, successMessage, 200);
    } else {
      // Void failed
      console.log(`Failed to process void: ${nmiResponse.responsetext}`);
      return sendResponse(
        res,
        `Failed to process void: ${nmiResponse.responsetext}`,
        400
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, "Something went wrong!", 500);
  }
});

router.post("/update", async (req, res) => {
  try {
    const { updateData, transactionId } = req.body;

    if (!updateData || !transactionId) {
      return sendResponse(res, "Missing required parameters.", 400);
    }

    const nmiConfig = {
      type: "update", // Update operation (replace with the actual operation)
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      transactionid: transactionId,
      // Add other parameters specific to your update operation
      ...updateData,
    };

    const nmiResponse = await sendNmiRequestrefund(nmiConfig);

    if (nmiResponse.response_code === "100") {
      // Update successful
      const successMessage = `Update processed successfully! Transaction ID: ${nmiResponse.transactionid}`;
      console.log(successMessage);
      return sendResponse(res, successMessage, 200);
    } else {
      // Update failed
      console.log(`Failed to process update: ${nmiResponse.responsetext}`);
      return sendResponse(
        res,
        `Failed to process update: ${nmiResponse.responsetext}`,
        400
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, "Something went wrong!", 500);
  }
});

// Utility function to send NMI requests
async function sendNmiRequestrefund(config) {
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
    return querystring.parse(response.data);
  } catch (error) {
    console.error("NMI API error:", error.message);
    throw new Error("Error processing NMI request.");
  }
}

// Helper function to send a request to the NMI API
const sendNmiRequest = async (config, paymentDetails) => {
  // Include the card number and expiration date in the request
  config.ccnumber = paymentDetails.card_number;
  config.ccexp = paymentDetails.expiration_date;

  const postData = querystring.stringify(config);

  const nmiConfig = {
    method: "post",
    url: "https://secure.networkmerchants.com/api/transact.php",
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

router.post("/add-plan", async (req, res) => {
  try {
    console.log("API hitt start");
    const {
      security_key,
      recurring,
      planPayments,
      planAmount,
      planName,
      planId,
      dayFrequency,
      billingCycle,
      // termsConditions,
      // earlyCancellationFee,
      // dueChargeMethod,
      chargeAmount,
      // allowMemberChangePlan,
      // allowMemberCancelBilling,
      // allowMemberPauseBilling,
    } = req.body;

    let postData = {
      recurring: "add_plan",
      plan_payments: planPayments,
      plan_amount: planAmount,
      plan_name: planName,
      plan_id: planId,
      day_frequency: dayFrequency ? dayFrequency : 30,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    postData = querystring.stringify(postData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: postData,
    };

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);

        if (parsedResponse.response_code == 100) {
          const newPaymentPlan = await PaymentPlans.create({
            planId,
            planName,
            planAmount,
            planPayments,
            chargeDayFrequency: dayFrequency,
            billingCycle,
            // planTermsAndConditions: termsConditions,
            // earlyCancellationFee,
            // dueChargeMethod,
            chargeAmount,
            // allowMemberChangePlan,
            // allowMemberCancelBilling,
            // allowMemberPauseBilling,
          });

          const paymentPlanSaved = await newPaymentPlan.save();
          console.log("API hitt End");

          if (paymentPlanSaved)
            sendResponse(res, "Payment plan added successfully.");
          else sendResponse(res, "Failed to add payment plan!", 400);
        } else sendResponse(res, parsedResponse.responsetext, 403);
        console.log("parsedResponse.responsetext", parsedResponse.responsetext);
      })
      .catch(function (error) {
        //console.log("for 500", res);

        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//custom create subscription NMI API
router.post("/custom-add-subscription", async (req, res) => {
  try {
    console.log("................started...............");
    const {
      security_key,
      recurring,
      plan_payments,
      //planName,
      //planId,
      plan_amount,
      dayFrequency,
      ccnumber,
      ccexp,
      first_name,
      last_name,
      address,
      email,
      // start_date,
      // city,
      // state,
      // zip,
      /* Other necessary parameters for subscription */
    } = req.body;

    let postData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      recurring: "add_subscription",
      plan_payments,
      //plan_name: planName,
      //plan_id: planId,
      plan_amount,
      day_frequency: dayFrequency ? dayFrequency : 30,
      ccnumber,
      email,
      ccexp,
      first_name: first_name,
      last_name: last_name,
      address1: address,
      // next_charge_date: nextDue_date,
      // start_date: start_date,
      // city: city,
      // state: state,
      // zip: zip,
      /* Include other necessary parameters for subscription */
    };
    console.log("...........postData..........", postData);

    postData = querystring.stringify(postData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: postData,
    };
    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        // console.log("ek ek krne", parsedResponse);
        if (parsedResponse.response_code == 100) {
          // Handle successful subscription creation
          sendResponse(
            res,
            `Custom subscription added successfully. TransactionId:` +
              parsedResponse.transactionid
          );
        } else {
          // Handle subscription creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//custom update subscription NMI API
router.post("/custom-update-subscription", async (req, res) => {
  try {
    const {
      security_key,
      subscription_id,
      plan_payments,
      plan_amount,
      dayFrequency,
      ccnumber,
      ccexp,
      first_name,
      last_name,
      address,
      email,
    } = req.body;

    let postData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      recurring: "update_subscription",
      subscription_id: subscription_id,
      day_frequency: dayFrequency ? dayFrequency : 30,
      first_name,
      address1: address,
    };

    // Update specific fields if provided in the request
    if (plan_payments !== undefined) postData.plan_payments = plan_payments;
    if (plan_amount !== undefined && parseFloat(plan_amount) > 0)
      postData.plan_amount = plan_amount;
    if (ccnumber !== undefined) postData.ccnumber = ccnumber;
    if (email !== undefined) postData.email = email;
    if (ccexp !== undefined) postData.ccexp = ccexp;
    if (last_name !== undefined) postData.last_name = last_name;

    postData = querystring.stringify(postData);

    const config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: postData,
    };

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          sendResponse(res, "Custom subscription updated successfully.");
        } else {
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//custom delete subscription NMI API
router.post("/custom-delete-subscription", async (req, res) => {
  try {
    const { security_key, subscription_id } = req.body;

    let postData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      recurring: "delete_subscription",
      subscription_id: subscription_id,
    };

    postData = querystring.stringify(postData);
    console.log("mansi -------------", postData);
    const config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: postData,
    };

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful subscription deletion
          sendResponse(res, "Custom subscription deleted successfully.");
        } else {
          // Handle subscription deletion failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//create customer vault NMI API
router.post("/create-customer-vault", async (req, res) => {
  try {
    const {
      security_key,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "add_billing",
      customer_vault_id: 794813587,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    };

    customerData = querystring.stringify(customerData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer creation
          sendResponse(res, "Customer vault created successfully.");
        } else {
          // Handle customer creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//update customer vault NMI API
router.post("/update-customer-vault", async (req, res) => {
  try {
    const {
      security_key,
      customer_vault_id,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "update_customer",
      customer_vault_id,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    };

    customerData = querystring.stringify(customerData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer creation
          sendResponse(res, "Customer vault updated successfully.");
        } else {
          // Handle customer creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//delete customer vault NMI API
router.post("/delete-customer-vault", async (req, res) => {
  try {
    const { security_key, customer_vault_id } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "delete_customer",
      customer_vault_id,
    };

    customerData = querystring.stringify(customerData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer creation
          sendResponse(res, "Customer vault deleted successfully.");
        } else {
          // Handle customer creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//get customer vault NMI API
router.post("/get-customer-vault", async (req, res) => {
  try {
    const { security_key, customer_vault_id } = req.body;

    const requestData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r", // Replace with your actual NMI security key
      customer_vault: "get_customer",
      customer_vault_id,
    };

    const config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify(requestData),
    };

    const response = await axios(config);
    const parsedResponse = querystring.parse(response.data);

    console.log("NMI API Response:", parsedResponse);

    if (parsedResponse.response_code == 100) {
      // Handle successful retrieval of customer data
      const customerData = {
        first_name: parsedResponse.first_name,
        last_name: parsedResponse.last_name,
        // ... other fields
      };

      sendResponse(res, customerData);
    } else {
      // Handle failure to retrieve customer data
      console.error("NMI API Error:", parsedResponse);
      sendResponse(res, parsedResponse.responsetext, 403);
    }
  } catch (error) {
    console.error("Server Error:", error);
    sendResponse(res, "Something went wrong!", 500);
  }
});

//create customer vault billing NMI API
router.post("/create-customer-billing", async (req, res) => {
  try {
    const {
      security_key,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      customer_vault_id,
      billing_id,
    } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "add_billing",
      billing_id,
      customer_vault_id,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    };

    customerData = querystring.stringify(customerData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer creation
          sendResponse(res, "Customer vault billing created successfully.");
        } else {
          // Handle customer creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//update customer vault billing NMI API
router.post("/update-customer-billing", async (req, res) => {
  try {
    const {
      security_key,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      customer_vault_id,
      billing_id,
    } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "update_billing",
      customer_vault_id,
      billing_id,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    };

    customerData = querystring.stringify(customerData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer creation
          sendResponse(res, "Customer vault billing updated successfully.");
        } else {
          // Handle customer creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//delete customer vault billing NMI API
router.post("/delete-customer-billing", async (req, res) => {
  try {
    const { security_key, customer_vault_id, billing_id } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "delete_billing",
      customer_vault_id,
      billing_id,
    };

    customerData = querystring.stringify(customerData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer creation
          sendResponse(res, "Customer vault billing deleted successfully.");
        } else {
          // Handle customer creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

router.post("/add-customer-and-subscription", async (req, res) => {
  try {
    const {
      security_key,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      plan_payments,
      plan_amount,
      planName,
      /* Other necessary parameters for both customer and subscription creation */
    } = req.body;

    let customerAndSubscriptionData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      recurring: "add_subscription",
      customer_vault: "add_customer",
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      plan_payments,
      plan_amount,
      plan_name: planName,
      /* Include other necessary parameters for both actions */
    };

    customerAndSubscriptionData = querystring.stringify(
      customerAndSubscriptionData
    );

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: customerAndSubscriptionData,
    };
    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        if (parsedResponse.response_code == 100) {
          // Handle successful customer and subscription creation
          sendResponse(res, "Customer and subscription added successfully.");
        } else {
          // Handle creation failure
          sendResponse(res, parsedResponse.responsetext, 403);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

function webhookIsVerified(webhookBody, signingKey, nonce, sig) {
  const calculatedSig = crypto
    .createHmac("sha256", signingKey)
    .update(`${nonce}.${webhookBody}`)
    .digest("hex");
  return sig === calculatedSig;
}

router.post("/nmi", async (req, res) => {
  try {
    const signingKey = "CC8775A4CFD933614985209F6F68768B";
    const webhookBody = JSON.stringify(req.body); // Assuming body is JSON
    const sigHeader = req.headers["webhook-signature"];

    if (!sigHeader || sigHeader.length < 1) {
      throw new Error("Invalid webhook - signature header missing");
    }

    const sigMatches = sigHeader.match(/t=(.*),s=(.*)/);
    if (!sigMatches || sigMatches.length !== 3) {
      throw new Error("Unrecognized webhook signature format");
    }

    const nonce = sigMatches[1];
    const signature = sigMatches[2];

    if (!webhookIsVerified(webhookBody, signingKey, nonce, signature)) {
      throw new Error(
        "Invalid webhook - invalid signature, cannot verify sender"
      );
    }

    // Webhook is now verified to have been sent by you, continue processing
    console.log("Webhook is verified");
    const webhook = req.body; // Assuming JSON payload
    console.log("webhookBody------------", webhook);
    if (webhook.event_type === "recurring.subscription.add") {
      //console.log("successfully update recurring subscription");
      // const gymOwner = await User.findOne({nmiSubscriptionId: parsedWebhook.event_body.subscription_id})
      // if(gymOwner) {

      const payment = await AutoRecPayments.create({
        // gymId: gymOwner.parentId,
        // paymentplanId: gymOwner.nmiplanId,
        // memberId: gymOwner._id,
        nmisubscriptionId: req.body.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging added",
        amount: webhook.event_body.plan.amount,
      });
      console.log("payment is here : ", payment);
      console.log("req.body is here : ", req.body);
      // console.log("email from NMI resp: ", webhook.event_body.email);
      //Save payment details of the user in payment collection
      await payment.save();
      // Update Tenant record with the subscription ID
      //  const tenant_email = webhook.event_body.billing_address.email;
      //  const rental = webhook.event_body.billing_address.address1;
      //  const unit = webhook.event_body.billing_address.address2;
      //  const subscription_id = req.body.event_body.subscription_id;

      //  const updatedTenant = await Tenant.findOneAndUpdate(
      //    {
      //      tenant_email: tenant_email,
      //      'entries.rental_adress': rental,
      //      'entries.rental_units': unit
      //    },
      //    {
      //      $set: {
      //        'entries.$.subscription_id': subscription_id
      //      }
      //    },
      //    { new: true }
      //  );

      //update user payment status to true
      // await User.findOneAndUpdate(
      //     {
      //         nmiSubscriptionId: parsedWebhook.event_body.subscription_id,
      //         userRole: ROLE_MEMBER
      //     },
      //     {
      //         paymentStatus: true
      //     }
      //   );
      // }
    } else if (webhook.event_type === "recurring.subscription.update") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging subscription update",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.subscription.delete") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging subscription delete",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.plan.add") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging plan add",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.plan.update") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging plan update",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "recurring.plan.delete") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging plan delete",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.auth.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction auth failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.auth.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction auth success",
        amount: webhook.event_body.plan.amount,
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.auth.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction auth unknown",
        amount: webhook.event_body.plan.amount,
      });

      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.capture.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction capture success",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.capture.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction capture failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.capture.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction capture unknown",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.credit.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction credit success",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.credit.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction credit failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.credit.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction credit unknown",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "settlement.batch.complete") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging settlement batch complete",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "settlement.batch.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging settlement batch failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.sale.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction sale failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.sale.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction sale success",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.sale.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction sale unknown",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.void.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction void success",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.void.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction void failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.void.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction void unknown",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.refund.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction refund success",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.refund.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction refund failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.refund.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction refund unknown",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.validate.success") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction validate success",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.validate.failure") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction validate failure",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "transaction.validate.unknown") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging transaction validate unknown",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    } else if (webhook.event_type === "chargeback.batch.complete") {
      const payment = await AutoRecPayments.create({
        nmisubscriptionId: webhook.event_body.subscription_id,
        email: webhook.event_body.billing_address.email,
        description: "Recurring charging chargeback batch complete",
        amount: webhook.event_body.plan.amount,
      });
      //Save payment details of the user in payment collection
      await payment.save();
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

router.post("/nmis", async (req, res) => {
  try {
    console.log("yay...!!!");
    const signingKey = "CC8775A4CFD933614985209F6F68768B";
    const webhookBody = req.body;
    const sigHeader = req.get("Webhook-Signature");
    console.log("event type :", webhookBody.event_type);
    console.log("req body", sigHeader);
    if (webhookBody.event_type === "recurring.subscription.add") {
      console.log("sigHeader", sigHeader);
      console.log("webhookBody data:", webhookBody.event_type);
    }

    if (!sigHeader || sigHeader.length < 1) {
      res.status(400).send("invalid webhook - signature header missing");
      return;
    }

    const match = sigHeader.match(/t=(.*),s=(.*)/);
    if (!match) {
      res.status(400).send("unrecognized webhook signature format");
      return;
    }

    const nonce = match[1];
    const signature = match[2];
    console.log("SIG->", signingKey, nonce, signature);

    if (
      !webhookIsVerified(
        JSON.stringify(webhookBody),
        signingKey,
        nonce,
        signature
      )
    ) {
      console.log("invalid webhook - invalid signature, cannot verify sender");
      res
        .status(400)
        .send("invalid webhook - invalid signature, cannot verify sender");
      return;
    }
    console.log("yay2...!!!");
    console.log("yay here is response : ", webhookBody);

    // Webhook is now verified to have been sent by us, continue processing
    // const parsedWebhook = webhookBody;
    // if (parsedWebhook.event_type === "recurring.subscription.update") {
    //   console.log("successfully update recurring subscription");
    //   const gymOwner = await User.findOne({
    //     nmiSubscriptionId: parsedWebhook.event_body.subscription_id,
    //   });

    // if (gymOwner) {
    //   const payment = await Payment.create({
    //     gymId: gymOwner.parentId,
    //     paymentplanId: gymOwner.nmiplanId,
    //     memberId: gymOwner._id,
    //     email: parsedWebhook.event_body.email,
    //     description: "Recurring charging",
    //     amount: parsedWebhook.event_body.plan.amount,
    //   });

    //Save payment details of the user in payment collection
    // await payment.save();

    //update user payment status to true
    // await User.findOneAndUpdate(
    //   {
    //     nmiSubscriptionId: parsedWebhook.event_body.subscription_id,
    //     userRole: ROLE_MEMBER,
    //   },
    //   {
    //     paymentStatus: true,
    //   }
    // );
    //}
    // }

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.log("Error:", error);
  }
});

// const webhookIsVerified = (webhookBody, signingKey, nonce, sig) => {
//   const hashedSignature = crypto
//     .createHmac("sha256", signingKey)
//     .update(nonce + "." + webhookBody)
//     .digest("hex");
//   return sig === hashedSignature;
// };

// router.post("/custom-add-subscription", async (req, res) => {
//   try {
//     const {
//       planId,
//       start_date,
//       ccnumber,
//       ccexp,
//       cvv,
//       firstName,
//       lastName,
//       address,
//       city,
//       state,
//       zip,
//       paymentToken,
//     } = req.body;

//     const currentDate = moment();
//     // Add 1 day to the current date
//     const nextDay = currentDate.add(1, "days");
//     // Format the date as YYYYMMDD
//     const futureDate = nextDay.format("YYYYMMDD");

//     //if (!planId) errorMsg = "Plan id required!";
//     // else if(!ccnumber) errorMsg = "Card required!";
//     // else if(!ccexp) errorMsg = "Card expiry required!";
//     // else if(!cvv) errorMsg = "Card CVV number required!";
//     //else if (!paymentToken) errorMsg = "Payment token required!";

//     let postData = {
//       recurring: "add_subscription",
//       plan_id: planId,
//       start_date: futureDate,
//       payment_token: paymentToken,
//       security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
//     };

//     // Set billing information
//     let billingInfo = {
//       first_name: firstName,
//       last_name: lastName,
//       address1: address,
//       city: city,
//       state: state,
//       zip: zip,
//     };

//     let customerData = {
//       ccnumber: ccnumber,
//       ccexp: ccexp,
//       cvv: cvv,
//       first_name: firstName,
//       last_name: lastName,
//       address1: address,
//       city: city,
//       state: state,
//       zip: zip,
//       //security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r"
//     };

//     // customerData = querystring.stringify(customerData)

//     // const customerResult = await createCustomerInVault(customerData);

//     // if(customerResult.response_code == 100) {
//     // Merge together all request options into one object
//     Object.assign(postData, billingInfo);

//     postData = querystring.stringify(postData);

//     var config = {
//       method: "post",
//       url: "https://secure.nmi.com/api/transact.php",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       data: postData,
//     };

//     // axios(config)
//     //   .then(async (response) => {
//     //     const parsedResponse = querystring.parse(response.data);
//     //     if (parsedResponse.response_code == 100) {
//     //       const paymentPlanId = await paymentPlans.findOne({
//     //         gymId: gymId.parentId,
//     //         planId,
//     //       });
//     //       await User.findByIdAndUpdate(
//     //         {
//     //           _id: user.userId,
//     //         },
//     //         {
//     //           nmiplanId: paymentPlanId._id,
//     //           nmiSubscriptionId: parsedResponse.subscription_id,
//     //           paymentStatus: false,
//     //           // nmiCustomerId: customerResult.customer_vault_id
//     //         }
//     //       );

//     //       sendResponse(res, "Subscription added successfully.");
//     //     } else
//     //       sendResponse(res, parsedResponse.responsetext, HTTP_CODE_403);
//     //   })
//     //   .catch(function (error) {
//     //     sendResponse(res, error, HTTP_CODE_500);
//     //   });
//     // } else return sendResponse(res, "Error creating member subscription", HTTP_CODE_403)
//   } catch (error) {
//     sendResponse(res, "Something went wrong!", HTTP_CODE_500);
//   }
// });

// function webhookIsVerified(webhookBody, signingKey, nonce, sig) {
//   const calculatedSig = crypto.createHmac('sha256', signingKey)
//     .update(`${nonce}.${webhookBody}`)
//     .digest('hex');
//   return sig === calculatedSig;
// }

// router.post("/nmi", (req, res) => {
//   try {
//     const signingKey = 'CC8775A4CFD933614985209F6F68768B';
//     const webhookBody = JSON.stringify(req.body); // Assuming body is JSON
//     const sigHeader = req.headers['webhook-signature'];

//     if (!sigHeader || sigHeader.length < 1) {
//       throw new Error('Invalid webhook - signature header missing');
//     }

//     const sigMatches = sigHeader.match(/t=(.*),s=(.*)/);
//     if (!sigMatches || sigMatches.length !== 3) {
//       throw new Error('Unrecognized webhook signature format');
//     }

//     const nonce = sigMatches[1];
//     const signature = sigMatches[2];

//     if (!webhookIsVerified(webhookBody, signingKey, nonce, signature)) {
//       throw new Error('Invalid webhook - invalid signature, cannot verify sender');
//     }

//     // Webhook is now verified to have been sent by you, continue processing
//     console.log('Webhook is verified');
//     const webhook = req.body; // Assuming JSON payload
//     console.log(webhook);

//     res.status(200).send('Webhook processed successfully');
//   } catch (error) {
//     console.error('Error handling webhook:', error);
//     res.status(500).send('Error processing webhook');
//   }

// });

const sendResponse = (res, data, status = 200) => {
  if (status !== 200) {
    data = {
      error: data,
    };
  }
  res.status(status).json({
    status,
    data,
  });
};

//pause tenants subscription
router.post("/paused-subscription/:id", async (req, res) => {
  try {
    console.log("hitt");
    const { pausedSubscription } = req.body;
    const subscriptionId = req.params.id;
    console.log("sahil ajmeri...", subscriptionId, pausedSubscription);

    // Assuming STATUS_ACTIVE, HTTP_CODE_403, and HTTP_CODE_500 are defined constants
    // const checkKeysExists = await User.findOne({
    //   _id: user.userId,
    //   userStatus: STATUS_ACTIVE,
    // });

    // if (checkKeysExists && checkKeysExists.nmiPrivateKey) {
    let postData = {
      recurring: "update_subscription",
      subscription_id: subscriptionId,
      paused_subscription: false,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    postData = querystring.stringify(postData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: postData,
    };

    const response = await axios(config);

    const parsedResponse = querystring.parse(response.data);
    if (parsedResponse.response_code == 100) {
      sendResponse(res, "Subscription updated successfully.");
    } else {
      sendResponse(res, parsedResponse.responsetext, HTTP_CODE_403);
    }
    // } else {
    //   sendResponse(
    //     res,
    //     "NMI Payment gateway keys are missing. Contact support admin.",
    //     HTTP_CODE_403
    //   );
    // }
  } catch (error) {
    sendResponse(res, "Something went wrong!", HTTP_CODE_500);
  }
});

module.exports = router;
