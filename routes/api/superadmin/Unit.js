var express = require("express");
var router = express.Router();
var Unit = require("../../../modals/superadmin/Unit");
const moment = require("moment");

router.get("/rental_unit/:rental_id", async (req, res) => {
  try {
    const rental_id = req.params.rental_id;

    var data = await Unit.aggregate([
      {
        $match: { rental_id: rental_id }, // Filter by rental_id
      },
    ]);

    // Fetch client and property information for each item in data
    // for (let i = 0; i < data.length; i++) {
    //   const rentalOwner = data[i].rentalowner_id;
    //   const propertyType = data[i].property_id;

    //   // Fetch client information
    //   const rental_owner_data = await RentalOwner.findOne({
    //     rentalowner_id: rentalOwner,
    //   });

    //   // Attach client and property information to the data item
    //   data[i].rental_owner_data = rental_owner_data;
    // }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/unit/:unit_id", async (req, res) => {
  try {
    const { unit_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await Unit.findOneAndUpdate(
      { unit_id: unit_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Unit Updated Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Unit not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/unit", async (req, res) => {
  try {
    let findUnitName = await Unit.findOne({
      rental_id: req.body.rental_id,
      rental_unit: req.body.rental_unit,
    });
    if (!findUnitName) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      req.body["unit_id"] = uniqueId;
      req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      var data = await Unit.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Umit Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.rental_unit} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
