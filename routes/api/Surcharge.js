var express = require("express");
var router = express.Router();
var Surcharge = require("../../modals/Payment/Surcharge");

router.post("/surcharge", async (req, res) => {
    try {   
      var data = await Surcharge.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Surcharge Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

router.get("/surcharge/:id", async (req, res) => {
    try {
      var data = await Surcharge.findById(req.params.id);
      res.json({
        statusCode: 200,
        data: data,
        message: "Read All Surcharge",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

router.put("/surcharge/:id", async (req, res) => {
    try {
      let result = await Surcharge.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "Surcharge Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
});
  
  module.exports = router;