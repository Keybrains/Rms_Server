var express = require("express");
var router = express.Router();
var AddRecuringAcc = require("../../modals/AddRecuringAcc");

//add account 
// router.post("/addaccount", async (req, res) => {
//     try {

//       var data = await AddRecuringAcc.create(req.body);
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add  Successfully",
//       });
//     } catch (error) {
//       res.json({
//         statusCode: 500,
//         message: error.message,
//       });
//     }
//   });


  router.post("/addRecuringAcc", async (req, res) => {
    try {
      // Check if an account with the same name already exists
      const existingAccount = await AddRecuringAcc.findOne({ account_name: req.body.account_name });
      
      if (existingAccount) {
        return res.status(400).json({
          statusCode: 400,
          message: "An account with the same name already exists.",
        });
      }
  
      // If no existing account with the same name, create a new one
      const data = await AddRecuringAcc.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Account added successfully",
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  });


  //get account
  router.get("/addaccount", async (req, res) => {
    try {
      var data = await AddRecuringAcc.find();
      res.json({
        data: data,
        statusCode: 200,
        message: "Read All addaccount",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  //delete account 
  router.delete("/delete_account", async (req, res) => {
    try {
      let result = await AddRecuringAcc.deleteMany({
        _id: { $in: req.body },
      });
      res.json({
        statusCode: 200,
        data: result,
        message: "Account Deleted Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

   //edit account 
 router.put("/account/:id", async (req, res) => {
  try {
    let result = await AddRecuringAcc.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "account Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

  //find accountname 
router.get("/find_accountname", async (req, res) => {
  try {
    var data = await AddRecuringAcc.find().select("account_name")
    res.json({
      statusCode: 200,
      data: data,
      message: "read all accountname",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


//fillter api account name  wise
router.post("/filteraccount_name", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.account_name) { // Corrected from req.body.rentals
      pipeline.push({
        $match: { account_name: req.body.account_name },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await AddRecuringAcc.aggregate(pipeline);
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



module.exports = router;