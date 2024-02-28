var express = require("express");
var router = express.Router();
var Payment = require("../../../modals/payment/Payment");
var Surcharge = require("../../../modals/payment/Surcharge");
var moment = require("moment");
const Charge = require("../../../modals/superadmin/Charge");
const Leasing = require("../../../modals/superadmin/Leasing");
const Unit = require("../../../modals/superadmin/Unit");
const Rentals = require("../../../modals/superadmin/Rentals");

router.post("/payment", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    // Calculate the total amount and initialize entryIds array
    let totalAmount = 0;
    const entryIds = [];

    // Loop through each entry and calculate total amount and generate entryId
    console.log("1==========");
    for (let i = 0; i < req.body.entry.length; i++) {
      if (req.body.entry[i].entry_id) {
        const findCharge = await Charge.findOne({
          "entry.entry_id": req.body.entry[i].entry_id,
          "entry.is_paid": false,
        });

        if (findCharge) {
          for (const entry of findCharge.entry) {
            if (
              entry.entry_id === req.body.entry[i].entry_id &&
              req.body.entry[i].balance === req.body.entry[i].amount
            ) {
              const updatedCharge = await Charge.findOneAndUpdate(
                {
                  "entry.entry_id": req.body.entry[i].entry_id,
                },
                { $set: { "entry.$.is_paid": true } },
                { new: true }
              );
            }
          }
        }
      }
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
      ...payment.map((item) => ({ ...item, type: "Payment" })),
      ...charge.map((item) => ({ ...item, type: "Charge" })),
    ];

    const sortedDates = data.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    var amount = 0;
    for (const item of sortedDates) {
      if (item.type === "Payment") {
        amount -= item.total_amount;
      } else if (item.type === "Charge") {
        amount += item.total_amount;
      }
      item.balance = amount;
    }

    res.json({
      statusCode: 200,
      data: sortedDates.reverse(),
      totalBalance: amount,
      message: "Read All Charges",
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

    let lease_id = null;

    // Find lease_id from payment
    for (const item of payment) {
      if (item.lease_id) {
        lease_id = item.lease_id;
        break;
      }
    }

    // If lease_id is not found in payment, find it from charge
    if (!lease_id) {
      for (const item of charge) {
        if (item.lease_id) {
          lease_id = item.lease_id;
          break;
        }
      }
    }

    // If lease_id is found, proceed with fetching lease data
    if (lease_id) {
      var lease_data = await Leasing.findOne({ lease_id: lease_id });
      var rental_data = await Rentals.findOne({
        rental_id: lease_data.rental_id,
      });
      var unit_data = await Unit.findOne({ unit_id: lease_data.unit_id });

      const data = [
        ...payment.map((item) => ({ ...item, type: "Payment" })),
        ...charge.map((item) => ({ ...item, type: "Charge" })),
      ];

      const sortedDates = data.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      var total_amount = 0;
      for (const item of sortedDates) {
        if (item.type === "Payment") {
          total_amount -= item.total_amount;
        } else if (item.type === "Charge") {
          total_amount += item.total_amount;
        }
        item.balance = total_amount;
      }

      // Include rental_unit_adress and rental_address in response
      const responseData = sortedDates.reverse().map((item) => ({
        ...item,
        rental_unit: unit_data.rental_unit,
        rental_address: rental_data.rental_adress,
      }));

      res.json({
        statusCode: 200,
        data: responseData,
        totalBalance: total_amount,
        message: "Read All Tenant-Financial Blance",
      });
    } else {
      res.json({
        statusCode: 404,
        message: "Lease ID not found for the given tenant ID",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
