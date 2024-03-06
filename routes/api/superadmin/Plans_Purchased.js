var express = require("express");
var router = express.Router();

var Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const moment = require("moment");
const Plans = require("../../../modals/superadmin/Plans");

router.post("/purchase", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["purchase_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    var data = await Plans_Purchased.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Plan Purchased Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/plan-purchase/:id", async (req, res) => {
  try {
    const planPurchase = await Plans_Purchased.findOne({
      admin_id: req.params.id,
    });

    if (!planPurchase) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan purchase not found",
      });
    }

    const plan = await Plans.findOne({ plan_id: planPurchase.plan_id });

    res.status(200).json({
      statusCode: 200,
      message: "Plan purchase details retrieved successfully",
      data: { ...planPurchase.toObject(), plan_name: plan.plan_name },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;