var express = require("express");
var router = express.Router();
var Plans = require("../../../modals/superadmin/Plans");
var PlanPurchase = require("../../../modals/superadmin/Plans_Purchased");
var Rental = require("../../../modals/superadmin/Rentals");
var Admin = require("../../../modals/superadmin/Admin_Register");
const moment = require("moment");
const Tenant = require("../../../modals/superadmin/Tenant");
const StaffMember = require("../../../modals/superadmin/StaffMember");
const RentalOwner = require("../../../modals/superadmin/RentalOwner");
const Lease = require("../../../modals/superadmin/Leasing");
const Vendor = require("../../../modals/superadmin/Vendor");


router.post("/plans", async (req, res) => {
  try {
    let findPlanName = await Plans.findOne({
      plan_name: req.body.plan_name,
    });
    if (!findPlanName) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      req.body["plan_id"] = uniqueId;
      req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

      if (req.body.annual_discount !== null) {
        req.body.is_annual_discount = true;
      }

      var data = await Plans.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Plans Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.plan_name} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/plans", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await Plans.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await Plans.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Plans",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/plans/:id", async (req, res) => {
  try {
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    let result = await Plans.findOneAndUpdate(
      { plan_id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Plans Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/plans", async (req, res) => {
  try {
    let result = await Plans.deleteMany({
      plan_id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Plans Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search", async (req, res) => {
  try {
    const searchValue = req.body.search;

    const data = await Plans.find({
      $or: [
        { plan_name: { $regex: new RegExp(searchValue, "i") } },
        { plan_price: !isNaN(searchValue) ? Number(searchValue) : null },
        // {
        //   plan_duration_monts: !isNaN(searchValue) ? Number(searchValue) : null,
        // },
      ].filter((condition) => condition),
    });

    const dataCount = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: dataCount,
      message: "Read All Advertise-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/plan_get/:plan_id", async (req, res) => {
  try {
    const plan_id = req.params.plan_id;

    const data = await Plans.find({ plan_id: plan_id });

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/planlimitations/property/:admin_id", async (req, res) => {
  try {
    // Check if admin can add rental records
    const adminId = req.params.admin_id;
    const admin = await Admin.findOne({ admin_id: adminId });
    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const planPur = await PlanPurchase.findOne({
      admin_id: adminId,
      is_active: true,
    });
    const planId = planPur.plan_id;
    console.log(planId);
    const plan = await Plans.findOne({ plan_id: planId });
    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const propertyCountLimit = plan.property_count;
    const rentalCount = await Rental.countDocuments({
      admin_id: adminId,
      is_delete: "false",
    });

    if (rentalCount >= propertyCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        message:
          "Plan limitation is for " + propertyCountLimit + " rental records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      rentalCount: rentalCount, // If needed, you can also return the rental count
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/planlimitations/tenant/:admin_id", async (req, res) => {
  try {
    const adminId = req.params.admin_id;
    const admin = await Admin.findOne({ admin_id: adminId });
    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const planPur = await PlanPurchase.findOne({
      admin_id: adminId,
      is_active: true,
    });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });
    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }
    console.log(plan.tenant_count);

    const tenantCountLimit = plan.tenant_count;
    const tenantCount = await Tenant.countDocuments({
      admin_id: adminId,
      is_delete: "false",
    });

    if (tenantCount >= tenantCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        message:
          "Plan limitation is for " + tenantCountLimit + " tenant records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      tenantCount: tenantCount,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/planlimitations/staff/:admin_id", async (req, res) => {
  try {
    const adminId = req.params.admin_id;
    console.log(adminId);
    const admin = await Admin.findOne({ admin_id: adminId });
    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const planPur = await PlanPurchase.findOne({
      admin_id: adminId,
      is_active: true,
    });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });
    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const staffCountLimit = plan.staffmember_count;
    const staffCount = await StaffMember.countDocuments({
      admin_id: adminId,
      is_delete: "false",
    });

    if (staffCount >= staffCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        message:
          "Plan limitation is for " + staffCountLimit + " staff member records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      staffCount: staffCount,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/planlimitations/rentalowner/:admin_id", async (req, res) => {
  try {
    const adminId = req.params.admin_id;
    console.log(adminId);
    const admin = await Admin.findOne({ admin_id: adminId });
    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const planPur = await PlanPurchase.findOne({
      admin_id: adminId,
      is_active: true,
    });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });
    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const rentalOwnerCountLimit = plan.rentalowner_count;
    const rentalOwnerCount = await RentalOwner.countDocuments({
      admin_id: adminId,
      is_delete: "false",
    });

    if (rentalOwnerCount >= rentalOwnerCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        message:
          "Plan limitation is for " +
          rentalOwnerCountLimit +
          "rental owner records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      rentalOwnerCount: rentalOwnerCount,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/planlimitations/lease/:admin_id", async (req, res) => {
  try {
    const adminId = req.params.admin_id;
    console.log(adminId);
    const admin = await Admin.findOne({ admin_id: adminId });
    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const planPur = await PlanPurchase.findOne({
      admin_id: adminId,
      is_active: true,
    });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });
    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const leaseCountLimit = plan.lease_count;
    const leaseCount = await Lease.countDocuments({
      admin_id: adminId,
      is_delete: "false",
    });

    if (leaseCount >= leaseCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        message: "Plan limitation is for " + leaseCountLimit + " lease records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      leaseCount: leaseCount,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/planlimitations/vendor/:admin_id", async (req, res) => {
  try {
    const adminId = req.params.admin_id;
    console.log(adminId);
    const admin = await Admin.findOne({ admin_id: adminId });
    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const planPur = await PlanPurchase.findOne({ admin_id: adminId });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });
    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const vendorCountLimit = plan.vendor_count;
    const vendorCount = await Vendor.countDocuments({
      admin_id: adminId,
      is_delete: "false",
    });

    if (vendorCount >= vendorCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        message:
          "Plan limitation is for " + vendorCountLimit + " vendor records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      vendorCount: vendorCount,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
