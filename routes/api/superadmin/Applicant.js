var express = require("express");
var router = express.Router();
var Applicant = require("../../../modals/superadmin/Applicant");
var Leasing = require("../../../modals/superadmin/Leasing");
var Unit = require("../../../modals/superadmin/Unit");
var moment = require("moment");
const Rentals = require("../../../modals/superadmin/Rentals");

router.post("/applicant", async (req, res) => {
  try {
    let findPlanName = await Applicant.findOne({
      admin_id: req.body.applicant.admin_id,
      applicant_phoneNumber: req.body.applicant.applicant_phoneNumber,
    });
    if (!findPlanName) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      req.body.applicant["applicant_id"] = uniqueId;

      req.body.applicant["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body.applicant["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      var data = await Applicant.create(req.body.applicant);

      const leasetimestamp = Date.now();
      const uniqueIdForLease = `${leasetimestamp}`;
      req.body.lease["lease_id"] = uniqueIdForLease;
      req.body.lease["tenant_id"] = data.applicant_id;
      req.body.lease["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body.lease["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

      var leaseData = await Leasing.create(req.body.lease);

      res.json({
        statusCode: 200,
        data: { data, leaseData },
        message: "Add Applicant Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.applicant.applicant_phoneNumber} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/applicant/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Applicant.aggregate([
      {
        $match: { admin_id: admin_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    //   // Fetch client and property information for each item in data
    //   for (let i = 0; i < data.length; i++) {
    //     const admin_id = data[i].admin_id;

    //     // Fetch property information
    //     const admin = await AdminRegister.findOne({ admin_id: admin_id });

    //     // Attach client and property information to the data item
    //     data[i].admin = admin;
    //   }

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

router.get("/applicant_lease/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Applicant.aggregate([
      {
        $match: { admin_id: admin_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    //   // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const tenant_id = data[i].applicant_id;

      // Fetch property information
      const lease_data = await Leasing.findOne({ tenant_id: tenant_id });
      const rental_data = await Rentals.findOne({
        rental_id: lease_data.rental_id,
      });
      const unit_data = await Unit.findOne({ unit_id: lease_data.unit_id });

      // Attach client and property information to the data item
      data[i].lease_data = lease_data;
      data[i].rental_data = rental_data;
      data[i].unit_data = unit_data;
    }

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

router.get("/applicant_summary/:applicant_id", async (req, res) => {
  try {
    const applicant_id = req.params.applicant_id;

    var data = await Applicant.aggregate([
      {
        $match: { applicant_id: applicant_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    //   // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const tenant_id = data[i].applicant_id;

      // Fetch property information
      const lease_data = await Leasing.findOne({ tenant_id: tenant_id });

      // Attach client and property information to the data item
      data[i].lease_data = lease_data;
    }

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

module.exports = router;
