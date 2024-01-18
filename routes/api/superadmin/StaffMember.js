var express = require("express");
var router = express.Router();
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var StaffMember = require("../../../modals/superadmin/StaffMember");
const moment = require("moment");
const { hashPassword, hashCompare } = require("../../../authentication");

//Post new staff member for admin
router.post("/staff_member", async (req, res) => {
  try {
    let findStaffMember = await StaffMember.findOne({
      staffmember_email: req.body.staffmember_email,
      admin_id: req.body.admin_id,
    });
    if (!findStaffMember) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      req.body["staffmember_id"] = uniqueId;
      req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      var data = await StaffMember.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add StaffMember Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.staffmember_email} E-mail Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get all staff members for admin
router.get("/staff_member/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await StaffMember.aggregate([
      {
        $match: { admin_id: admin_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      // Fetch property information
      const admin = await AdminRegister.findOne({ admin_id: admin_id });

      // Attach client and property information to the data item
      data[i].admin = admin;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//delete staff member for admin
router.delete("/staff_member/:staffmember_id", async (req, res) => {
  try {
    const staffmember_id = req.params.staffmember_id;

    let result = await StaffMember.deleteOne({
      staffmember_id: staffmember_id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "staffmember_id not found",
      });
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "Staff Member Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//update staff member for admin
router.put("/staff_member/:staffmember_id", async (req, res) => {
  try {
    const { staffmember_id } = req.params;
    const {
      admin_id,
      staffmember_email,
      staffmember_name,
      staffmember_designation,
      staffmember_phoneNumber,
      staffmember_password,
    } = req.body;

    if (!admin_id) {
      res.status(401).json({
        statusCode: 401,
        message: "admin_id is required in the request body",
      });
      return;
    }
    const existingProperty = await StaffMember.findOne({
      admin_id,
      staffmember_email,
      staffmember_name,
      staffmember_designation,
      staffmember_phoneNumber,
      staffmember_password,
    });

    if (existingProperty) {
      res.status(200).json({
        statusCode: 400,
        message: "Update Atleast one field.",
      });
      return;
    }

    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await StaffMember.findOneAndUpdate(
      { staffmember_id, admin_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Staff Member Updated Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Staff Member not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//get perticuler staff member for admin
router.get("/staff/member/:staffmember_id", async (req, res) => {
  try {
    const staffmember_id = req.params.staffmember_id;
    const data = await StaffMember.find({ staffmember_id });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified staffmember_id",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read StaffMember",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
