var express = require("express");
var router = express.Router();
var Charge = require("../../../modals/superadmin/Charge");
const moment = require("moment");

router.post("/charge", async (req, res) => {
  try {
    const fetchTime = () => {
      const timestamp = Date.now();
      return timestamp;
    };
    const charges = req.body.map((charge) => ({
      ...charge,
      charge_id: fetchTime(),
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    }));

    const createdCharges = await Promise.all(
      charges.map((charge) => Charge.create(charge))
    );

    res.json({
      statusCode: 200,
      data: createdCharges,
      message: "Add Charges Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
