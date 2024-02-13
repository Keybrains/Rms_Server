var express = require("express");
var router = express.Router();
var Surcharge = require("../../../modals/payment/Surcharge");
var moment = require("moment");

router.post("/surcharge", async (req, res) => {
  try {
    let findSurcharge = await Plans.findOne({
      admin_id: req.body.admin_id,
      surcharge_percent: req.body.surcharge_percent,
    });
    if (!findSurcharge) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["plan_id"] = uniqueId;
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
        statusCode: 500,
        message: `${req.body.surcharge_percent} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
