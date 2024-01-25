var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");

// ============== User ==================================

router.get("/tenants/:admin_id", async (req, res) => {
  const admin_id = req.params.admin_id;
  try {
    const tenants = await Tenant.find({ admin_id: admin_id });

    if (tenants.length === 0) {
      return res
        .status(201)
        .json({ message: "No tenants found for the given admin_id" });
    }

    res.json({
      statusCode: 200,
      data: tenants,
      message: "Rental and Rental Owner Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
