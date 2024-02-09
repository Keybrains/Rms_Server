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
router.post("/login", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      vendor_email: req.body.email,
    });
    console.log(vendor, "vendor")

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

router.post("/vendor", async (req, res) => {
  const vendorData = req.body;
  try {
    const existingVendor = await Vendor.findOne({
      admin_id: vendorData.admin_id,
      vendor_phoneNumber: vendorData.vendor_phoneNumber,
    });
    if (existingVendor) {
      return res.status(201).json({
        statusCode: 201,
        message: `${vendorData.vendor_phoneNumber} Phone Number Already Existing`,
      });
    } else {
      const vendorTimestamp = Date.now();
      vendorData.vendor_id = `${vendorTimestamp}`;
      vendorData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      vendorData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      const vendor = await Vendor.create(vendorData);
      res.json({
        statusCode: 200,
        data: vendor,
        message: "Vendor Added Successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/vendors/:admin_id", async (req, res) => {
  const admin_id = req.params.admin_id;
  try {
    const vendors = await Vendor.find({ admin_id: admin_id });

    if (vendors.length === 0) {
      return res
        .status(201)
        .json({ message: "No vendors found for the given admin_id" });
    }

    res.json({
      statusCode: 200,
      data: vendors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get_vendor/:vendor_id", async (req, res) => {
  const vendor_id = req.params.vendor_id;
  try {
    const vendors = await Vendor.findOne({ vendor_id: vendor_id });

    if (vendors.length === 0) {
      return res.status(201).json({ message: "No vendors found." });
    }

    res.json({
      statusCode: 200,
      data: vendors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update_vendor/:vendor_id", async (req, res) => {
  try {
    const { vendor_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await Vendor.findOneAndUpdate(
      { vendor_id: vendor_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Vendor Updated Successfully",
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
