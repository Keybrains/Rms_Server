var express = require("express");
var router = express.Router();
var Workorder = require("../../modals/Workorder");
var moment = require("moment");
// var {verifyToken} = require("../authentication");

// Add workorder API
router.post("/workorder", async (req, res) => {
  try {
    const createdAt = moment().add(1, "seconds").format("YYYY-MM-DD HH:mm:ss");
    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const {
      workOrderImage,
      workorder_id,
      work_subject,
      rental_adress,
      rental_units,
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
      statusUpdatedBy,
      entries, // Array of parts and labor entries
    } = req.body;

    // const { statusUpdatedBy, ...restOfReqBody } = req.body;

    const workdata = {
      //...restOfReqBody,
      //createAt: createdAt,
      workorder_status: [
        {
          statusUpdatedBy: statusUpdatedBy || "", 
          status: status,
          due_date: due_date,
          staffmember_name: staffmember_name,
          updateAt: updatedAt,
          createdAt: createdAt,
        },
      ],
    };

    const data = await Workorder.create({
      createdAt:createdAt,
      workorder_id,
      work_subject,
      rental_adress,
      workOrderImage,
      rental_units,
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
      entries,
      ...workdata,
    
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

router.put("/workorder/:id/status", async (req, res) => {
  try {
    const Id = req.params.id;
    const newStatus = req.body.status;
    const newDuedate = req.body.due_date;
    const newStaff = req.body.staffmember_name;
    const statusUpdatedBy = req.body.statusUpdatedBy;

    if (!Id || !newStatus) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid request. Please provide 'status'.",
      });
    }

    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const updatedWorkorder = await Workorder.findByIdAndUpdate(
      Id,
      {
        $push: {
          workorder_status: {
            statusUpdatedBy: statusUpdatedBy,
            status: newStatus,
            due_date: newDuedate,
            staffmember_name: newStaff,
            updateAt: updatedAt,
            
          },
        },
      },
      { new: true }
    );

    if (!updatedWorkorder) {
      return res.status(404).json({
        statusCode: 404,
        message: "Workorder not found.",
      });
    }

    res.json({
      statusCode: 200,
      data: updatedWorkorder,
      message: "Workorder Status Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// get workorder
router.get("/findworkorderbyId/:workorder_id", async (req, res) => {
  try {
    const workorder_id = req.params.workorder_id;
    var data = await Workorder.find({ workorder_id });

    console.log(data, "workorder_id_________________________  ");
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

// delete workorder byId
router.delete("/deleteworkorderbyId/:workorder_id", async (req, res) => {
  try {
    const workorder_id = req.params.workorder_id;
    console.log("Deleting workorder with ID:", workorder_id);
    // Use mongoose to find and delete the workorder by workorder_id
    const deletedWorkorder = await Workorder.findOneAndDelete({ workorder_id });
    if (!deletedWorkorder) {
      return res.status(404).json({
        statusCode: 404,
        message: "Workorder not found",
      });
    }
    res.json({
      statusCode: 200,
      message: "Workorder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/updateworkorder/:id", async (req, res) => {
  try {
    req.body["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    let result = await Workorder.findByIdAndUpdate(req.params.id, req.body);
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


router.put('/workorder_enteries/:mainDocId/:entryId', async (req, res) => {
  try {
    const { mainDocId, entryId } = req.params;
    const {  _id: entryDocId, ...updateData } = req.body;
    // Find the Workorder document by its mainDocId
    let workorder = await Workorder.findById(mainDocId);
    if (!workorder) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Workorder not found',
      });
    }
    // Find the entry in the entries array based on its _id
    const entryIndex = workorder.entries.findIndex(entry => entry._id.toString() === entryId);
    if (entryIndex === -1) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Entry not found in the Workorder',
      });
    }
    // Check if the provided _id matches the entry _id
    if (workorder.entries[entryIndex]._id.toString() !== entryDocId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Provided _id does not match the entry _id',
      });
    }
    // Update the entry with the new data
    Object.assign(workorder.entries[entryIndex], updateData);
    // Save the updated Workorder document
    let result = await workorder.save();
    res.json({
      statusCode: 200,
      data: {  },
      message: 'Entry Updated Successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      statusCode: 500,
      message: err.message,
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
    req.body["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    let result = await Workorder.updateOne(
      { workorder_id: req.params.workorder_id },
      req.body
    );
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

    console.log(Workorder, "-------------------------YYYYYYYYYYYYYYYYYYYYYYYYY");
    var data = await Workorder.findOne({ workorder_id: userId });
    console.log(data,'-------------------------------------------')
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
router.get("/workorder/tenant/:rental_addresses/:rental_units", async (req, res) => {
  try {
    const rentalAddresses = req.params.rental_addresses.split("^");
    const rentalUnits = req.params.rental_units.split('^');

    if (rentalAddresses.length === 1 && rentalUnits.length === 1) {
      const singleAddress = rentalAddresses[0];
      const singleUnit = rentalUnits[0];

      const data = await Workorder.find({ rental_adress: singleAddress, rental_units: singleUnit });
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
      const data = await Workorder.find({
        rental_adress: { $in: rentalAddresses },
        rental_units: { $in: rentalUnits }
      });
      if (data && data.length > 0) {
        res.json({
          data: data,
          statusCode: 200,
          message:
            "Workorder details retrieved successfully for multiple rental addresses",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message:
            "Workorder details not found for the multiple rental addresses",
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

router.get("/workorder/vendor/:id", async (req, res) => {
  try {
    const workorderId = req.params.id;

    // Find the work order by workorder_id
    const workorder = await Workorder.findOne({ workorder_id: workorderId });

    if (!workorder) {
      return res.status(404).json({ message: "Workorder not found" });
    }

    // Extract vendor_name from the retrieved workorder document
    const vendorName = workorder.vendor_name;

    res.json({
      vendor_name: vendorName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
