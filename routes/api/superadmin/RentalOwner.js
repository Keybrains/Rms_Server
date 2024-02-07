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

module.exports = router;
