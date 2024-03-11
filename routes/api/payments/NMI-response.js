var express = require("express");
var router = express.Router();
// var NmiPayment1 = require("../../../modals/payment/NMI-response");
// var NmiPayment = require("../../../modals/payment/Payment");
// var NmiPayment2 = require("../../../modals/payment/Refund");
var axios = require("axios");
var moment = require("moment");
var querystring = require("querystring");
const { DOMParser } = require("xmldom");
const nodemailer = require("nodemailer");
const Payment = require("../../../modals/payment/Payment");
const Tenant = require("../../../modals/superadmin/Tenant");

const transporter = nodemailer.createTransport({
  host: "smtp.sparkpostmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "SMTP_Injection",
    pass: "3a634e154f87fb51dfd179b5d5ff6d771bf03240",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//Logic function to convert XML file to JSON
const convertToJson = (data) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");

    const jsonResult = xmlToJson(xmlDoc);
    return jsonResult;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return { error: "Error converting XML to JSON" };
  }
};

const xmlToJson = (xml) => {
  let result = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      result["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        result["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3 && xml.nodeValue.trim() !== "") {
    result = xml.nodeValue.trim();
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;

      if (nodeName === "#text") {
        const textValue = item.nodeValue.trim();
        if (textValue !== "") {
          return textValue;
        }
      } else {
        if (typeof result[nodeName] === "undefined") {
          result[nodeName] = xmlToJson(item);
        } else {
          if (typeof result[nodeName].push === "undefined") {
            const old = result[nodeName];
            result[nodeName] = [];
            if (old !== "") {
              result[nodeName].push(old);
            }
          }
          const childResult = xmlToJson(item);
          if (childResult !== "") {
            result[nodeName].push(childResult);
          }
        }
      }
    }
  }

  return result;
};

//Response function
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

// Helper function to send a request to the NMI API
const sendNmiRequest = async (config, paymentDetails) => {
  // Include the card number and expiration date in the request
  // config.ccnumber = paymentDetails.card_number;
  // config.ccexp = paymentDetails.expiration_date;

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
      company,
      billing_id,
    } = req.body;

    let customerData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault: "add_customer",
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
      company,
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
          const info = await transporter.sendMail({
            from: '"302 Properties" <info@cloudpress.host>',
            to: req.body.email,
            subject: "Cusromer Vault - 302 Properties",
            html: `     
              <p>Hello ${req.body.first_name} ${req.body.last_name},</p>
              
              <p>Thank you for sharing your card details! We are delighted to confirm that your customer vault has been successfully created.</p>
          
               
                  <li><strong>Customer Vault Id:</strong> ${parsedResponse.customer_vault_id}</li>
                  <li><strong>Billing Id:</strong> ${req.body.billing_id}</li>
               
          
                  <p>If you have any questions or concerns regarding your vault, please feel free to contact our customer support.</p>
                  
                  <p>Thank you for choosing 302 Properties.</p>
                  
                  <p>Best regards,<br>The 302 Properties Team</p>
                  `,
          });
          sendResponse(res, parsedResponse);
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
      // ccnumber,
      // ccexp,
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
      // ccnumber,
      // ccexp,
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
    const { customer_vault_id } = req.body;

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
      company,
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
      company,
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
        console.log("pppppppppppppp", parsedResponse);
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

