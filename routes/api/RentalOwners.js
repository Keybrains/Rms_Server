var express = require("express");
var router = express.Router();
var RentalOwners = require("../../modals/RentalOwners");


//add rental owner
router.post("/rentalowner", async (req, res) => {
    try {

      var data = await RentalOwners.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add RentalOwners Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  // get rental owner
   router.get("/rentalowner", async (req, res) => {
  try {
    var data = await RentalOwners.find();
    data.reverse();
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All RentalOwners",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//delete rental owner
router.delete("/delete_rentalowner", async (req, res) => {
    try {
      let result = await RentalOwners.deleteMany({
        _id: { $in: req.body },
      });
      res.json({
        statusCode: 200,
        data: result,
        message: "RentalOwners Deleted Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

 //edit staffmember 
router.put("/rentalowner/:id", async (req, res) => {
    try {
      let result = await RentalOwners.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "RentalOwners Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });


//get RentalOwners table  summary data id wise 

router.get("/rentalowner/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL parameter
    var data = await RentalOwners.findById(userId);
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: " rentalowner summaryGet Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "rentalowner summary not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

 //fillter RentalOwners
 router.post("/filter_RentalOwners", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.rentalowner_firstName) { // Corrected from req.body.rentals
      pipeline.push({
        $match: { rentalowner_firstName: req.body.rentalowner_firstName },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await RentalOwners.aggregate(pipeline);
    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };
    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});


//search properties table data like rental_address etc

router.post("/search_RentalOwners", async (req, res) => {
  try {
    let newArray = [];
    newArray.push(
      {
        rentalowner_firstName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        rentalOwner_lastName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        rentalOwner_streetAdress: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      
    );
    var data = await RentalOwners.find({
      $or: newArray,
    });

    // Calculate the count of the searched data
    const dataCount = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: dataCount,  // Include the count in the response
      message: "Read All RentalOwners",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;