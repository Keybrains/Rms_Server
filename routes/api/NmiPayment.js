var express = require("express");
var router = express.Router();
var NmiPayment = require("../../modals/NmiPayment");
var PaymentPlans = require("../../modals/PaymentPlans");
var axios = require("axios");
var crypto = require("crypto");
var querystring = require("querystring");

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
    console.log("API hitt middle", config);

    axios(config)
      .then(async (response) => {
        const parsedResponse = querystring.parse(response.data);
        console.log("parsedResponse", parsedResponse);

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

router.post("/custom-add-subscription", async (req, res) => {
  try {
    const {
      planId,
      start_date,
      ccnumber,
      ccexp,
      cvv,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      paymentToken,
    } = req.body;

    const currentDate = moment();
    // Add 1 day to the current date
    const nextDay = currentDate.add(1, "days");
    // Format the date as YYYYMMDD
    const futureDate = nextDay.format("YYYYMMDD");

    //if (!planId) errorMsg = "Plan id required!";
    // else if(!ccnumber) errorMsg = "Card required!";
    // else if(!ccexp) errorMsg = "Card expiry required!";
    // else if(!cvv) errorMsg = "Card CVV number required!";
    //else if (!paymentToken) errorMsg = "Payment token required!";

    let postData = {
      recurring: "add_subscription",
      plan_id: planId,
      start_date: futureDate,
      payment_token: paymentToken,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    // Set billing information
    let billingInfo = {
      first_name: firstName,
      last_name: lastName,
      address1: address,
      city: city,
      state: state,
      zip: zip,
    };

    let customerData = {
      ccnumber: ccnumber,
      ccexp: ccexp,
      cvv: cvv,
      first_name: firstName,
      last_name: lastName,
      address1: address,
      city: city,
      state: state,
      zip: zip,
      //security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r"
    };

    // customerData = querystring.stringify(customerData)

    // const customerResult = await createCustomerInVault(customerData);

    // if(customerResult.response_code == 100) {
    // Merge together all request options into one object
    Object.assign(postData, billingInfo);

    postData = querystring.stringify(postData);

    var config = {
      method: "post",
      url: "https://secure.nmi.com/api/transact.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: postData,
    };

    // axios(config)
    //   .then(async (response) => {
    //     const parsedResponse = querystring.parse(response.data);
    //     if (parsedResponse.response_code == 100) {
    //       const paymentPlanId = await paymentPlans.findOne({
    //         gymId: gymId.parentId,
    //         planId,
    //       });
    //       await User.findByIdAndUpdate(
    //         {
    //           _id: user.userId,
    //         },
    //         {
    //           nmiplanId: paymentPlanId._id,
    //           nmiSubscriptionId: parsedResponse.subscription_id,
    //           paymentStatus: false,
    //           // nmiCustomerId: customerResult.customer_vault_id
    //         }
    //       );

    //       sendResponse(res, "Subscription added successfully.");
    //     } else
    //       sendResponse(res, parsedResponse.responsetext, HTTP_CODE_403);
    //   })
    //   .catch(function (error) {
    //     sendResponse(res, error, HTTP_CODE_500);
    //   });
    // } else return sendResponse(res, "Error creating member subscription", HTTP_CODE_403)
  } catch (error) {
    sendResponse(res, "Something went wrong!", HTTP_CODE_500);
  }
});

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

module.exports = router;
