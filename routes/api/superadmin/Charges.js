var express = require("express");
var router = express.Router();
var Charge = require("../../../modals/superadmin/Charge");
const moment = require("moment");
const Leasing = require("../../../modals/superadmin/Leasing");
const Surcharge = require("../../../modals/payment/Surcharge");
const Payment = require("../../../modals/payment/Payment");

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
    console.log(payment[0].entry);

    var charge = await Charge.aggregate([
      {
        $match: { lease_id: lease_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    console.log(charge);

    for (const data of charge) {
      for (const data2 of data.entry) {
        data2.charge_amount = data2.amount;
        for (const item of payment) {
          for (const item2 of item.entry) {
            if (data2.account === item2.account) {
              data2.charge_amount -= item2.amount;
            }
          }
        }
      }
    }

    res.json({
      statusCode: 200,
      totalCharges: charge,
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

router.get("/charge/:charge_id", async (req, res) => {
  try {
    const charge_id = req.params.charge_id;

    var charge_data = await Charge.aggregate([
      {
        $match: { charge_id: charge_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      statusCode: 200,
      data: charge_data,
      message: "Read  Charge",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/charge/:charge_id", async (req, res) => {
  try {
    const { charge_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await Charge.findOneAndUpdate(
      { charge_id: charge_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Charge Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Vendor not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
