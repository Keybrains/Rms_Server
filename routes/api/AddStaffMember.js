var express = require("express");
var router = express.Router();
var AddStaffMember = require("../../modals/AddStaffMember");
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../authentication");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var Workorder = require("../../modals/Workorder");
var Rentals = require("../../modals/Rentals");

// Add staffmember
router.post("/addstaffmember", async (req, res) => {
    try {
  
      var data = await AddStaffMember.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add staffmember Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });


  // get staffmember

  router.get("/addstaffmember", async (req, res) => {
    try {
      var data = await AddStaffMember.find({});
      data.reverse();
      res.json({
        statusCode: 200,
        data: data,
        message: "Read All staffmember",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  router.delete("/delete_staffmember", async (req, res) => {
    try {
      const staffIdsToDelete = req.body;
  
      // Get the names of the staff members to be deleted
      const staffMembersToDelete = await AddStaffMember.find({
        _id: { $in: staffIdsToDelete },
      }).select("staffmember_name");
  
      const staffMemberNamesToDelete = staffMembersToDelete.map(
        (staff) => staff.staffmember_name
      );
  
      // Check if any work order is associated with the staff members to be deleted
      const assignedWorkOrders = await Workorder.find({
        staffmember_name : { $in: staffMemberNamesToDelete },
      });

      const assignedProperty = await Rentals.find({
        "entries.staffmember_name" : { $in: staffMemberNamesToDelete },
      });
  
      if (assignedWorkOrders.length > 0) {
        return res.status(201).json({
          statusCode: 201,
          message:
            "Staff members are already assigned to work orders. Deletion not allowed.",
        });
      }

      if (assignedProperty.length > 0) {
        return res.status(202).json({
          statusCode: 202,
          message:
            "Staff members are already assigned to property. Deletion not allowed.",
        });
      }
  
      const result = await AddStaffMember.deleteMany({
        _id: { $in: staffIdsToDelete },
      });
  
      res.json({
        statusCode: 200,
        data: result,
        message: "Staff members deleted successfully",
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

    //edit staffmember 
router.put("/staffmember/:id", async (req, res) => {
    try {
      let result = await AddStaffMember.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "staffmember Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

  
//find staffmember 
router.get("/find_staffmember", async (req, res) => {
  try {
    var data = await AddStaffMember.find().select("staffmember_name")
    res.json({
      statusCode: 200,
      data: data,
      message: "read all staffmember",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


  //get staffmember  table  summary data id wise 

router.get("/staffmember_summary/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL parameter
    var data = await AddStaffMember.findById(userId);
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


// Login staffmember
router.post("/login", async (req, res) => {
  try {
    const user = await AddStaffMember.findOne({ staffmember_email: req.body.staffmember_email });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await AddStaffMember.findOne({ staffmember_password: req.body.staffmember_password });
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }

    // console.log("User found:", user);
    // console.log("Password match:", isMatch);

    const tokens = await createToken({
      _id: user._id,
      staffmember_email: user.staffmember_email,
    });

    if (isMatch) {
      res.json({
        statusCode: 200,
        message: "User Authenticated",
        token: tokens,
        data: user,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ statusCode: 500, message: error.message });
  }
});

module.exports = router;