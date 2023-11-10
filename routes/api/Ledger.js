var express = require("express");
var router = express.Router();
var Ledger = require("../../modals/Ledger");

//add ledger api
//  router.post("/ledger", async (req, res) => {
//     try {
  
//       var data = await Ledger.create(req.body);
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add Ledger Successfully",
//       });
//     } catch (error) {
//       res.json({
//         statusCode: 500,
//         message: error.message,
//       });
//     }
//   });

// Add ledger API 
router.post("/ledger", async (req, res) => {
  try {
    const {
      date,
      rental_adress,
      memo,
      date_range,
      attachment,
      total_amount,
      entries,
    } = req.body;

    const data = await Ledger.create({
      date,
      rental_adress,
      memo,
      date_range,
      attachment,
      total_amount,
      entries,
    });

    // Remove the _id fields from the entries
    const responseData = { ...data.toObject() };
    responseData. entries = responseData. entries.map((entryItem) => {
      delete entryItem._id;
      return entryItem;
    });

    res.json({
      statusCode: 200,
      data: responseData,
      message: "Add Ledger Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});




// Add ledger
// router.post("/ledger", async (req, res) => {
//   try {
//       // Extract data from the request body
//       const {
//           date,
//           rental_adress,
//           memo,
//           date_range,
//           attachment,
//           entry,
//       } = req.body;

//       // Create a new Ledger instance
//       const Ledger = new Ledger({
//           date,
//           rental_adress,
//           memo,
//           date_range,
//           attachment,
//           entry,
//       });

//       // Save the new ledger entry to the database
//       const data = await Ledger.save();

//       res.status(201).json({
//           statusCode: 201,
//           data,
//           message: "Add Ledger Successfully",
//       });
//   } catch (error) {
//       res.status(500).json({
//           statusCode: 500,
//           message: error.message,
//       });
//   }
// });


    // get Ledger
router.get("/ledger", async (req, res) => {
    try {
      var data = await Ledger.find({});
      data.reverse();
      res.json({
        statusCode: 200,
        data: data,
        message: "Read All Ledger",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  
    // delete workorder 
router.delete("/delete_ledger", async (req, res) => {
    try {
      let result = await Ledger.deleteOne({
        _id: { $in: req.body },
      });
      res.json({
        statusCode: 200,
        data: result,
        message: "ledger Deleted Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

  
      //edit ledger
      router.put("/ledger/:id", async (req, res) => {
        try {
          let result = await Ledger.findByIdAndUpdate(req.params.id, req.body);
          res.json({
            statusCode: 200,
            data: result,
            message: "ledger Data Updated Successfully",
          });
        } catch (err) {
          res.json({
            statusCode: 500,
            message: err.message,
          });
        }
      });



      //fillter api account name  wise
router.post("/filterdate_range", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.date_range) { // Corrected from req.body.rentals
      pipeline.push({
        $match: { date_range: req.body.date_range },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await Ledger.aggregate(pipeline);
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


router.post("/filterproperty_type", async (req, res) => {
  try {
    let pipeline = [];

    // Filter by rental_adress if provided
    if (req.body.rental_adress) {
      pipeline.push({
        $match: { rental_adress: req.body.rental_adress },
      });
    }

    // Filter by account if provided
    if (req.body.account) {
      pipeline.push({
        $match: { "entries.account": req.body.account },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });

    let result = await Ledger.aggregate(pipeline);

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