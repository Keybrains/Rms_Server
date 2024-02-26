var express = require("express");
var router = express.Router();
var NmiPayment = require("../../../modals/payment/NMI-response");
var NmiPayment = require("../../../modals/payment/Payment");
var NmiPayment = require("../../../modals/payment/Refund");
var axios = require("axios");
var querystring = require("querystring");
const { DOMParser } = require("xmldom");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.sparkpostmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "SMTP_Injection",
      pass: "3a634e154f87fb51dfd179b5d5ff6d771bf03240",
    },
    tls: {
      rejectUnauthorized: false
    }
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
        billing_id
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
      const {  customer_vault_id } = req.body;
  
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
          console.log("pppppppppppppp",parsedResponse)
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
        ver : 2
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

  module.exports = router;