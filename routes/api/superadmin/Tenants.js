var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var Lease = require("../../../modals/superadmin/Leasing");
var Unit = require("../../../modals/superadmin/Unit");



router.get('/tenant', async (req, res) => {
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

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const tenant = data[i];

      // Fetch unit data based on tenant_id from Lease collection
      const leases = await Lease.find({ tenant_id: tenant.tenant_id });

      // Fetch unit data from Unit collection based on unit_id from leases
      const unitData = await Promise.all(leases.map(async (lease) => {
        const unit = await Unit.findOne({ unit_id: lease.unit_id });
        return unit;
      }));

      // Attach client, property, and unit information to the data item
      data[i].unit_data = unitData.length > 1 ? unitData : unitData[0];
      data[i].admin_data = await AdminRegister.findOne({ admin_id: tenant.admin_id });
    }

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: 'Read All Tenant',
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
      message: "Rental and Rental Owner Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
