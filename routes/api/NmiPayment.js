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
const { DOMParser } = require("xmldom");
const nodemailer = require("nodemailer");
const { createTransport } = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.socketlabs.com",
  port: 587,
  secure: false,
  auth: {
    user: "server39897",
    pass: "c9J3Wwm5N4Bj",
  },
});

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

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "yash");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  // Make sure to require the crypto module
  const decipher = crypto.createDecipher("aes-256-cbc", "yash");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

router.post("/purchase", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails, planId } = req.body;
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
    });

    const nmiConfig = {
      type: "sale",
      payment: paymentType,
      amount: paymentDetails.amount,
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
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
      // const nmiPayments = new NmiPayment.push(paymentData);

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
      paymentType: paymentDetails.paymentType,
      type2: paymentDetails.type2,
      memo: paymentDetails.memo,
      account: paymentDetails.account,
      date: paymentDetails.date,
      //card_number: paymentDetails.card_number,
      amount: paymentDetails.amount,
      //expiration_date: paymentDetails.expiration_date,
      //cvv: paymentDetails.cvv,
      tenantId: paymentDetails.tenantId,
      customer_vault_id: paymentDetails.customer_vault_id,
      billing_id: paymentDetails.billing_id,
      property: paymentDetails.property,
      unit: paymentDetails.unit,
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
    if (nmiResponse.response_code === "100") {
    } else {
      nmiPayment.status = "Failure";
    }
    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      // Payment was successful
      nmiPayment.status = "Success";
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
            <li><strong>Payment For:</strong> ${paymentDetails.account}</li>
            <li><strong>Amount Paid:</strong> $ ${paymentDetails.amount}</li>
            <li><strong>Payment Date:</strong> ${paymentDetails.date}</li>
          </ul>
    
          <p>If you have any questions or concerns regarding your payment, please feel free to contact our customer support.</p>
    
          <p>Thank you for choosing 302 Properties.</p>
    
          <p>Best regards,<br>The 302 Properties Team</p>
        `,
      });
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;

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

router.post("/update_sale/:id", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails, planId } = req.body;
    console.log("manu-----------------", paymentDetails);

    const nmiConfig = {
      type: "sale",
      //payment: paymentDetails.paymentType,
      customer_vault_id: paymentDetails.customer_vault_id,
      billing_id: paymentDetails.billing_id,
      amount: paymentDetails.amount,
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email: paymentDetails.email_name,
      plan_id: planId,
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, paymentDetails);

    const existingRecord = await NmiPayment.findById(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({
        statusCode: 404,
        message: "Record not found",
      });
    }
    // Update fields with NMI response
    existingRecord.response = nmiResponse.response;
    existingRecord.responsetext = nmiResponse.responsetext;
    existingRecord.authcode = nmiResponse.authcode;
    existingRecord.transactionid = nmiResponse.transactionid;
    existingRecord.avsresponse = nmiResponse.avsresponse;
    existingRecord.cvvresponse = nmiResponse.cvvresponse;
    existingRecord.type = nmiResponse.type;
    existingRecord.response_code = nmiResponse.response_code;
    existingRecord.cc_type = nmiResponse.cc_type;
    existingRecord.cc_exp = nmiResponse.cc_exp;
    existingRecord.cc_number = nmiResponse.cc_number;

    if (nmiResponse.response_code === "100") {
      existingRecord.status = "Success";
    } else {
      existingRecord.status = "Failure";
    }
    await existingRecord.save();

    if (nmiResponse.response_code === "100") {
      const successMessage = `Plan purchased successfully! Transaction ID: ${nmiResponse.transactionid}`;
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
            <li><strong>Payment For:</strong> ${paymentDetails.account}</li>
            <li><strong>Amount Paid:</strong> $ ${paymentDetails.amount}</li>
            <li><strong>Payment Date:</strong> ${paymentDetails.date}</li>
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

router.post("/postnmipayments", async (req, res) => {
  try {
    const { paymentDetails } = req.body;

    const data = await NmiPayment.create({
      first_name: paymentDetails.first_name,
      last_name: paymentDetails.last_name,
      email_name: paymentDetails.email_name,
      paymentType: paymentDetails.paymentType,
      memo: paymentDetails.memo,
      account: paymentDetails.account,
      date: paymentDetails.date,
      type2: paymentDetails.type2,
      amount: paymentDetails.amount,
      property: paymentDetails.property,
      unit: paymentDetails.unit,
      tenantId: paymentDetails.tenantId,
      status: paymentDetails.status,
      check_number: paymentDetails.check_number,
      card_number: paymentDetails.card_number,
      expiration_date: paymentDetails.expiration_date,
      customer_vault_id: paymentDetails.customer_vault_id,
      billing_id: paymentDetails.billing_id,
      cvv: paymentDetails.cvv,
    });
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Payment Successfully",
    });
    if (paymentDetails.paymentType !== "Credit Card") {
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
          <li><strong>Payment For:</strong> ${paymentDetails.account}</li>
          <li><strong>Amount Paid:</strong> $ ${paymentDetails.amount}</li>
          <li><strong>Payment Date:</strong> ${paymentDetails.date}</li>
        </ul>
  
        <p>If you have any questions or concerns regarding your payment, please feel free to contact our customer support.</p>
  
        <p>Thank you for choosing 302 Properties.</p>
  
        <p>Best regards,<br>The 302 Properties Team</p>
      `,
    });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/nmipayments", async (req, res) => {
  try {
    // Retrieve all NmiPayment records from the database
    const nmipayments = await NmiPayment.find();
    data = nmipayments.reverse();
    // Return the retrieved data as JSON
    res.status(200).json({
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

router.get("/nmipayments/tenant/:tenantId", async (req, res) => {
  const id = req.params.tenantId;
  try {
    const nmipayment = await NmiPayment.find({ tenantId: id });
    data = nmipayment.reverse();

    if (nmipayment) {
      res.status(200).json({
        statusCode: 200,
        data: data,
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

router.put("/updatepayment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedNmiPayment = await NmiPayment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (updatedNmiPayment) {
      res.status(200).json({
        statusCode: 200,
        message: "NmiPayment updated successfully",
        data: updatedNmiPayment,
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "NmiPayment not found",
      });
    }
  } catch (error) {
    console.error("Error updating NmiPayment:", error);
    res.status(500).send(error);
  }
});

router.post("/manual-refund/:id", async (req, res) => {
  try {
    const { refundDetails } = req.body;
    const existingPayment = await NmiPayment.findById(req.params.id);

    if (!existingPayment) {
      return res.status(404).json({
        statusCode: 404,
        message: "Original payment not found",
      });
    }

    const existingAmount = existingPayment.amount;

    if (refundDetails.amount <= existingAmount) {
      const nmiPayment = await NmiPayment.create({
        first_name: refundDetails.first_name,
        last_name: refundDetails.last_name,
        email_name: refundDetails.email_name,
        paymentType: refundDetails.paymentType,
        type2: "Refund",
        status: "Success",
        memo: refundDetails.memo,
        tenantId: refundDetails.tenantId,
        account: refundDetails.account,
        date: refundDetails.date,
        check_number: refundDetails.check_number,
        amount: refundDetails.amount,
        property: refundDetails.property,
        unit: refundDetails.unit,
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
          <li><strong>Property:</strong> ${refundDetails.property}</li>
          <li><strong>Refund For:</strong> ${refundDetails.account}</li>
          <li><strong>Amount Refunded:</strong> $ ${refundDetails.amount}</li>
          <li><strong>Refund Date:</strong> ${refundDetails.date}</li>
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

router.post("/refund", async (req, res) => {
  try {
    const { refundDetails } = req.body;

    const nmiConfig = {
      type: "refund",
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      transactionid: refundDetails.transactionId,
      amount: refundDetails.amount,
      payment: "creditcard",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig, refundDetails);

    if (nmiResponse.response_code === "100") {
      // Refund successful
      // Save the payment details to MongoDB
      const nmiPayment = await NmiPayment.create({
        first_name: refundDetails.first_name,
        last_name: refundDetails.last_name,
        email_name: refundDetails.email_name,
        paymentType: refundDetails.paymentType,
        type2: "Refund",
        status: "Success",
        memo: refundDetails.memo,
        tenantId: refundDetails.tenantId,
        account: refundDetails.account,
        date: refundDetails.date,
        card_number: refundDetails.card_number,
        amount: refundDetails.amount,
        expiration_date: refundDetails.expiration_date,
        cvv: refundDetails.cvv,
        customer_vault_id: refundDetails.customer_vault_id,
        billing_id: refundDetails.billing_id,
        property: refundDetails.property,
        unit: refundDetails.unit,
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

      const successMessage = `Refund processed successfully! Transaction ID: ${nmiResponse.transactionid}`;
      await nmiPayment.save();
      const info = await transporter.sendMail({
        from: '"302 Properties" <info@cloudpress.host>',
        to: refundDetails.email_name,
        subject: "Refund Confirmation - 302 Properties",
        html: `     
        <p>Hello ${refundDetails.first_name} ${refundDetails.last_name},</p>
  
        <p>We are pleased to inform you that your refund has been processed successfully.</p>
  
        <strong>Transaction Details:</strong>
        <ul>
          <li><strong>Property:</strong> ${refundDetails.property}</li>
          <li><strong>Transaction ID:</strong> ${nmiResponse.transactionid}</li>
          <li><strong>Refund For:</strong> ${refundDetails.account}</li>
          <li><strong>Amount Refunded:</strong> $ ${refundDetails.amount}</li>
          <li><strong>Refund Date:</strong> ${refundDetails.date}</li>
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

//for cancel payments using transactionId
router.post("/void", async (req, res) => {
  try {
    const { transactionId, paymentType } = req.body;

    if (!transactionId || !paymentType) {
      return sendResponse(res, "Missing required parameters.", 400);
    }

    const nmiConfig = {
      type: "void",
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
    const {
      transactionId,
      type,
      first_name,
      last_name,
      email,
      amount,
      ccnumber,
      ccexp,
    } = req.body;

    const nmiConfig = {
      type: "update",
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      transactionid: transactionId,
      type: type,
      first_name: first_name,
      last_name: last_name,
      email: email,
      amount: amount,
      ccnumber: ccnumber,
      ccexp: ccexp,
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

//get customer vault NMI API
router.post("/get-customer-vault", async (req, res) => {
  try {
    const { customer_vault_id } = req.body;
    let postData = {
      security_key: "b6F87GPCBSYujtQFW26583EM8H34vM5r",
      customer_vault_id,
      report_type: "customer_vault",
    };

    var config = {
      method: "post",
      url: "https://hms.transactiongateway.com/api/query.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify(postData),
    };

    console.log("API request: ", config);

    axios(config)
      .then(async (response) => {
        // Convert XML to JSON here
        const jsonResult = convertToJson(response.data);

        // Now jsonResult contains the JSON representation of the XML response
        console.warn(jsonResult.nm_response.customer_vault);
        const custom = jsonResult.nm_response.customer_vault;

        if (custom.response_code == 200) {
          // Handle successful customer creation
          sendResponse(res, custom);
        } else {
          // Handle customer creation failure
          sendResponse(res, custom, 200);
        }
      })
      .catch(function (error) {
        sendResponse(res, error, 500);
      });
  } catch (error) {
    console.log(error);
    sendResponse(res, "Something went wrong!", 500);
  }
});

//get multiple customer vault NMI API
router.post("/get-multiple-customer-vault", async (req, res) => {
  try {
    const { customer_vault_id } = req.body;

    if (!customer_vault_id || !Array.isArray(customer_vault_id)) {
      sendResponse(
        res,
        { status: 400, error: "Invalid or missing customer_vault_ids" },
        400
      );
      return;
    }

    const securityKey = "b6F87GPCBSYujtQFW26583EM8H34vM5r";
    const promises = customer_vault_id.map((customer_vault_id) => {
      const postData = {
        security_key: securityKey,
        customer_vault_id,
        report_type: "customer_vault",
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

      return axios(config)
        .then(async (response) => {
          const jsonResult = convertToJson(response.data);
          return jsonResult.nm_response.customer_vault;
        })
        .catch((error) => {
          console.error(
            "Error fetching customer_vault_id",
            customer_vault_id,
            ":",
            error
          );
          return null;
        });
    });

    Promise.all(promises)
      .then((customerVaultRecords) => {
        // Filter out null values (failed requests) and send the valid customer vault records
        const validCustomerVaultRecords = customerVaultRecords.filter(
          (record) => record !== null
        );

        if (validCustomerVaultRecords.length > 0) {
          sendResponse(res, validCustomerVaultRecords);
        } else {
          sendResponse(res, {
            status: 404,
            error: "No valid customer vault records found",
          });
        }
      })
      .catch((error) => {
        console.error("Error processing customer vault records:", error);
        sendResponse(res, { status: 500, error: "Internal server error" }, 500);
      });
  } catch (error) {
    console.log(error);
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
