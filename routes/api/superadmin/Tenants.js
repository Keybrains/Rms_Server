var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var Lease = require("../../../modals/superadmin/Leasing");
var Rentals = require("../../../modals/superadmin/Rentals");
var Unit = require("../../../modals/superadmin/Unit");
var Rentals = require("../../../modals/superadmin/Rentals");
const { createTenantToken } = require("../../../authentication");
var moment = require("moment");

router.get("/tenant", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10;
    var pageNumber = parseInt(req.query.pageNumber) || 0;

    var data = await Tenant.aggregate([
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

    var count = await Tenant.countDocuments();

    for (let i = 0; i < data.length; i++) {
      const tenant = data[i];

      // Fetch unit data based on tenant_id from Lease collection
      const leases = await Lease.find({ tenant_id: tenant.tenant_id });

      // Fetch unit data from Unit collection based on unit_id from leases
      const unitData = await Promise.all(
        leases.map(async (lease) => {
          const unit = await Unit.findOne({ unit_id: lease.unit_id });
          return unit;
        })
      );

      data[i].unit_data = unitData.length > 1 ? unitData : unitData[0];
      data[i].admin_data = await AdminRegister.findOne({
        admin_id: tenant.admin_id,
      });
    }

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Tenant",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// ============== User ==================================

router.get("/tenants/:admin_id", async (req, res) => {
  const admin_id = req.params.admin_id;
  try {
    const tenants = await Tenant.find({ admin_id: admin_id });

    if (tenants.length === 0) {
      return res
        .status(201)
        .json({ message: "No tenants found for the given admin_id" });
    }

    res.json({
      statusCode: 200,
      data: tenants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get_tenant/:tenant_id", async (req, res) => {
  const tenant_id = req.params.tenant_id;
  try {
    const tenants = await Tenant.findOne({ tenant_id: tenant_id });

    if (tenants.length === 0) {
      return res.status(201).json({ message: "No tenants found." });
    }

    res.json({
      statusCode: 200,
      data: tenants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/tenants", async (req, res) => {
  const tenantData = req.body;
  try {
    const existingTenants = await Tenant.findOne({
      admin_id: tenantData.admin_id,
      tenant_phoneNumber: tenantData.tenant_phoneNumber,
    });
    if (existingTenants) {
      return res.status(201).json({
        statusCode: 201,
        message: `${tenantData.tenant_phoneNumber} Phone Number Already Existing`,
      });
    } else {
      const tenantTimestamp = Date.now();
      tenantData.tenant_id = `${tenantTimestamp}`;
      tenantData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      tenantData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      const tenant = await Tenant.create(tenantData);
      res.json({
        statusCode: 200,
        data: tenant,
        message: "Add Lease Successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/tenants/:tenant_id", async (req, res) => {
  try {
    const { tenant_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await Tenant.findOneAndUpdate(
      { tenant_id: tenant_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Tenant Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Tenant not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/tenant/:tenant_id", async (req, res) => {
  const tenant_id = req.params.tenant_id;
  try {
    const existingTenant = await Lease.findOne({
      tenant_id: tenant_id,
    });

    if (existingTenant) {
      return res.status(201).json({
        statusCode: 201,
        message: `Cannot delete tenant. The tenant is already assigned to a lease.`,
      });
    } else {
      const deletedTenant = await Tenant.deleteOne({
        tenant_id: tenant_id,
      });

      console.log(deletedTenant.deletedCount, tenant_id);
      if (deletedTenant.deletedCount === 1) {
        return res.status(200).json({
          statusCode: 200,
          message: `Tenant deleted successfully.`,
        });
      } else {
        return res.status(201).json({
          statusCode: 201,
          message: `Tenant not found. No action taken.`,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Tenant Login
router.post("/login", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      tenant_email: req.body.email,
    });

    if (!tenant) {
      return res.status(201).json({
        statusCode: 201,
        message: "Tenant does not exist",
      });
    }

    // const compare = await bcrypt.compare(req.body.password, tenant.tenant_password);

    // if (!compare) {
    //   return res.status(200).json({
    //     statusCode: 202,
    //     message: "Invalid Tenant password",
    //   });
    // }

    if (req.body.password !== tenant.tenant_password) {
      return res.json({
        statusCode: 202,
        message: "Invalid Tenant password",
      });
    }

    const token = await createTenantToken({
      _id: tenant._id,
      tenant_id: tenant.tenant_id,
      admin_id: tenant.admin_id,
      tenant_firstName: tenant.tenant_firstName,
      tenant_lastName: tenant.tenant_lastName,
      tenant_phoneNumber: tenant.tenant_phoneNumber,
      tenant_alternativeNumber: tenant.tenant_alternativeNumber,
      tenant_email: tenant.tenant_email,
      tenant_alternativeEmail: tenant.tenant_alternativeEmail,
      tenant_birthDate: tenant.tenant_birthDate,
      taxPayer_id: tenant.taxPayer_id,
      comments: tenant.comments,
      emergency_contact: tenant.emergency_contact,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });

    res.json({
      statusCode: 200,
      // expiresAt: expiresIn,
      tenantToken: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});

router.get("/tenant_profile/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    const tenantData = await Tenant.findOne({ tenant_id: tenant_id });

    if (!tenantData) {
      return res.status(404).json({
        statusCode: 404,
        message: "Tenant not found",
      });
    }

    const data = {};
    const leaseData = await Lease.find({ tenant_id: tenant_id });

    data.tenantData = tenantData;
    data.leaseData = [];
    for (let i = 0; i < leaseData.length; i++) {
      const rental_id = leaseData[i].rental_id;

      const rentalData = await Rentals.findOne({ rental_id: rental_id });

      data.leaseData.push({
        lease: leaseData[i],
        rental: rentalData,
      });
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
