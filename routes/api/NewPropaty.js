var express = require("express");
var router = express.Router();
var NewProparty = require("../../modals/NewProparty");
var Rentals = require ("../../modals/Rentals");


router.post("/newproparty", async (req, res) => {
    try {
  
      var data = await NewProparty.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add newproparty Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

// // Add proparty
// router.post("/newproparty", async (req, res) => {
//   try {
//     let findproperty_type = await NewProparty.findOne({
//       property_type: req.body.property_type,
      
//     });
//     if (!findproperty_type) {
//       var count = await NewProparty.count();
//       function pad(num) {
//         num = num.toString();
//         while (num.length < 2) num = "0" + num;
//         return num;
//       }
//       req.body["propertyId"] = pad(count + 1);
//       var data = await NewProparty.create(req.body);
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add property Successfull",
//       });
//     } else {
//       res.json({
//         statusCode: 500,
//         // message: `${req.body.property_type} Proparty Allready Added`,
//       });
//     }
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// });



//find proparty type
router.get("/find_propartytype", async (req, res) => {
  try {
    var data = await NewProparty.find().select("property_type")
    res.json({
      statusCode: 200,
      data: data,
      message: "read all propartytype",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


  // get proparty
router.get("/newproparty", async (req, res) => {
  try {
    var data = await NewProparty.find({});
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


// get proparty type and sub type(dropdoun)
router.get("/propropartytype", async (req, res) => {
  try {
    var data = await NewProparty.find({});
    // Create an object to store property types and their subtypes
    const formattedData = {};
    data.forEach((property) => {
      const { property_type, propertysub_type } = property;
      if (!formattedData[property_type]) {
        formattedData[property_type] = [];
      }
      formattedData[property_type].push({ propertysub_type });
    });
    res.json({
      statusCode: 200,
      data: formattedData,
      message: "Read All property type and subtype",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



// delete proparty type working 
// router.delete("/newproparty", async (req, res) => {
//     try {
//       const propIdsToDelete = req.body;

//       console.log("propIdsToDelete from body", propIdsToDelete);
  
//       // Get the names of the staff members to be deleted
//       const propertyToDelete = await NewProparty.find({
//         _id: { $in: propIdsToDelete },
//       }).select("propertysub_type");
//       console.log("propertyToDelete after variable",propertyToDelete)
  
//       const propNamesToDelete = propertyToDelete.map(
//         (staff) => staff.propertysub_type
//       );
  
//       const assignedProperty = await Rentals.find({
//         property_type: { $in: propNamesToDelete },
//       }); 
  
//       if (assignedProperty.length > 0) {
//         return res.status(201).json({
//           statusCode: 201,
//           message:
//             "Property Type are already assigned. Deletion not allowed.",
//         });
//       }

//       const result = await NewProparty.deleteMany({
//         _id: { $in: propIdsToDelete },
//       });
      
//       res.json({
//         statusCode: 200,
//         data: result,
//         message: "property Deleted Successfully",
//       });
//     } catch (err) {
//       console.log(err, "fsjlkdfjsdsfdljsldk")
//       res.json({
//         statusCode: 500,
//         message: err.message,
//       });
//     } 
//   });

router.delete("/newproparty", async (req, res) => {
  try {
    const propIdsToDelete = req.body;

    // Get the property types to be deleted
    const propertyToDelete = await NewProparty.find({
      _id: { $in: propIdsToDelete },
    }).select("propertysub_type");

    const propNamesToDelete = propertyToDelete.map(
      (property) => property.propertysub_type
    );

    const assignedProperty = await Rentals.find({
      "entries.property_type": { $in: propNamesToDelete },
    });

    if (assignedProperty.length > 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "Property Type is already assigned. Deletion not allowed.",
      });
    }

    const result = await NewProparty.deleteMany({
      _id: { $in: propIdsToDelete },
    });

    res.json({
      statusCode: 200,
      data: result,
      message: "Property Deleted Successfully",
    });
  } catch (err) {
    console.log(err, "Error occurred");
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});



  //edit proparty type Data
router.put("/proparty-type/:id", async (req, res) => {
  try {
    let result = await NewProparty.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Proparty_type Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});
  
  //get property  table  summary data id wise 

  router.get("/newproperty_summary/:id", async (req, res) => {
    try {
      const userId = req.params.id; // Get the user ID from the URL parameter
      var data = await NewProparty.findById(userId);
      if (data) {
        res.json({
          data: data,
          statusCode: 200,
          message: "summaryGet Successfully",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "summary not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

module.exports = router;