var express = require("express");
var router = express.Router();
var Workorder = require("../../modals/Workorder");
// var {verifyToken} = require("../authentication");

// Add workorder api
// Add workorder API
router.post("/workorder", async (req, res) => {
  try {
    const {
      workorder_id,
      work_subject,
      rental_adress,
      unit_no,
      work_category,
      vendor_name,
      invoice_number,
      work_charge,
      entry_allowed,
      detail,
      entry_contact,
      work_performed,
      vendor_note,
      staffmember_name,
      collaborators,
      status,
      due_date,
      priority,
      upload_file,
      final_total_amount,
      entries, // Array of parts and labor entries
    } = req.body;

    const data = await Workorder.create({
      workorder_id,
      work_subject,
      rental_adress,
      unit_no,
      work_category,
      vendor_name,
      invoice_number,
      work_charge,
      entry_allowed,
      detail,
      entry_contact,
      work_performed,
      vendor_note,
      staffmember_name,
      collaborators,
      status,
      due_date,
      priority,
      upload_file,
      final_total_amount,
      entries, // Store the array of entries
    });

    // Remove the _id fields from the entries
    const responseData = { ...data.toObject() };
    responseData.entries = responseData.entries.map((entry) => {
      delete entry._id;
      return entry;
    });

    res.json({
      statusCode: 200,
      data: responseData,
      message: "Add workorder Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



  //get workorder
  router.get("/workorder", async (req, res) => {
    try {
      var data = await Workorder.find();
      data.reverse();
      res.json({
        data: data,
        statusCode: 200,
        message: "Read All workorder",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  // delete workorder 
router.delete("/delete_workorder", async (req, res) => {
    try {
      let result = await Workorder.deleteOne({
        _id: { $in: req.body },
      });
      res.json({
        statusCode: 200,
        data: result,
        message: "workorder Deleted Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

      //edit workorder
      router.put("/workorder/:workorder_id", async (req, res) => {
        try {
          let result = await Workorder.updateOne({ workorder_id: req.params.workorder_id }, req.body);
          res.json({
            statusCode: 200,
            data: result,
            message: "Workorder Data Updated Successfully",
          });
        } catch (err) {
          res.json({
            statusCode: 500,
            message: err.message,
          });
        }
      });
      

    //get workorder table  summary data id wise 

    router.get("/workorder_summary/:workorder_id", async (req, res) => {
      try {
        const userId = req.params.workorder_id; 
        var data = await Workorder.findOne({ workorder_id: userId }); 
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
    

// get workorder data as per rental address 
 // get workorder data as per rental address
router.get("/workorder/:rental_adress", async (req, res) => {
  try {
    const address = req.params.rental_adress;
    // Use the `find` method to fetch all records that match the rental_adress
    const data = await Workorder.find({ rental_adress: address });
    if (data && data.length > 0) {
      res.json({
        data: data,
        statusCode: 200,
        message: "Workorder details retrieved successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Workorder details not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});


    // get workorder data as per work_assigned
router.get("/workorder/by-staff-member/:staffmember_name", async (req, res) => {
      try {
        const name = req.params.staffmember_name;
        const data = await Workorder.find({ staffmember_name: name });
        if (data) {
          res.json({
            data: data,
            statusCode: 200,
            message: "Workorder details retrieved successfully",
          });
        } else {
          res.status(404).json({
            statusCode: 404,
            message: "Workorder details not found",
          });
        }
      } catch (error) {
        res.status(500).json({
          statusCode: 500,
          message: error.message,
        });
      }
    });

    
     // get workorder data as per rental address
router.get("/workorder/tenant/:rental_addresses", async (req, res) => {
  try {
    const rentalAddresses = req.params.rental_addresses.split('-');
    
    if (rentalAddresses.length === 1) {
      // Handle a single rental address
      const singleAddress = rentalAddresses[0];
      const data = await Workorder.find({ rental_adress: singleAddress });
      if (data) {
        res.json({
          data: data,
          statusCode: 200,
          message: "Workorder details retrieved successfully",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "Workorder details not found for the single rental address",
        });
      }
    } else {
      // Handle multiple rental addresses
      const data = await Workorder.find({ rental_adress: { $in: rentalAddresses } });
      if (data && data.length > 0) {
        res.json({
          data: data,
          statusCode: 200,
          message: "Workorder details retrieved successfully for multiple rental addresses",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "Workorder details not found for the multiple rental addresses",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
  

module.exports = router;