var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../../authentication");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var moment = require("moment");

// Registers
router.post("/register", async (req, res) => {
  try {
    const user = await AdminRegister.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(401)
        .send({ statusCode: 401, message: "Email all ready in use" });
    }
    let hashConvert = await hashPassword(req.body.password, req.body.cPassword);
    req.body.password = hashConvert;
    req.body.cPassword = hashConvert;

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["admin_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    const data = await AdminRegister.create(req.body);

    if (data) {
      res.json({
        statusCode: 200,
        data: data,
        message: "Add successfully",
      });
    } else {
      return res.json({ statusCode: 500, message: "User doesn't exist" });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await AdminRegister.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await hashCompare(req.body.password, user.password);
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }

    const tokens = await createToken({
      _id: user._id,
      admin_id: user.admin_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      compony_name: user.compony_name,
      phone_number: user.phone_number,
    });
    if (isMatch) {
      res.json({
        statusCode: 200,
        message: "User Authenticated",
        token: tokens,
      });
    }
  } catch (error) {
    res.json({ statusCode: 500, message: error });
  }
});

module.exports = router;