//get multiple billing records from customer vault NMI API
router.post("/get-billing-customer-vault", async (req, res) => {
  try {
    const { customer_vault_id } = req.body;

    if (!customer_vault_id) {
      sendResponse(
        res,
        { status: 400, error: "Invalid or missing customer_vault_id" },
        400
      );
      return;
    }

    const securityKey = "b6F87GPCBSYujtQFW26583EM8H34vM5r";

    const postData = {
      security_key: securityKey,
      customer_vault_id,
      report_type: "customer_vault",
      ver: 2,
    };

    const config = {
      method: "post",
      url: "https://hms.transactiongateway.com/api/query.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify(postData),
    };

    console.log(
      "API request for customer_vault_id",
      customer_vault_id,
      ":",
      config
    );

    const response = await axios(config);

    const jsonResult = convertToJson(response.data);

    if (jsonResult.nm_response.customer_vault) {
      sendResponse(res, jsonResult.nm_response.customer_vault);
    } else {
      sendResponse(res, {
        status: 404,
        error: "No valid customer vault record found",
      });
    }
  } catch (error) {
    console.error("Error processing customer vault record:", error);
    sendResponse(res, { status: 500, error: "Internal server error" }, 500);
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

router.post("/sale", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails, planId } = req.body;

    const nmiConfig = {
      type: "sale",
      //payment: paymentDetails.paymentType,
      customer_vault_id: paymentDetails.customer_vault_id,
      billing_id: paymentDetails.billing_id,
      address1: paymentDetails.property,
      amount: paymentDetails.amount,
      surcharge: paymentDetails.surcharge,
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email: paymentDetails.email_name,
      plan_id: planId,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      // Payment was successful
      const info = await transporter.sendMail({
        from: '"302 Properties" <info@cloudpress.host>',
        to: paymentDetails.email_name,
        subject: "Payment Confirmation - 302 Properties",
        html: `     
            <p>Hello ${paymentDetails.first_name} ${paymentDetails.last_name},</p>
      
            <p>Thank you for your payment! We are delighted to confirm that your payment has been successfully processed.</p>
      
            <strong>Transaction Details:</strong>
            <ul>
              <li><strong>Property:</strong> ${paymentDetails.property}</li>
              <li><strong>Transaction ID:</strong> ${nmiResponse.transactionid}</li>
              <li><strong>Amount Paid:</strong> $ ${paymentDetails.amount}</li>
              <li><strong>Payment Date:</strong> ${paymentDetails.date}</li>
            </ul>
      
            <p>If you have any questions or concerns regarding your payment, please feel free to contact our customer support.</p>
      
            <p>Thank you for choosing 302 Properties.</p>
      
            <p>Best regards,<br>The 302 Properties Team</p>
          `,
      });
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;

      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "200") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "201") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
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

router.post("/update_sale/:id", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails, planId } = req.body;
    const tenant_data = await Tenant.findOne({
      tenant_id: paymentDetails.tenant_id,
    });

    const nmiConfig = {
      type: "sale",
      //payment: paymentDetails.paymentType,
      customer_vault_id: paymentDetails.customer_vault_id,
      billing_id: paymentDetails.billing_id,
      amount: paymentDetails.total_amount,
      surcharge: paymentDetails.surcharge,
      first_name: tenant_data.tenant_firstName,
      last_name: tenant_data.tenant_lastName,
      email: tenant_data.tenant_email,
      plan_id: planId,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

    const existingRecord = await Payment.findOne({ payment_id: req.params.id });

    if (!existingRecord) {
      return res.status(404).json({
        statusCode: 404,
        message: "Record not found",
      });
    }
    // Update fields with NMI response
    existingRecord.response = nmiResponse.responsetext;
    // existingRecord.responsetext = nmiResponse.responsetext;
    // existingRecord.authcode = nmiResponse.authcode;
    existingRecord.transaction_id = nmiResponse.transactionid;
    // existingRecord.avsresponse = nmiResponse.avsresponse;
    // existingRecord.cvvresponse = nmiResponse.cvvresponse;
    // existingRecord.type = nmiResponse.type;
    // existingRecord.response_code = nmiResponse.response_code;
    // existingRecord.cc_type = nmiResponse.cc_type;
    // existingRecord.cc_exp = nmiResponse.cc_exp;
    // existingRecord.cc_number = nmiResponse.cc_number;

    if (nmiResponse.response_code === "100") {
      // existingRecord.response = "SUCCESS";
    } else {
      existingRecord.response = "FAILURE";
    }
    await existingRecord.save();

    if (nmiResponse.response_code === "100") {
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
      await existingRecord.save();
      const info = await transporter.sendMail({
        from: '"302 Properties" <info@cloudpress.host>',
        to: tenant_data.tenant_email,
        subject: "Payment Confirmation - 302 Properties",
        html: `     
            <p>Hello ${tenant_data.tenant_firstName} ${tenant_data.tenant_lastName},</p>
      
            <p>Thank you for your payment! We are delighted to confirm that your payment has been successfully processed.</p>
      
            <strong>Transaction Details:</strong>
            <ul>
             
              <li><strong>Transaction ID:</strong> ${nmiResponse.transactionid}</li>
              <li><strong>Amount Paid:</strong> $ ${paymentDetails.total_amount}</li>
              <li><strong>Payment Date:</strong> ${paymentDetails.entry[0].date}</li>
            </ul>
      
            <p>If you have any questions or concerns regarding your payment, please feel free to contact our customer support.</p>
      
            <p>Thank you for choosing 302 Properties.</p>
      
            <p>Best regards,<br>The 302 Properties Team</p>
          `,
      });
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
      // } else if (nmiResponse.response_code === "300") {
      //   // Duplicate transaction
      //   console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      //   return res.status(300).json({
      //     statusCode: 300,
      //     message: `Failed to process payment: ${nmiResponse.responsetext}`,
      //   });
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

router.post("/manual-refund/:id", async (req, res) => {
  try {
    const { refundDetails } = req.body;
    const existingPayment = await Payment.findOne({
      payment_id: req.params.id,
    });

    if (!existingPayment) {
      return res.status(404).json({
        statusCode: 404,
        message: "Original payment not found",
      });
    }

    const existingAmount = existingPayment.total_amount;

    if (refundDetails.total_amount <= existingAmount) {
      const nmiPayment = await Payment.create({
        // tenant_firstName: refundDetails.tenant_firstName,
        // tenant_lastName: refundDetails.tenant_lastName,
        // email_name: refundDetails.email_name,
        payment_type: refundDetails.payment_type,
        type: "Refund",
        status: "Success",
        response: "SUCCESS",
        memo: refundDetails.memo,
        tenant_id: refundDetails.tenant_id,
        lease_id: refundDetails.lease_id,
        // account: refundDetails.account,
        // date: refundDetails.date,
        // amount: refundDetails.amount,
        total_amount: refundDetails.total_amount,
        cvv: refundDetails.cvv,
        customer_vault_id: refundDetails.customer_vault_id,
        billing_id: refundDetails.billing_id,
        // rental_adress: refundDetails.rental_adress,
        //unit: refundDetails.unit,
        entry: refundDetails.entry.map((item) => {
          const obj = {
            amount: item.amount,
            account: item.account,
            date: item.date,
            memo: item.memo,
          };
          return obj;
        }),
        // avsresponse: nmiResponse.avsresponse,
        // cvvresponse: nmiResponse.cvvresponse,
        // type2: nmiResponse.type,
        // response_code: nmiResponse.response_code,
        // cc_type: nmiResponse.cc_type,
        // cc_exp: nmiResponse.cc_exp,
        // cc_number: nmiResponse.cc_number,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      if (nmiPayment) {
        await nmiPayment.save();
        res.status(200).json({
          statusCode: 200,
          message: "Refund added successfully",
        });
        const info = await transporter.sendMail({
          from: '"302 Properties" <info@cloudpress.host>',
          to: refundDetails.email_name,
          subject: "Refund Confirmation - 302 Properties",
          html: `     
          <p>Hello ${refundDetails.first_name} ${refundDetails.last_name},</p>
    
          <p>We are pleased to inform you that your refund has been processed successfully.</p>
    
          <strong>Transaction Details:</strong>
          <ul>
          <li><strong>Amount Refunded:</strong> $ ${refundDetails.total_amount}</li>
          <li><strong>Refund Date:</strong> ${refundDetails.entry[0].date}</li>
        </ul>
    
          <p>Thank you for choosing 302 Properties. If you have any further questions or concerns, feel free to contact our customer support.</p>
    
          <p>Best regards,<br>
          The 302 Properties Team</p>
        `,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          message: "Internal server error while processing refund",
        });
      }
    } else {
      res.status(400).json({
        statusCode: 400,
        message: "Insufficient balance for the refund",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

router.post("/new-refund", async (req, res) => {
  try {
    const { refundDetails } = req.body;
    const recordId = refundDetails._id;

    const nmiConfig = {
      type: "refund",
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      transactionid: refundDetails.transactionId,
      amount: refundDetails.total_amount,
      payment: "creditcard",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, refundDetails);

    if (nmiResponse.response_code === "100") {
      // Save the payment details to MongoDB
      const nmiPayment = await Payment.create({
        // tenant_firstName: refundDetails.tenant_firstName,
        // tenant_lastName: refundDetails.tenant_lastName,
        // email_name: refundDetails.email_name,
        payment_type: refundDetails.payment_type,
        type: "Refund",
        status: "Success",
        memo: refundDetails.memo,
        tenant_id: refundDetails.tenant_id,
        lease_id: refundDetails.lease_id,
        // account: refundDetails.account,
        // date: refundDetails.date,
        // amount: refundDetails.amount,
        total_amount: refundDetails.total_amount,
        cvv: refundDetails.cvv,
        customer_vault_id: refundDetails.customer_vault_id,
        billing_id: refundDetails.billing_id,
        // rental_adress: refundDetails.rental_adress,
        //unit: refundDetails.unit,
        response: nmiResponse.responsetext,
        transaction_id: nmiResponse.transactionid,
        entry: refundDetails.entry.map((item) => {
          const obj = {
            amount: item.amount,
            account: item.account,
            date: item.date,
            memo: item.memo,
          };
          return obj;
        }),
        // avsresponse: nmiResponse.avsresponse,
        // cvvresponse: nmiResponse.cvvresponse,
        // type2: nmiResponse.type,
        // response_code: nmiResponse.response_code,
        // cc_type: nmiResponse.cc_type,
        // cc_exp: nmiResponse.cc_exp,
        // cc_number: nmiResponse.cc_number,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      const successMessage = `Refund processed successfully! Transaction ID: ${nmiResponse.transactionid}`;
      await nmiPayment.save();
      const info = await transporter.sendMail({
        from: '"302 Properties" <info@cloudpress.host>',
        to: refundDetails.email_name,
        subject: "Refund Confirmation - 302 Properties",
        html: `     
          <p>Hello ${refundDetails.tenant_firstName} ${refundDetails.tenant_lastName},</p>
    
          <p>We are pleased to inform you that your refund has been processed successfully.</p>
    
          <strong>Transaction Details:</strong>
          <ul>
            <li><strong>Transaction ID:</strong> ${nmiResponse.transactionid}</li>
            <li><strong>Amount Refunded:</strong> $ ${refundDetails.total_amount}</li>
            <li><strong>Refund Date:</strong> ${refundDetails.entry[0].date}</li>
          </ul>
    
          <p>Thank you for choosing 302 Properties. If you have any further questions or concerns, feel free to contact our customer support.</p>
    
          <p>Best regards,<br>
          The 302 Properties Team</p>
        `,
      });
      return sendResponse(res, successMessage, 200);
    } else if (nmiResponse.response_code === "300") {
      // Refund amount exceeds the transaction balance
      console.log(`Failed to process refund: ${nmiResponse.responsetext}`);
      return sendResponse(res, nmiResponse.responsetext, 201);
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

router.post("/add-plan", async (req, res) => {
  try {
    const {
      //security_key,
      planPayments,
      planAmount,
      planName,
      planId,
      day_of_month,
      month_frequency,
    } = req.body;

    let postData = {
      recurring: "add_plan",
      plan_payments: planPayments, //if 0 than payments done until cancel
      plan_amount: planAmount,
      plan_name: planName,
      plan_id: planId,
      month_frequency: month_frequency,
      day_of_month: day_of_month,
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
          console.log("API hitt End");

          sendResponse(res, "Payment plan added successfully.");
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

router.post("/edit-plan", async (req, res) => {
  try {
    const {
      //security_key,
      planPayments,
      planAmount,
      planName,
      planId,
      day_of_month,
      month_frequency,
    } = req.body;

    let postData = {
      recurring: "edit_plan",
      plan_payments: planPayments, //if 0 than payments done until cancel
      plan_amount: planAmount,
      plan_name: planName,
      plan_id: planId,
      month_frequency: month_frequency,
      day_of_month: day_of_month,
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
          console.log("API hitt End");

          sendResponse(res, "Payment plan updated successfully.");
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

router.post("/delete-plan", async (req, res) => {
  try {
    const {
      //security_key,
      // current_plan_id,
      planId,
    } = req.body;

    let postData = {
      recurring: "delete_plan",
      // current_plan_id:current_plan_id,
      plan_id: planId,
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
          sendResponse(res, "Payment plan deleted successfully.");
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
    const {
      security_key,
      recurring,
      planId,
      ccnumber,
      ccexp,
      first_name,
      last_name,
      address,
      email,
      city,
      state,
      zip,
    } = req.body;

    let postData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      recurring: "add_subscription",
      plan_id: planId,
      ccnumber,
      email,
      ccexp,
      first_name: first_name,
      last_name: last_name,
      address1: address,
      // next_charge_date: nextDue_date,
      // start_date: start_date,
      city: city,
      state: state,
      zip: zip,
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

module.exports = router;
