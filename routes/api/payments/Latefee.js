var express = require("express");
const moment = require("moment");
var router = express.Router();
var LateFee = require("../../../modals/payment/Latefee");

router.post("/latefee", async (req, res) => {
    try {   
    const timestamp = Date.now();
    const Id = `${timestamp}`;
    req.body["latefee_id"] = Id;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
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

router.get("/latefee/:admin_id", async (req, res) => {
    try {
      var data = await LateFee.findOne({"admin_id": req.params.admin_id});
    //   data.reverse();
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
        const updateFields = {
            updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            ...req.body // Spread operator to include other fields from req.body
        };

        let result = await LateFee.findOneAndUpdate(
            { latefee_id: req.params.id }, // Filter criteria
            updateFields, // Fields to update
            { new: true } // To return the updated document
        );

        if (!result) {
            return res.status(404).json({
                statusCode: 404,
                message: "Late Fee not found"
            });
        }

        res.json({
            statusCode: 200,
            data: result,
            message: "Late Fee Data Updated Successfully",
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            message: err.message,
        });
    }
});

  
  module.exports = router;