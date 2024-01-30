var JWTD = require("jwt-decode");
var jwtDecode = require("jwt-decode");
var bcrypt = require("bcryptjs");
var JWT = require("jsonwebtoken");

var SECRET_KEY =
  "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^";

var hashPassword = async (pwd) => {
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(pwd, salt);
  return hash;
};

var hashCompare = async (pwd, hash) => {
  let result = await bcrypt.compare(pwd, hash);
  return result;
};

var createToken = async ({
  _id,
  admin_id,
  email,
  first_name,
  last_name,
  company_name,
  phone_number,
}) => {
  let token = await JWT.sign(
    {
      id: _id,
      admin_id: admin_id,
      first_name: first_name,
      last_name: last_name,
      email: email,
      company_name: company_name,
      phone_number: phone_number,
    },
    SECRET_KEY,
    {
      expiresIn: "12h",
    }
  );
  return token;
};

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Assuming the token is provided as "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: "Token not provided.",
      });
    }

    // Verify token integrity and expiration
    JWT.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          statusCode: 401,
          message: "Invalid Token",
        });
      }

      // Token has been verified, check expiration
      const currentTimestamp = Date.now() / 1000;
      if (currentTimestamp >= decoded.exp) {
        return res.status(401).json({
          statusCode: 401,
          message: "Token Expired. Please login again.",
        });
      }

      // Token is valid and not expired
      next();
    });
  } catch (error) {
    res.status(401).json({
      statusCode: 401,
      message: "Invalid Token",
    });
  }
};

module.exports = {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
};
