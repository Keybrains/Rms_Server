var express = require("express");
var router = express.Router();
var Applicant = require("../../../modals/superadmin/Applicant");
var Leasing = require("../../../modals/superadmin/Applicant_property");
var Unit = require("../../../modals/superadmin/Unit");
var moment = require("moment");
const Rentals = require("../../../modals/superadmin/Rentals");

router.post("/applicant", async (req, res) => {
  try {
    const existingApplicant = await Applicant.findOne({
      admin_id: req.body.applicant.admin_id,
      applicant_id: req.body.applicant.applicant_id,
    });
    if (!existingApplicant) {
      let findPlanName = await Applicant.findOne({
        admin_id: req.body.applicant.admin_id,
        applicant_phoneNumber: req.body.applicant.applicant_phoneNumber,
      });
      if (!findPlanName) {
        const timestamp = Date.now();
        const uniqueId = `${timestamp}`;
        req.body.applicant["applicant_id"] = uniqueId;

        req.body.applicant["createdAt"] = moment().format(
          "YYYY-MM-DD HH:mm:ss"
        );
        req.body.applicant["updatedAt"] = moment().format(
          "YYYY-MM-DD HH:mm:ss"
        );
        var data = await Applicant.create(req.body.applicant);

        const leasetimestamp = Date.now();
        const uniqueIdForLease = `${leasetimestamp}`;
        req.body.lease["lease_id"] = uniqueIdForLease;
        req.body.lease["applicant_id"] = data.applicant_id;
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
          message: `${req.body.applicant.applicant_phoneNumber} Number Already Added`,
        });
      }
    } else {
      var data = existingApplicant;
      const leasetimestamp = Date.now();
      const uniqueIdForLease = `${leasetimestamp}`;
      req.body.lease["lease_id"] = uniqueIdForLease;
      req.body.lease["applicant_id"] = data.applicant_id;
      req.body.lease["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body.lease["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

      var leaseData = await Leasing.create(req.body.lease);

      res.json({
        statusCode: 200,
        data: { data, leaseData },
        message: "Add Applicant Successfully",
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

    console.log(data);
    //   // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const applicant_id = data[i].applicant_id;

      // Fetch property information
      console.log(applicant_id);
      const lease_data = await Leasing.findOne({ applicant_id: applicant_id });
      console.log(lease_data);
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

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const applicant_id = data[i].applicant_id;

      // Fetch property information
      const lease_data = await Leasing.findOne({ applicant_id: applicant_id });

      const rental_adress_data = await Rentals.findOne({
        rental_id: lease_data.rental_id,
      });

      const rental_unit_data = await Unit.findOne({
        unit_id: lease_data.unit_id,
      });

      // Flatten lease_data structure
      const flattenedLeaseData = {
        ...lease_data.toObject(), // Convert Mongoose document to plain JavaScript object
        rental_adress: rental_adress_data.rental_adress,
        rental_unit: rental_unit_data.rental_unit,
      };

      // Attach client and property information to the data item
      data[i].lease_data = flattenedLeaseData;
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
