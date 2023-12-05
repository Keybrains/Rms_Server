var express = require("express");
var router = express.Router();
var AddPaymentAndCharge = require("../../modals/AddPaymentAndCharge");

// router.post("/abc", async (req, res) => {
//     try {
//         const { properties, unit } = req.body;

//         // Check if a record with the provided property_id and rental_dress exists
//         const existingRecord = await AddPaymentAndCharge.findOne({
//             "properties.property_id": properties.property_id,
//             "properties.rental_dress": properties.rental_dress,
//         });

//         if (!existingRecord) {
//             // If the record does not exist, create a new one
//             const newData = await AddPaymentAndCharge.create(req.body);
//             res.json({
//                 statusCode: 200,
//                 data: newData,
//                 message: "Add payment Successfully",
//             });
//         } else {
//             // Find the existing unit by unit and unit_id
//             const existingUnit = existingRecord.unit.find(
//                 (u) => u.unit === unit[0].unit && u.unit_id === unit[0].unit_id
//             );

//             if (existingUnit) {
//                 // If the unit exists, push the new paymentAndCharges data into it
//                 existingUnit.paymentAndCharges.push(...unit[0].paymentAndCharges);
//             } else {
//                 // If the unit does not exist, create a new unit
//                 existingRecord.unit.push({
//                     unit: unit[0].unit,
//                     unit_id: unit[0].unit_id,
//                     paymentAndCharges: unit[0].paymentAndCharges,
//                 });
//             }

//             const updatedData = await existingRecord.save();

//             res.json({
//                 statusCode: 200,
//                 data: updatedData,
//                 message: "Update payment Successfully",
//             });
//         }
//     } catch (error) {
//         res.json({
//             statusCode: 500,
//             message: error.message,
//         });
//     }
// });

router.post("/payment_charge", async (req, res) => {
  try {
    const { properties, unit } = req.body;

    // Check if a record with the provided property_id and rental_dress exists
    const existingRecord = await AddPaymentAndCharge.findOne({
      "properties.property_id": properties.property_id,
      "properties.rental_dress": properties.rental_dress,
    });

    if (!existingRecord) {
      // If the record does not exist, create a new one
      const newData = await AddPaymentAndCharge.create(req.body);
      res.json({
        statusCode: 200,
        data: newData,
        message: "Add payment Successfully",
      });
    } else {
      if (unit && unit.length > 0) {
        // Find the existing unit by unit and unit_id
        const existingUnit = existingRecord.unit.find(
          (u) => u.unit === unit[0].unit && u.unit_id === unit[0].unit_id
        );

        if (existingUnit) {
          // If the unit exists, push the new paymentAndCharges data into it
          existingUnit.paymentAndCharges.push(...unit[0].paymentAndCharges);
        } else {
          // If the unit does not exist, create a new unit
          existingRecord.unit.push({
            unit: unit[0].unit,
            unit_id: unit[0].unit_id,
            paymentAndCharges: unit[0].paymentAndCharges,
          });
        }
      } else {
        // If unit information is not present, create a new record without unit
        const newRecord = await AddPaymentAndCharge.create(req.body);
        res.json({
          statusCode: 200,
          data: newRecord,
          message: "Add payment Successfully",
        });
        return; // Return to prevent the code below from executing
      }

      const updatedData = await existingRecord.save();

      res.json({
        statusCode: 200,
        data: updatedData,
        message: "Update payment Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Unit pass and get Data
router.get("/financial_unit", async (req, res) => {
  try {
    const { rental_dress, property_id, unit, tenant_id } = req.query;

    const data = await AddPaymentAndCharge.aggregate([
      {
        $match: {
          "properties.rental_dress": rental_dress,
          "properties.property_id": property_id,
          "unit.unit": unit,
          "unit.paymentAndCharges.tenant_id": tenant_id,
        },
      },
      {
        $unwind: "$unit",
      },
      {
        $match: {
          "unit.unit": unit,
          "unit.paymentAndCharges.tenant_id": tenant_id,
        },
      },
      {
        $addFields: {
          "unit.paymentAndCharges": {
            $filter: {
              input: "$unit.paymentAndCharges",
              as: "charge",
              cond: {
                $eq: ["$$charge.tenant_id", tenant_id],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          properties: { $first: "$properties" },
          unit: { $push: "$unit" },
        },
      },
    ]);

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Filtered PaymentAndCharge",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// without unit pass
router.get("/financial", async (req, res) => {
    try {
        const { rental_dress, property_id, unit, tenant_id } = req.query;

        // Construct the query object based on the provided parameters
        const query = {
            "properties.rental_dress": rental_dress,
            "properties.property_id": property_id,
            $or: [
                { "unit.unit": unit },  // Match if unit is present
                { "unit": { $exists: false } },  // Match if unit is not present
                { "unit": { $elemMatch: { "unit": unit } } },  // Match if any unit has the specified unit property
                { "unit": { $elemMatch: { "unit": "" } } },  // Match if any unit has an empty unit property
            ],
            "unit.paymentAndCharges.tenant_id": tenant_id,
        };

        // Remove undefined parameters from the query object
        Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);

        // Use the constructed query object to filter the data
        const data = await AddPaymentAndCharge.find(query, { "unit.$": 1 });

        res.json({
            statusCode: 200,
            data: data,
            message: "Read Filtered PaymentAndCharge",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});




router.get("/xyz", async (req, res) => {
    try {
        const { rental_dress, property_id, unit, tenant_id } = req.query;

        // Construct the query object based on the provided parameters
        const query = {
            "properties.rental_dress": rental_dress,
            "properties.property_id": property_id,
            $or: [
                { "unit.unit": unit },  // Match if unit is present
                { "unit": { $exists: false } },  // Match if unit is not present
                { "unit": { $elemMatch: { "unit": unit } } },  // Match if any unit has the specified unit property
                { "unit": { $elemMatch: { "unit": "" } } },  // Match if any unit has an empty unit property
            ],
            "unit.paymentAndCharges.tenant_id": tenant_id,
        };

        // Remove undefined parameters from the query object
        Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);

        // Use the constructed query object to filter the data
        const data = await AddPaymentAndCharge.find(query, { "unit.$": 1 });

        // Iterate through the data to calculate and include Increase and Decrease in each item
        data.forEach((item) => {
            if (item.unit && item.unit.length > 0) {
                item.unit.forEach((unitItem) => {
                    if (unitItem.paymentAndCharges && unitItem.paymentAndCharges.length > 0) {
                        unitItem.paymentAndCharges.forEach((chargeItem) => {
                            if (chargeItem.type === "Payment") {
                                chargeItem.Increase = chargeItem.amount;
                            } else if (chargeItem.type === "Charge") {
                                chargeItem.Decrease = chargeItem.amount;
                            }
                        });
                    }
                });
            }
        });

        res.json({
            statusCode: 200,
            data: data,
            message: "Read Filtered PaymentAndCharge",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});






module.exports = router;
