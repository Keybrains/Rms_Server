var express = require("express");
var router = express.Router();
var Plans = require("../../../modals/superadmin/Plans");
const moment = require("moment");

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
    let result = await Plans.findByIdAndUpdate(req.params.id, req.body);
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
      _id: { $in: req.body },
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
                { plan_duration_monts: !isNaN(searchValue) ? Number(searchValue) : null },
            ].filter(condition => condition),
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


  
module.exports = router;
