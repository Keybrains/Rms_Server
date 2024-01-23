var express = require("express");
var router = express.Router();
var Lease = require("../../../modals/superadmin/Leasing");
var Tenant = require("../../../modals/superadmin/Tenant");
var Cosigner = require("../../../modals/superadmin/Cosigner");
var Change = require("../../../modals/superadmin/Charge");
var moment = require("moment");
const { default: mongoose } = require("mongoose");

// ============== User ==================================

router.post("/rentals", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let lease, tenant, cosigner, charge;
});

module.exports = router;
