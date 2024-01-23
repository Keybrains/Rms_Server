var express = require("express");
var router = express.Router();
var Applience = require("../../../modals/superadmin/Applience");
const moment = require("moment");

router.post("/appliance", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    req.body["appliance_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    var data = await Applience.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Applience Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/appliance/:unit_id", async (req, res) => {
  try {
    const unit_id = req.params.unit_id;
    const data = await Applience.find({ unit_id });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified unit_id",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Applience",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/appliance/:appliance_id", async (req, res) => {
  try {
    const { appliance_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await Applience.findOneAndUpdate(
      { appliance_id: appliance_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Applience Updated Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Applience not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/appliance/:appliance_id", async (req, res) => {
  try {
    const appliance_id = req.params.appliance_id;

    let result = await Applience.deleteOne({
      appliance_id: appliance_id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "appliance_id not found",
      });
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "Applience Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
