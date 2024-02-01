var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../../authentication");
var AdminRegister = require("../../../modals/superadmin/SuperAdmin");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var moment = require("moment");