var express = require("express");
var router = express.Router();
var Payment = require("../../../modals/payment/Payment");
var moment = require("moment");
const Charge = require("../../../modals/superadmin/Charge");
const Leasing = require("../../../modals/superadmin/Leasing");

router.post("/payment", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

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

router.get("/payment/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    var payment = await Payment.aggregate([
      {
        $match: { lease_id: lease_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    var charge = await Charge.aggregate([
      {
        $match: { lease_id: lease_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Initialize an object to store total payment amount for each payment type
    const totalPayments = {};

    for (const data of charge) {
      data.charge_amount = data.amount;
      for (const item of payment) {
        if (data.charge_type === item.payment_type) {
          data.charge_amount -= item.amount;
        }
      }
      // Add or update the total payment amount for each payment type
      if (totalPayments[data.charge_type]) {
        totalPayments[data.charge_type] += data.charge_amount;
      } else {
        totalPayments[data.charge_type] = data.charge_amount;
      }
    }

    res.json({
      statusCode: 200,
      totalPayments: totalPayments,
      message: "Read All Lease",
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
