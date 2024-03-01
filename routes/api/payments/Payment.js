var express = require("express");
var router = express.Router();
var Payment = require("../../../modals/payment/Payment");
var Surcharge = require("../../../modals/payment/Surcharge");
var moment = require("moment");
const Charge = require("../../../modals/superadmin/Charge");
const Leasing = require("../../../modals/superadmin/Leasing");
const Unit = require("../../../modals/superadmin/Unit");
const Rentals = require("../../../modals/superadmin/Rentals");
const Tenant = require("../../../modals/superadmin/Tenant");

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

    for (const pay of payment) {
      if (pay.payment_type === "Credit Card" && pay.type==="Payment") {
        pay.total_amount += parseFloat(pay.surcharge);
      }
    }

    var charge = await Charge.aggregate([
      {
        $match: { lease_id: lease_id },
      },
    ]);

    const data = [...payment, ...charge];

    const sortedDates = data.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    var amount = 0;
    for (const item of sortedDates) {
      if (item?.type === "Payment") {
        amount -= item.total_amount;
      } else if (item?.type === "Charge") {
        amount += item.total_amount;
      } else if (item?.type === "Refund") {
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

    for (const pay of payment) {
      const lease_id = pay.lease_id;

      const lease = await Leasing.findOne({ lease_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });
      pay.rental_address = rental.rental_adress;
      pay.rental_unit = unit.rental_unit;
    }

    var charge = await Charge.aggregate([
      {
        $match: { tenant_id: tenant_id },
      },
    ]);

    for (const pay of charge) {
      const lease_id = pay.lease_id;

      const lease = await Leasing.findOne({ lease_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });
      pay.rental_address = rental.rental_adress;
      pay.rental_unit = unit.rental_unit;
    }

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

    res.json({
      statusCode: 200,
      data: sortedDates.reverse(),
      totalBalance: total_amount,
      message: "Read All Tenant-Financial Blance",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/payment/:payment_id", async (req, res) => {
  try {
    const payment_id = req.params.payment_id;

    var charge_data = await Payment.aggregate([
      {
        $match: { payment_id: payment_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const tenant_data = await Tenant.findOne({
      tenant_id: charge_data[0].tenant_id,
    });

    res.json({
      statusCode: 200,
      data: { ...charge_data, tenant_data },
      message: "Read  Charge",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/payment/:payment_id", async (req, res) => {
  try {
    const { payment_id } = req.params;
    const allEntery = req.body.entry;
    console.log(req.body);

    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const updatedCharge = await Payment.findOneAndUpdate(
      { payment_id: payment_id },
      { $set: req.body },
      { new: true }
    );

    if (!updatedCharge) {
      return res.status(404).json({
        statusCode: 404,
        message: "Charge not found",
      });
    }

    const updatedEntries = [];
    for (const entry of allEntery) {
      const entry_id = entry.entry_id;
      const updatedEntry = await Payment.findOneAndUpdate(
        { "entry.entry_id": entry_id },
        { $set: { "entry.$": entry } },
        { new: true }
      );
      updatedEntries.push(updatedEntry);
    }

    res.json({
      statusCode: 200,
      data: { charge: updatedCharge, entries: updatedEntries },
      message: "Charge and entries updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      statusCode: 500,
      message: "Server Error",
    });
  }
});

module.exports = router;
