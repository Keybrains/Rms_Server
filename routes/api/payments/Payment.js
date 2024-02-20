var express = require("express");
var router = express.Router();
var Payment = require("../../../modals/payment/Payment");
var Surcharge = require("../../../modals/payment/Surcharge");
var moment = require("moment");
const Charge = require("../../../modals/superadmin/Charge");
const Leasing = require("../../../modals/superadmin/Leasing");

router.post("/payment", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    // Calculate the total amount and initialize entryIds array
    let totalAmount = 0;
    const entryIds = [];

    // Loop through each entry and calculate total amount and generate entryId
    for (let i = 0; i < req.body.entry.length; i++) {
      const timestampForEntryId = Date.now();
      const entryId = `${timestampForEntryId}-${i}`; // Include index to ensure uniqueness
      entryIds.push(entryId);

      // Add entryId to the entry object
      req.body.entry[i].entry_id = entryId;

      // Calculate total amount
      totalAmount += req.body.entry[i].amount;
    }

    // Add total_amount and entry_ids to the request body
    req.body["total_amount"] = totalAmount;
    req.body["entry_ids"] = entryIds;

    req.body["payment_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    var data = await Payment.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Payment Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/charges_payments/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    var payment = await Payment.aggregate([
      {
        $match: { lease_id: lease_id },
      },
    ]);

    var charge = await Charge.aggregate([
      {
        $match: { lease_id: lease_id },
      },
    ]);

    const data = [
      ...payment.map((item) => ({ ...item, type: "payment" })),
      ...charge.map((item) => ({ ...item, type: "charge" })),
    ];

    const sortedDates = data.sort(
      (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    );

    var amount = 0;
    for (const item of sortedDates) {
      if (item.type === "payment") {
        amount -= item.total_amount;
      } else if (item.type === "charge") {
        amount += item.total_amount;
      }
      item.balance = amount;
    }

    res.json({
      statusCode: 200,
      data: sortedDates.reverse(),
      totalAmount: amount,
      message: "Read All Lease",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/tenant_financial/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    var payment = await Payment.aggregate([
      {
        $match: { tenant_id: tenant_id },
      },
    ]);

    var charge = await Charge.aggregate([
      {
        $match: { tenant_id: tenant_id },
      },
    ]);

    const data = [
      ...payment.map((item) => ({ ...item, type: "payment" })),
      ...charge.map((item) => ({ ...item, type: "charge" })),
    ];

    const sortedDates = data.sort(
      (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    );

    var amount = 0;
    for (const item of sortedDates) {
      if (item.type === "payment") {
        amount -= item.amount;
      } else if (item.type === "charge") {
        amount += item.amount;
      }
      item.balance = amount;
    }

    res.json({
      statusCode: 200,
      data: sortedDates.reverse(),
      totalAmount: amount,
      message: "Read All Lease",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
