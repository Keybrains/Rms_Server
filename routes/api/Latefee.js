var express = require("express");
var router = express.Router();
var LateFee = require("../../modals/Payment/Latefee");

router.post("/latefee", async (req, res) => {
    try {   
      var data = await LateFee.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add late fee Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

router.get("/latefee", async (req, res) => {
    try {
      var data = await LateFee.find({});
      data.reverse();
      res.json({
        statusCode: 200,
        data: data,
        message: "Read All newproparty",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

router.put("/latefee/:id", async (req, res) => {
    try {
      let result = await LateFee.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "Late Fee Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
});
  
  module.exports = router;