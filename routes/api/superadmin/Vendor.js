var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var Vendor = require("../../../modals/superadmin/Vendor");
var Lease = require("../../../modals/superadmin/Leasing");
var Unit = require("../../../modals/superadmin/Unit");
const { createVenorToken } = require("../../../authentication");
const bcrypt = require("bcryptjs");
var moment = require("moment");

// Vendor Login
// router.post("/login", async (req, res) => {
//   try {
//     const vendor = await Vendor.findOne({
//       vendor_email: req.body.email,
//     });

//     if (!vendor) {
//       return res.status(201).json({
//         statusCode: 201,
//         message: "vendor does not exist",
//       });
//     }

//     const compare = (req.body.password, vendor.vendor_password);

//     if (!compare) {
//       res.json({
//         statusCode: 202,
//         message: "Invalid Vendor password",
//       });
//       // return res.status(200).json({
//       //   statusCode: 202,
//       //   message: "Invalid Vendor password",
//       // });
//     }

//     const token = await createVenorToken({
//       _id: vendor._id,
//       vendor_id: vendor.vendor_id,
//       admin_id: vendor.admin_id,
//       vendor_name: vendor.vendor_name,
//       vendor_phoneNumber: vendor.vendor_phoneNumber,
//       vendor_email: vendor.vendor_email,
//       createdAt: vendor.createdAt,
//       updatedAt: vendor.updatedAt,
//     });

//     res.json({
//       statusCode: 200,
//       vendorToken: token,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       statusCode: 500,
//       message: error,
//     });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      vendor_email: req.body.email,
    });

    if (!vendor) {
      return res.status(201).json({
        statusCode: 201,
        message: "Vendor does not exist",
      });
    }

    // const passwordMatch = await bcrypt.compare(req.body.password, vendor.vendor_password);

    // if (!passwordMatch) {
    //   return res.json({
    //     statusCode: 202,
    //     message: "Invalid Vendor password",
    //   });
    // }

    if (req.body.password !== vendor.vendor_password) {
      return res.json({
        statusCode: 202,
        message: "Invalid Vendor password",
      });
    }

    const token = await createVenorToken({
      _id: vendor._id,
      vendor_id: vendor.vendor_id,
      admin_id: vendor.admin_id,
      vendor_name: vendor.vendor_name,
      vendor_phoneNumber: vendor.vendor_phoneNumber,
      vendor_email: vendor.vendor_email,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    });

    res.json({
      statusCode: 200,
      vendorToken: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
