var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../authentication");
var Registers = require("../../modals/Register");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");

// Registers
router.post("/register", async (req, res) => {
  try {
    const user = await Registers.findOne({ email: req.body.email });
    const emailCheck = await Registers.findOne({
      email: req.body.email,
    });
    if (user) {
      return res
        .status(401)
        .send({ statusCode: 401, message: "Email all ready in use" });
    }
    if (emailCheck) {
      return res
        .status(402)
        .send({ statusCode: 402, message: "Email already in use" });
    }
    let hashConvert = await hashPassword(req.body.password, req.body.cPassword);
    req.body.password = hashConvert;
    req.body.cPassword = hashConvert;
    const data = await Registers.create(req.body);

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

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await Registers.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await hashCompare(req.body.password, user.password);
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }

    const tokens = await createToken({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      mobileNumber: user.mobileNumber,
    });
    if (isMatch) {
      res.json({
        statusCode: 200,
        message: "User Authenticated",
        token: tokens,
        data: user,
      });
    }
  } catch (error) {
    res.json({ statusCode: 500, message: error });
  }
});

router.get("/users", async (req, res) => {
  try {
    var data = await Registers.find().select("-cPassword");
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Register Users",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// chack authentication  // varify token
router.post("/auth", verifyToken, async (req, res) => {
  res.json({
    statusCode: 200,
    message: req.body.purpose,
  });
});

module.exports = router;
