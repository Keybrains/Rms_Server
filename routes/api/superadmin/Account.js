var express = require("express");
var router = express.Router();
var Account = require("../../../modals/superadmin/Account");
var moment = require("moment");

// ============== User ==================================

router.post("/accounts", async (req, res) => {
  try {
    const accountData = req.body;
    const timestamp = Date.now();
    accountData.account_id = `${timestamp}`;
    accountData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    accountData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const newAccount = await Account.create(accountData);

    res.json({
      statusCode: 200,
      data: newAccount,
      message: "Add Account Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/accounts/:admin_id", async (req, res) => {
  const admin_id = req.params.admin_id;
  try {
    const accounts = await Account.find({ admin_id: admin_id });

    if (accounts.length === 0) {
      return res
        .status(201)
        .json({ message: "No accounts found for the given admin_id" });
    }

    res.json({
      statusCode: 200,
      data: accounts,
      message: "Rental and Rental Owner Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
