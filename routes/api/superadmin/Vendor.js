var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var Vendor = require("../../../modals/superadmin/Vendor");
var Lease = require("../../../modals/superadmin/Leasing");
var Unit = require("../../../modals/superadmin/Unit");
const { createVenorToken } = require("../../../authentication");
var moment = require("moment");

// Vendor Login
router.post("/login", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      vendor_email: req.body.email,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "vendor does not exist",
      });
    }

    const compare = (req.body.password, vendor.vendor_password);

    if (!compare) {
      return res.status(422).json({
        success: false,
        message: "Wrong password",
      });
    }

    const tokens = await createVenorToken({
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
      vendorToken: tokens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});

module.exports = router;
