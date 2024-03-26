var express = require("express");
var router = express.Router();
var Vendor = require("../../../modals/superadmin/Vendor");
var WorkOrder = require("../../../modals/superadmin/WorkOrder");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
const { createVenorToken } = require("../../../authentication");
var moment = require("moment");
const crypto = require("crypto");
const { default: axios } = require("axios");
var emailService = require("./emailService");
const Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const Plans = require("../../../modals/superadmin/Plans");

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

// ===================  Super Admin===========================================

router.get("/vendor/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Vendor.aggregate([
      {
        $match: { admin_id: admin_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      // Fetch property information
      const admin = await AdminRegister.findOne({ admin_id: admin_id });

      // Attach client and property information to the data item
      data[i].admin = admin;
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Vendor",
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
        { vendor_name: { $regex: new RegExp(searchValue, "i") } },
        { vendor_email: { $regex: new RegExp(searchValue, "i") } },
        {
          vendor_phoneNumber: !isNaN(searchValue) ? Number(searchValue) : null,
        },
      ];
    }

    const data = await Vendor.find(query);

    const promises = data.map((vendorData) => {
      return AdminRegister.findOne({ admin_id: vendorData.admin_id });
    });

    const adminDataArray = await Promise.all(promises);

    const updatedData = data.map((vendorData, index) => {
      return {
        ...vendorData._doc,
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

// ===========================================================================

router.get("/dashboard_workorder/:vendor_id/:admin_id", async (req, res) => {
  try {
    const vendor_id = req.params.vendor_id;
    const admin_id = req.params.admin_id;

    const new_workorder = await WorkOrder.find({
      vendor_id: vendor_id,
      admin_id: admin_id,
      status: "New",
    })
      .select("work_subject work_category workOrder_id date status")
      .sort({ date: -1 });

    const currentDate = moment().format("YYYY-MM-DD");
    const overdue_workorder = await WorkOrder.find({
      vendor_id: vendor_id,
      admin_id: admin_id,
      status: { $ne: "Complete" },
      date: { $lt: currentDate },
    })
      .select("work_subject work_category workOrder_id date status")
      .sort({ date: -1 });

    res.json({
      data: { new_workorder, overdue_workorder },
      statusCode: 200,
      message: "Read Work-orders",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Vendor Login
router.post("/login", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      vendor_email: req.body.email,
      admin_id: req.body.admin_id,
      is_delete: false,
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
      message: "Vendor Login Success",
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
    console.log(req.body.admin_id);
    const externalApiResponse = await axios.get(
      `https://saas.cloudrentalmanager.com/api/plans/planlimitations/vendor/${req.body.admin_id}`
    );
    console.log(externalApiResponse);
    if (externalApiResponse.status === 201) {
      return res.status(200).json(externalApiResponse.data);
    }

    const existingVendor = await Vendor.findOne({
      admin_id: vendorData.admin_id,
      vendor_phoneNumber: vendorData.vendor_phoneNumber,
      is_delete: false,
    });

    const adminData = await AdminRegister.findOne({
      admin_id: req.body.admin_id,
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

      // const subject = "Vendor Login Credentials";
      // const text = `
      //   <p>Hello,</p>
      //   <p>Here are your credentials for vendor login:</p>
      //   <p>Email: ${req.body.vendor_email}</p>
      //   <p>Password: ${req.body.vendor_password}</p>
      //   <p>Login URL: https://saas.cloudrentalmanager.com/auth/${adminData?.company_name}/vendor/login</p>
      // `;

      const ApiResponse = await axios.post(
        `http://localhost:4000/api/admin/passwordmail`,{
          tenant_email: req.body.vendor_email
          // name : tenantData.tenant_firstName + tenantData.tenant_lastName
        }
      );
      if (ApiResponse.status === 200) {
        console.log('Password mail sent successfully');
      }
      // Send email with login credentials
      // await emailService.sendWelcomeEmail(req.body.vendor_email, subject, text);
      let hashConvert = encrypt(req.body.vendor_password);
      req.body.vendor_password = hashConvert;

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
    const planPurchase = await Plans_Purchased.findOne({
      admin_id,
      is_active: true,
    });

    let isFreePlan = false;
    if (planPurchase) {
      const plan = await Plans.findOne({ plan_id: planPurchase.plan_id });
      if (plan && plan.plan_name === "Free Plan") {
        isFreePlan = true;
      }
    }

    let queryConditions = { admin_id: admin_id, is_delete: false };

    if (isFreePlan) {
      queryConditions = {
        $or: [{ admin_id: admin_id }, { admin_id: "is_trial" }],
        is_delete: false,
      };
    }

    const vendors = await Vendor.find(queryConditions).sort({ createdAt: -1 });

    if (vendors.length === 0) {
      return res.status(201).json({ message: "No vendors found for the given admin_id or trial" });
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

    vendors.vendor_password = decrypt(vendors.vendor_password);
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
    req.body.vendor_password = encrypt(req.body.vendor_password);
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

router.delete("/delete_vendor/:vendor_id", async (req, res) => {
  try {
    const vendor_id = req.params.vendor_id;
    const existingWorkorder = await WorkOrder.findOne({
      vendor_id: vendor_id,
    });

    if (existingWorkorder) {
      return res.status(201).json({
        statusCode: 201,
        message: `Cannot delete Vendor. Vendor already assigned to workorder!`,
      });
    } else {
      let result = await Vendor.updateOne(
        { vendor_id: req.params.vendor_id },
        { $set: { is_delete: true } }
      );

      res.json({
        statusCode: 200,
        data: result,
        message: "Vendor Deleted Successfully",
      });
    }
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/limitation/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    const vendorCount = await Vendor.count({ admin_id, is_delete: false });
    const planPur = await Plans_Purchased.findOne({ admin_id });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });

    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const vendorCountLimit = plan.vendor_count;

    if (vendorCount >= vendorCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        vendorCount: vendorCount,
        vendorCountLimit: vendorCountLimit,
        message:
          "Plan limitation is for " + vendorCountLimit + " vendor records",
      });
    }
    console.log("vendorCount", vendorCount);
    console.log("vendorCountLimit", vendorCountLimit);

    res.status(200).json({
      statusCode: 200,
      vendorCount: vendorCount,
      vendorCountLimit: vendorCountLimit,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/vendor_count/:admin_id", async (req, res) => {
  try {
    const { admin_id } = req.params;
    const rentals = await Vendor.find({ admin_id, is_delete: false });
    const count = rentals.length;
    res.status(200).json({
      statusCode: 200,
      count: count,
      message: "Vendor found",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
