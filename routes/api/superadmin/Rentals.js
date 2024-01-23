var express = require("express");
var router = express.Router();
var RentalOwner = require("../../../modals/superadmin/RentalOwner");
var Unit = require("../../../modals/superadmin/Unit");
var Rentals = require("../../../modals/superadmin/Rentals");
var PropertyType = require("../../../modals/superadmin/PropertyType");
var StaffMember = require("../../../modals/superadmin/StaffMember");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var moment = require("moment");
const { default: mongoose } = require("mongoose");

// ============== Super Admin ==================================

router.get("/admin/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    var pageSize = parseInt(req.query.pageSize) || 10;
    var pageNumber = parseInt(req.query.pageNumber) || 0;

    var data = await Rentals.aggregate([
      {
        $match: { admin_id: admin_id },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await Rentals.countDocuments({ admin_id: admin_id });

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const rentalOwner = data[i].rentalowner_id;
      const propertyType = data[i].property_id;

      // Fetch client information
      const rental_owner_data = await RentalOwner.findOne({
        rentalowner_id: rentalOwner,
      });

      // Fetch property information
      const property_type_data = await PropertyType.findOne({
        property_id: propertyType,
      });

      // Attach client and property information to the data item
      data[i].rental_owner_data = rental_owner_data;
      data[i].property_type_data = property_type_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// ============== User ==================================

router.post("/rentals", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let rentalOwner, rental, units;

  try {
    // Extract data from the request body
    const rentalOwnerData = req.body.rentalOwner;
    const rentalData = req.body.rental;
    const unitDataArray = req.body.units;

    // Create or find rental owner
    const existingOwner = await RentalOwner.findOne({
      admin_id: rentalOwnerData.admin_id,
      rentalOwner_phoneNumber: rentalOwnerData.rentalOwner_phoneNumber,
    });

    if (existingOwner) {
      rentalOwner = existingOwner;
    } else {
      const rentalOwnerTimestamp = Date.now();
      rentalOwnerData.rentalowner_id = `${rentalOwnerTimestamp}`;
      rentalOwnerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      rentalOwnerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      rentalOwner = await RentalOwner.create(rentalOwnerData);
    }

    const existingRental = await Rentals.findOne({
      admin_id: rentalData.admin_id,
      rental_adress: rentalData.rental_adress,
      rental_city: rentalData.rental_city,
      rental_state: rentalData.rental_state,
    });

    if (existingRental) {
      rental = existingRental;
    } else {
      // Create rental
      const rentalTimestamp = Date.now();
      rentalData.rental_id = `${rentalTimestamp}`;
      rentalData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      rentalData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
      rentalData.rentalowner_id = rentalOwner.rentalowner_id;

      rental = await Rentals.create(rentalData);
    }

    // Create units
    units = [];

    for (const unitData of unitDataArray) {
      const unitTimestamp = Date.now();
      unitData.unit_id = `${unitTimestamp}`;
      unitData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      unitData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
      unitData.admin_id = rentalOwnerData.admin_id;
      unitData.rental_id = rentalData.rental_id;

      const unit = await Unit.create(unitData);
      units.push(unit);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send a successful response
    res.json({
      statusCode: 200,
      data: { rentalOwner, rental, units },
      message: "Add Rental Successfully",
    });
  } catch (error) {
    // If an error occurs, abort the transaction
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    } finally {
      session.endSession();
    }

    // Send an error response
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/rentals", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   var unit, rental, rentalOwner;
//   try {
//     // Extract data from the request body
//     const rentalOwnerData = req.body.rentalOwner;
//     const rentalData = req.body.rental;
//     const unitData = req.body.unit;

//     // Validate uniqueness based on admin_id and rentalOwner_phoneNumber
//     const existingOwner = await RentalOwner.findOne({
//       admin_id: rentalOwnerData.admin_id,
//       rentalOwner_phoneNumber: rentalOwnerData.rentalOwner_phoneNumber,
//     });

//     if (existingOwner) {
//       // Existing owner found
//       // Validate uniqueness based on admin_id, rental_adress, rental_city, and rental_state
//       const existingRental = await Rentals.findOne({
//         admin_id: rentalData.admin_id,
//         rental_adress: rentalData.rental_adress,
//         rental_city: rentalData.rental_city,
//         rental_state: rentalData.rental_state,
//       });

//       if (existingRental) {
//         // Existing rental found
//         // Validate uniqueness based on rental_unit_adress, admin_id, and rental_id
//         const existingUnit = await Unit.findOne({
//           rental_unit: unitData.rental_unit,
//           admin_id: unitData.admin_id,
//           rental_id: existingRental.rental_id,
//         });

//         throw new Error(
//           "Data cannot be stored. Existing owner and rental found."
//         );
//       } else {
//         // No existing rental or unit found
//         // Create Rental and Unit models
//         const rental_timestamp = Date.now();
//         const rental_id = `${rental_timestamp}`;
//         rentalData["rental_id"] = rental_id;

//         rentalData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         rentalData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//         // ===================== Rental  ===========================
//         rental = await Rentals.create(rentalData);

//         // Set rental_id in Unit models
//         unitData.rental_id = rentalData.rental_id;

//         // Add unique unit_id
//         const unit_timestamp = Date.now();
//         const unit_id = `${unit_timestamp}`;
//         unitData["unit_id"] = unit_id;

//         unitData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         unitData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//         // ===================== Unit  ======================
//         unit = await Unit.create(unitData);
//       }
//     } else {
//       // No existing owner found
//       // Create all models when no existing models are found
//       const rentalowner_timestamp = Date.now();
//       const rentalowner_id = `${rentalowner_timestamp}`;
//       rentalOwnerData["rentalowner_id"] = rentalowner_id;

//       rentalOwnerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//       rentalOwnerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//       // ===================== Create RentalOwner  ======================
//       rentalOwner = await RentalOwner.create(rentalOwnerData);

//       // Set rentalowner_id in Rental models
//       rentalData.rentalowner_id = rentalOwner.rentalowner_id;

//       // Add unique rental_id
//       const rental_timestamp = Date.now();
//       const rental_id = `${rental_timestamp}`;
//       rentalData["rental_id"] = rental_id;

//       rentalData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//       rentalData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//       // ===================== Rental  ===========================
//       rental = await Rentals.create(rentalData);

//       // Set rental_id in Unit models
//       unitData.rental_id = rentalData.rental_id;

//       // Add unique unit_id
//       const unit_timestamp = Date.now();
//       const unit_id = `${unit_timestamp}`;
//       unitData["unit_id"] = unit_id;

//       unitData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//       unitData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//       // ===================== Unit  ======================
//       unit = await Unit.create(unitData);
//     }

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     // Send a successful response
//     res.json({
//       statusCode: 200,
//       data: { rentalOwner, rental, unit },
//       message: "Add Rental Successfully",
//     });
//   } catch (error) {
//     // If an error occurs, abort the transaction
//     try {
//       await session.abortTransaction();
//     } catch (abortError) {
//       console.error("Error aborting transaction:", abortError);
//     } finally {
//       session.endSession();
//     }

//     // Send an error response
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/rental-owners/:admin_id", async (req, res) => {
  const adminId = req.params.admin_id;

  try {
    const rentalOwners = await RentalOwner.find({ admin_id: adminId });

    if (!rentalOwners || rentalOwners.length === 0) {
      return res
        .status(404)
        .json({ message: "No rental owners found for the given admin_id" });
    }

    res.status(200).json(rentalOwners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/rentals/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Rentals.aggregate([
      {
        $match: { admin_id: admin_id }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const rentalOwner = data[i].rentalowner_id;
      const propertyType = data[i].property_id;

      // Fetch client information
      const rental_owner_data = await RentalOwner.findOne({
        rentalowner_id: rentalOwner,
      });

      // Fetch property information
      const property_type_data = await PropertyType.findOne({
        property_id: propertyType,
      });

      // Attach client and property information to the data item
      data[i].rental_owner_data = rental_owner_data;
      data[i].property_type_data = property_type_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/rental_summary/:rental_id", async (req, res) => {
  try {
    const rental_id = req.params.rental_id;

    var data = await Rentals.aggregate([
      {
        $match: { rental_id: rental_id }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const rentalOwner = data[i].rentalowner_id;
      const propertyType = data[i].property_id;
      const staffmember = data[i].staffmember_id;

      // Fetch client information
      const rental_owner_data = await RentalOwner.findOne({
        rentalowner_id: rentalOwner,
      });

      // Fetch property information
      const property_type_data = await PropertyType.findOne({
        property_id: propertyType,
      });
      const staffmember_data = await StaffMember.findOne({
        staffmember_id: staffmember,
      });

      // Attach client and property information to the data item
      data[i].rental_owner_data = rental_owner_data;
      data[i].property_type_data = property_type_data;
      data[i].staffmember_data = staffmember_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
