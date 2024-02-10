var express = require("express");
var router = express.Router();
const moment = require("moment");
const RentalOwner = require("../../../modals/superadmin/RentalOwner");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");

router.get("/rental_owner/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await RentalOwner.aggregate([
      {
        $match: { admin_id: admin_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      const admin = await Admin_Register.findOne({ admin_id: admin_id });

      data[i].admin = {
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
      };
    }

    const count = data.length;

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

router.post("/search", async (req, res) => {
  try {
    const searchValue = req.body.search;
    const adminId = req.body.admin_id;

    let query = {
      admin_id: adminId,
    };

    if (searchValue) {
      query.$or = [
        { rentalOwner_firstName: { $regex: new RegExp(searchValue, "i") } },
        { rentalOwner_lastName: { $regex: new RegExp(searchValue, "i") } },
        { rentalOwner_primaryEmail: { $regex: new RegExp(searchValue, "i") } },
        {
          rentalOwner_phoneNumber: !isNaN(searchValue)
            ? Number(searchValue)
            : null,
        },
      ];
    }

    const data = await RentalOwner.find(query);

    const promises = data.map((rentalOwner) => {
      return RentalOwner.findOne({ admin_id: rentalOwner.admin_id });
    });

    const adminDataArray = await Promise.all(promises);

    const updatedData = data.map((rentalOwner, index) => {
      return {
        ...rentalOwner._doc,
        admin_data: adminDataArray[index],
      };
    });

    const dataCount = updatedData.length;

    res.json({
      statusCode: 200,
      data: updatedData,
      count: dataCount,
      message: "Search successful",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/rentalowner_details/:rentalowner_id", async (req, res) => {
  try {
    const rentalowner_id = req.params.rentalowner_id;

    var data = await RentalOwner.aggregate([
      {
        $match: { rentalowner_id: rentalowner_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    //   for (let i = 0; i < data.length; i++) {
    //     const admin_id = data[i].admin_id;

    //     const admin = await Admin_Register.findOne({ admin_id: admin_id });

    //     data[i].admin = {
    //       admin_id: admin.admin_id,
    //       first_name: admin.first_name,
    //       last_name: admin.last_name,
    //     };
    //   }

    const count = data.length;

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

router.get("/rental_owner_count/:admin_id", async (req, res) => {
  try {
    const { admin_id } = req.params;
    const rentals = await RentalOwner.find({ admin_id });
    const count = rentals.length;
    res.status(200).json({
      statusCode: 200,
      count: count,
      message: "Work-Order not found",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/rental_owner", async (req, res) => {
  try {
    const rentalOwnerTimestamp = Date.now();
    req.body.rentalowner_id = `${rentalOwnerTimestamp}`;
    req.body.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const rentalOwner = await RentalOwner.create(req.body);
    res.status(200).json({
      statusCode: 200,
      data: rentalOwner,
      message: "Rental-Owner Added Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
