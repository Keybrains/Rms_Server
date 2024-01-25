var express = require("express");
var router = express.Router();
var RentalOwner = require("../../../modals/superadmin/RentalOwner");
var Unit = require("../../../modals/superadmin/Unit");
var Rentals = require("../../../modals/superadmin/Rentals");
var PropertyType = require("../../../modals/superadmin/PropertyType");
var StaffMember = require("../../../modals/superadmin/StaffMember");
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
    const rentalOwnerData = req.body.rentalOwner;
    const rentalData = req.body.rental;
    const unitDataArray = req.body.units;

    const existingOwner = await RentalOwner.findOne({
      admin_id: rentalOwnerData.admin_id,
      rentalOwner_phoneNumber: rentalOwnerData.rentalOwner_phoneNumber,
    });

    if (existingOwner) {
      rentalOwner = existingOwner;
      return res.status(201).json({
        statusCode: 201,
        message: `${rentalOwnerData.rentalOwner_phoneNumber} Phone Number Already Existing`,
      });
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
      return res.status(201).json({
        statusCode: 201,
        message: `${rentalData.rental_adress} Property Already Existing`,
      });
    } else {
      const rentalTimestamp = Date.now();
      rentalData.rental_id = `${rentalTimestamp}`;
      rentalData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      rentalData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
      rentalData.rentalowner_id = rentalOwner.rentalowner_id;

      rental = await Rentals.create(rentalData);
    }

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

    await session.commitTransaction();
    session.endSession();

    res.json({
      statusCode: 200,
      data: { rentalOwner, rental, units },
      message: "Add Rental Successfully",
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    } finally {
      session.endSession();
    }

    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

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

router.put("/rentals/:rental_id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let rental, rentalOwner;

  const {
    admin_id,
    rentalowner_id,
    rentalOwner_firstName,
    rentalOwner_lastName,
    rentalOwner_companyName,
    rentalOwner_primaryEmail,
    rentalOwner_phoneNumber,
    rentalOwner_homeNumber,
    rentalOwner_businessNumber,
  } = req.body.rentalOwner;

  const {
    rental_id,
    property_id,
    rental_adress,
    rental_city,
    rental_state,
    rental_country,
    rental_postcode,
    staffmember_id,
  } = req.body.rental;

  try {
    req.body.rentalOwner.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.rental.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const existingOwner = await RentalOwner.findOne({
      admin_id,
      rentalowner_id,
      rentalOwner_firstName,
      rentalOwner_lastName,
      rentalOwner_companyName,
      rentalOwner_primaryEmail,
      rentalOwner_phoneNumber,
      rentalOwner_homeNumber,
      rentalOwner_businessNumber,
    });

    const existingRental = await Rentals.findOne({
      admin_id,
      rentalowner_id,
      rental_id,
      property_id,
      rental_adress,
      rental_city,
      rental_state,
      rental_country,
      rental_postcode,
      staffmember_id,
    });

    if (existingRental && existingOwner) {
      return res.status(201).json({
        statusCode: 201,
        message: `Change Atleast One Field`,
      });
    } else if (existingOwner) {
      rental = await Rentals.findOneAndUpdate(
        { rental_id, admin_id },
        { $set: req.body.rental },
        { new: true }
      );
      res.json({
        statusCode: 200,
        data: { rental },
        message: "Rental Updated Successfully",
      });
    } else if (existingRental) {
      rentalOwner = await RentalOwner.findOneAndUpdate(
        { rentalowner_id, admin_id },
        { $set: req.body.rentalOwner },
        { new: true }
      );
      res.json({
        statusCode: 200,
        data: { rentalOwner },
        message: "Rental Owner Updated Successfully",
      });
    } else {
      rental = await Rentals.findOneAndUpdate(
        { rental_id, admin_id },
        { $set: req.body.rental },
        { new: true }
      );
      rentalOwner = await RentalOwner.findOneAndUpdate(
        { rentalowner_id, admin_id },
        { $set: req.body.rentalOwner },
        { new: true }
      );
      res.json({
        statusCode: 200,
        data: { rentalOwner, rental },
        message: "Rental and Rental Owner Updated Successfully",
      });
    }
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    } finally {
      session.endSession();
    }

    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
