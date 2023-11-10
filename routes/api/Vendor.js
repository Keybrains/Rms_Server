var express = require("express");
var router = express.Router();
var Vendor = require("../../modals/Vendor");
var Workorder = require("../../modals/Workorder");
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../authentication");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");


// Add Vendor
router.post("/vendor", async (req, res) => {
    try {
  
      var data = await Vendor.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Vendor Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  // get Vendor

  router.get("/vendor", async (req, res) => {
    try {
      var data = await Vendor.find({});
      data.reverse();
      res.json({
        statusCode: 200,
        data: data,
        message: "Read All Vendor",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  // delete Vendor 
router.delete("/delete_vendor", async (req, res) => {
    try {
      const staffIdsToDelete = req.body;
  
      // Get the names of the staff members to be deleted
      const staffMembersToDelete = await Vendor.find({
        _id: { $in: staffIdsToDelete },
      }).select("vendor_name");
  
      const staffMemberNamesToDelete = staffMembersToDelete.map(
        (staff) => staff.vendor_name
      );
  
      // Check if any work order is associated with the staff members to be deleted
      const assignedWorkOrders = await Workorder.find({
        vendor_name: { $in: staffMemberNamesToDelete },
      });

      if (assignedWorkOrders.length > 0) {
        return res.status(201).json({
          statusCode: 201,
          message:
            "Vendor is already assigned to work orders. Deletion not allowed.",
        });
      }
  
      const result = await Vendor.deleteMany({
        _id: { $in: staffIdsToDelete },
      });

      res.json({
        statusCode: 200,
        data: result,
        message: "Agent Deleted Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

      //edit  Vendor 
router.put("/vendor/:id", async (req, res) => {
    try {
      let result = await Vendor.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "Vendor Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

  
  //get Agent table  summary data id wise 

router.get("/vendor_summary/:id", async (req, res) => {
    try {
      const userId = req.params.id; // Get the user ID from the URL parameter
      var data = await Vendor.findById(userId);
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

  // Login vendor
router.post("/login", async (req, res) => {
    try {
      const user = await Vendor.findOne({ vendor_email: req.body.vendor_email });
      if (!user) {
        return res.json({ statusCode: 403, message: "User doesn't exist" });
      }
      const isMatch = await Vendor.findOne({ vendor_password: req.body.vendor_password });
      if (!isMatch) {
        return res.json({ statusCode: 402, message: "Enter Valid Password" });
      }
  
      // console.log("User found:", user);
      // console.log("Password match:", isMatch);
  
      const tokens = await createToken({
        _id: user._id,
        vendor_email: user.vendor_email,
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

 //find all /vendor_name
router.get("/vendor_name", async (req, res) => {
  try {
    var data = await Vendor.find().select("vendor_name")
    res.json({
      statusCode: 200,
      data: data,
      message: "read all property",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
}); 
  

  module.exports = router;