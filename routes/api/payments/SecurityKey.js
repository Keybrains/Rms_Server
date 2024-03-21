var express = require("express");
var router = express.Router();
const moment = require("moment");
var SecurityKey = require("../../../modals/payment/SecurityKey");

router.post("/nmi-keys", async (req, res) => {
    try {   
        const timestamp = Date.now();
        const Id = `${timestamp}`;
        req.body["key_id"] = Id;
        req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
        req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      var data = await SecurityKey.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Security Key Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

router.get("/nmi-keys/:admin_id", async (req, res) => {
    try {
      var data = await SecurityKey.findOne({"admin_id" : req.params.admin_id});
    
      res.json({
        statusCode: 200,
        data: data,
        message: "Read admin security key",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

router.put("/nmi-keys/:id", async (req, res) => {
    try {
      let result = await SecurityKey.findOneAndUpdate({"key_id":req.params.id}, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "Security Key Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
});
  
  module.exports = router;