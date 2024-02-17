var express = require("express");
var router = express.Router();
var Charge = require("../../../modals/superadmin/Charge");
const moment = require("moment");

// router.post("/charge", async (req, res) => {
//   try {
//     const fetchTime = () => {
//       const timestamp = Date.now();
//       return timestamp;
//     };
//     const charges = req.body.map((charge) => ({
//       ...charge,
//       charge_id: fetchTime(),
//       createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//     }));

//     const createdCharges = await Promise.all(
//       charges.map((charge) => Charge.create(charge))
//     );

//     res.json({
//       statusCode: 200,
//       data: createdCharges,
//       message: "Add Charges Successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/charge", async (req, res) => {
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
    req.body["entry_id"] = entryIds;

    req.body["charge_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    var data = await Charge.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Charge Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/charges/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    const lease_data = await Leasing.findOne({ lease_id });
    const surcharge = await Surcharge.findOne({
      admin_id: lease_data.admin_id,
    });

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
      totalCharges: totalPayments,
      Surcharge: surcharge,
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
