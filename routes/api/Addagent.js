var express = require("express");
var router = express.Router();
var Tenants = require("../../modals/Tenants");
var Addagent = require("../../modals/Addagent");
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../authentication");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");


// Add Agent
router.post("/addagent", async (req, res) => {
    try {
  
      var data = await Addagent.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Agent Successfully",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });


  // get Agent
  
  router.get("/addagent", async (req, res) => {
    try {
      var data = await Addagent.find({});
      data.reverse();
      res.json({
        statusCode: 200,
        data: data,
        message: "Read All Agent",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });


// delete Agent 
router.delete("/delete_agent", async (req, res) => {
    try {

      const propIdsToDelete = req.body;
  
      // Get the names of the staff members to be deleted
      const propertyToDelete = await Addagent.find({
        _id: { $in: propIdsToDelete },
      }).select("agent_name");
  
      const propNamesToDelete = propertyToDelete.map(
        (staff) => staff.agent_name
      );
  
      const assignedProperty = await Tenants.find({
        "entries.leasing_agent": { $in: propNamesToDelete },
      }); 
  
      if (assignedProperty.length > 0) {
        return res.status(201).json({
          statusCode: 201,
          message:
            "Agent are already assigned. Deletion not allowed.",
        });
      }

      const result = await Addagent.deleteMany({
        _id: { $in: propIdsToDelete },
      });

      // let result = await Addagent.deleteMany({
      //   _id: { $in: req.body },
      // });

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

    //edit Agent
router.put("/agent/:id", async (req, res) => {
    try {
      let result = await Addagent.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "Agent Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });


  //get Agent table  summary data id wise 

router.get("/agent_summary/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL parameter
    var data = await Addagent.findById(userId);
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



  
//find Agent
router.get("/find_agentname", async (req, res) => {
  try {
    var data = await Addagent.find().select("agent_name")
    res.json({
      statusCode: 200,
      data: data,
      message: "read all Agent",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// Login agent
router.post("/login", async (req, res) => {
  try {
    const user = await Addagent.findOne({ agent_email: req.body.agent_email });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await Addagent.findOne({ agent_password: req.body.agent_password });
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }

    // console.log("User found:", user);
    // console.log("Password match:", isMatch);

    const tokens = await createToken({
      _id: user._id,
      agent_email: user.agent_email,
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