var express = require("express");
var router = express.Router();
var Email = require("../../../modals/AddEmail/Email");
var Surcharge = require("../../../modals/payment/Surcharge");
const moment = require("moment");

router.post("/", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    req.body["email_configration_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    var data = await Email.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Email Configration Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await Email.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await Email.countDocuments();

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

router.get("/mail/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    const data = await Email.find({ admin_id });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified admin_id",
      });
    }
    res.json({
      statusCode: 200,
      data: data,
      message: "Get Email Configuration Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
