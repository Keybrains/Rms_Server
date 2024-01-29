var express = require("express");
var router = express.Router();
var Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const moment = require("moment");

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

module.exports = router;
