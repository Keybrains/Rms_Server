var express = require("express");
var router = express.Router();
var Payment = require("../../modals/Payment");
var Tenants = require("../../modals/Tenants");
var Charges = require("../../modals/Charges");
//   Add  Payment
// router.post("/add_payment", async (req, res) => {
//   try {
//     var data = await Payment.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add payment Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });
router.post("/add_payment", async (req, res) => {
  try {
    const { entries, ...restOfData } = req.body;

    if (entries && Array.isArray(entries)) {
      entries.forEach((entry, index) => {
        entry.paymentIndex = ("0" + (index + 1)).slice(-2); // Generate paymentIndex "01", "02", ...
      });
    }

    const newPayment = {
      entries: entries,
      ...restOfData,
    };

    const data = await Payment.create(newPayment);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Payment Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
router.get("/payment", async (req, res) => {
  try {
    var data = await Payment.find();

    if (data.length === 0) {
      // Log a message for debugging
      console.log("No payment records found.");
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Payments",
    });
  } catch (error) {
    console.error(error); // Log the error to the console for debugging
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// delete Payment
router.delete("/Payment", async (req, res) => {
  try {
    let result = await Payment.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Payment Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//edit rentals
router.put("/Payment/:id", async (req, res) => {
  try {
    let result = await Payment.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Payment Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//get Payment table  summary data id wise

router.get("/Payment_summary/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL parameter
    var data = await Payment.findById(userId);
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: "summaryGet Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "summary not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get tennat data as per payment in tenant firstname
// router.get("/payment/financial", async (req, res) => {
//   try {
//     const data = await Payment.aggregate([
//       {
//         $lookup: {
//           from: "tenants", // Name of the tenant collection in your database
//           localField: "tenant_firstName", // Field to join on in the payment collection
//           foreignField: "tenant_firstName", // Field to join on in the tenant collection
//           as: "tenantData" // Alias for the joined data
//         }
//       },
//       {
//         $unwind: "$tenantData" // Unwind the tenantData array (as it's an array due to $lookup)
//       }
//     ]);

//     res.json({
//       data,
//       statusCode: 200,
//       message: "Read All Payments with Tenant Data",
//     });
//   } catch (error) {
//     console.error(error); // Log the error to the console for debugging
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// router.get("/payment/financial", async (req, res) => {
//   try {
//     const data = await Payment.aggregate([
//       {
//         $lookup: {
//           from: "tenants",
//           let: { firstName: "$tenant_firstName", address: "$rental_adress" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$tenant_firstName", "$$firstName"] },
//                     { $eq: ["$rental_adress", "$$address"] }
//                   ]
//                 }
//               }
//             }
//           ],
//           as: "tenantData"
//         }
//       },
//       {
//         $unwind: "$tenantData"
//       },
//       {
//         $match: { "tenantData": { $ne: [] } }
//       }
//     ]);

//     res.json({
//       data,
//       statusCode: 200,
//       message: "Read Payments with Matching Tenant Data",
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

//rental adress wise data get in payment collection
// router.get("/payment/:rental_address", async (req, res) => {
//   try {
//     const rentalAddress = req.params.rental_address; // Get the rental address from the URL parameter

//     var data = await Payment.find({ rental_adress: rentalAddress });

//     if (data.length === 0) {
//       console.log("No payment records found for the rental address: " + rentalAddress);
//     }

//     res.json({
//       data: data,
//       statusCode: 200,
//       message: "Read Payments by Rental Address",
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/payment/:rental_address", async (req, res) => {
  try {
    const rentalAddress = req.params.rental_address;

    const data = await Payment.aggregate([
      {
        $match: { rental_adress: rentalAddress },
      },
      {
        $unwind: "$entries",
      },
      {
        $lookup: {
          from: "tenants",
          let: {
            tenantId: { $toObjectId: "$tenant_id" },
            entryIdx: "$entries.entryIndex",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$tenantId"] },
                    { $eq: ["$entryIndex", "$$entryIdx"] },
                  ],
                },
              },
            },
          ],
          as: "TenantData",
        },
      },
      {
        $group: {
          _id: "$_id",
          rental_adress: { $first: "$rental_adress" },
          date: { $first: "$date" },
          amount: { $first: "$amount" },
          payment_method: { $first: "$payment_method" },
          tenant_firstName: { $first: "$tenant_firstName" },
          attachment: { $first: "$attachment" },
          entries: { $push: "$entries" },
          TenantData: { $first: "$TenantData" },
        },
      },
    ]);

    if (data.length === 0) {
      console.log(
        "No payment records found for the rental address: " + rentalAddress
      );
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read Payments by Rental Address",
    });
  } catch (error) {
    console.error(error);
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get(
  "/Payment_summary/tenant/:tenantid/:entryindex",
  async (req, res) => {
    try {
      const tenantId = req.params.tenantid;
      const entryIndex = req.params.entryindex;
      var data = await Payment.find({ tenant_id: tenantId });
      var data = await Payment.find({ entryIndex: entryIndex });
      if (data && data.length > 0) {
        res.json({
          data: data,
          statusCode: 200,
          message: "summaryGet Successfully",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "summary not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

//charge collection in add
// router.post("/add_charges", async (req, res) => {
//   try {
//     var data = await Charges.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Charge Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });
router.post("/add_charges", async (req, res) => {
  try {
    const { entries, ...restOfData } = req.body;

    if (entries && Array.isArray(entries)) {
      entries.forEach((entry, index) => {
        entry.chargeIndex = ("0" + (index + 1)).slice(-2); // Generate chargeIndex "01", "02", ...
      });
    }

    const newCharges = {
      entries: entries,
      ...restOfData,
    };

    const data = await Charges.create(newCharges);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Charges Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
router.delete("/delete_charge/:mainId/:chargeIndex", async (req, res) => {
  try {
    const { mainId, chargeIndex } = req.params;
    const updatedCharge = await Charges.findOneAndUpdate(
      { _id: mainId },
      { $pull: { entries: { chargeIndex: chargeIndex } } },
      { new: true }
    );

    if (!updatedCharge) {
      return res.status(404).json({
        statusCode: 404,
        message: "Charge not found",
      });
    }

    res.json({
      statusCode: 200,
      data: updatedCharge,
      message: "Charge entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
//payment charge api
router.get("/merge_payment_charge/:tenant_id", async (req, res) => {
  try {
    // Extract tenantId from the request parameters
    const tenantId = req.params.tenant_id;
    console.log("Tenant ID:", tenantId);

    // Fetch data from the Payment collection based on tenantId and sort by date
    const paymentData = await Payment.find({ tenant_id: tenantId });
    console.log("Payment Data:", paymentData);

    // Fetch data from the Charges collection based on tenantId and sort by date
    const chargesData = await Charges.find({ tenant_id: tenantId });
    console.log("Charges Data:", chargesData);

    // Check if there are no payment records
    if (paymentData.length === 0) {
      console.log("No payment records found.");
    }


    // Combine payment and charges arrays into a single array
    const mergedData = [...paymentData, ...chargesData];

    // Sort the merged data by the 'date' field
    // mergedData.sort((a, b) => {
    //   const dateA = new Date(a.date);
    //   const dateB = new Date(b.date);
    //   return dateA - dateB;
    // });
    // console.log("mergeddata", mergedData);
    
    // // Check if there are no charges records
    // if (chargesData.length === 0) {
    //   console.log("No Charges records found.");
    // }

    // // Create a merged object using both payment and charges data
    // const mergedData = {
    //   payments: paymentData,
    //   charges: chargesData,
    // };

    res.json({
      data: mergedData,
      statusCode: 200,
      message: "Read Payments and Charges",
    });
  } catch (error) {
    console.error(error);
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


module.exports = router;
