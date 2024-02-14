var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var Vendor = require("../../../modals/superadmin/Vendor");
var Lease = require("../../../modals/superadmin/Leasing");
var Unit = require("../../../modals/superadmin/Unit");
const { createVenorToken } = require("../../../authentication");
var moment = require("moment");
const crypto = require("crypto");
var emailService = require("./emailService");
const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "mansi");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  // Make sure to require the crypto module
  const decipher = crypto.createDecipher("aes-256-cbc", "mansi");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

// Vendor Login
router.post("/login", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      vendor_email: req.body.email,
      admin_id: req.body.admin_id,
    });
    console.log(vendor, "vendor");

    if (!vendor) {
      return res.status(201).json({
        statusCode: 201,
        message: "Vendor does not exist",
      });
    }


    const passwordMatch = decrypt(vendor.vendor_password);

    if (!passwordMatch) {
      return res.json({
        statusCode: 202,
        message: "Invalid Vendor password",
      });
    }

    if (req.body.password !== passwordMatch) {
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
      token: token,
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
      let hashConvert = encrypt(req.body.vendor_password);
      req.body.vendor_password = hashConvert;



      const subject = "Vendor Login Credentials";
      const text = `
        <p>Hello,</p>
        <p>Here are your credentials for vendor login:</p>
        <p>Email: ${req.body.vendor_email}</p>
        <p>Password: ${req.body.vendor_password}</p>
        <p>Login URL: https://your-vendor-login-url.com</p>
      `;
  
      // Send email with login credentials
      await emailService.sendWelcomeEmail(req.body.vendor_email, subject, text);

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
