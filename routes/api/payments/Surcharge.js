var express = require("express");
var router = express.Router();
var Surcharge = require("../../../modals/payment/Surcharge");
var Admin_Register = require("../../../modals/superadmin/Admin_Register");
var moment = require("moment");

router.post("/surcharge", async (req, res) => {
  try {
    let findSurcharge = await Surcharge.findOne({
      admin_id: req.body.admin_id,
      surcharge_percent: req.body.surcharge_percent,
      surcharge_percent_debit: req.body.surcharge_percent_debit,
      is_delete: false,
    });
    if (!findSurcharge) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["surcharge_id"] = uniqueId;
      req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

      var data = await Surcharge.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Surcharge Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.surcharge_percent} Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/surcharge/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Surcharge.aggregate([
      {
        $match: { admin_id: admin_id, is_delete: false }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      // Fetch property information
      const admin = await Admin_Register.findOne({ admin_id: admin_id });

      // Attach client and property information to the data item
      data[i].admin = admin;
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/surcharge/get/:surcharge_id", async (req, res) => {
  try {
    const surcharge_id = req.params.surcharge_id;
    const data = await Surcharge.find({ surcharge_id, is_delete: false });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified surcharge_id",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read PropertyType",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/surcharge/getadmin/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    const data = await Surcharge.find({ admin_id });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified admin_id",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read PropertyType",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/surcharge/:surcharge_id", async (req, res) => {
  try {
    const { surcharge_id } = req.params;
    const { surcharge_percent, surcharge_percent_debit } = req.body;

    if (!surcharge_id) {
      res.status(401).json({
        statusCode: 401,
        message: "surcharge_id is required in the request body",
      });
      return;
    }

    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    // Update the property if it exists
    const result = await Surcharge.findOneAndUpdate(
      { surcharge_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Surcharge Updated Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Surcharge not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/surcharge/:surcharge_id", async (req, res) => {
  const surcharge_id = req.params.surcharge_id;
  try {
    const result = await Surcharge.deleteOne({
      surcharge_id: surcharge_id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "Surcharge not found",
      });
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "Surcharge Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
