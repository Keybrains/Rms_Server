var express = require("express");
var router = express.Router();
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var StaffMember = require("../../../modals/superadmin/StaffMember");
const moment = require("moment");
const { createVenorToken } = require("../../../authentication");

// ============== Super Admin ==================================

router.get("/staffmember", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10;
    var pageNumber = parseInt(req.query.pageNumber) || 0;

    var data = await StaffMember.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await StaffMember.countDocuments();

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const adminData = data[i].admin_id;

      // Fetch client information
      const admin_data = await AdminRegister.findOne({
        admin_id: adminData,
      });

      // Attach client and property information to the data item
      data[i].admin_data = admin_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Staff-Members",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/search", async (req, res) => {
  try {
    const searchValue = req.body.search;

    const data = await StaffMember.find({
      $or: [
        { staffmember_name: { $regex: new RegExp(searchValue, "i") } },
        { staffmember_designation: { $regex: new RegExp(searchValue, "i") } },
        { staffmember_email: { $regex: new RegExp(searchValue, "i") } },
        {
          staffmember_phoneNumber: !isNaN(searchValue)
            ? Number(searchValue)
            : null,
        },
      ].filter((condition) => condition),
    });

    // Fetch admin data for each staff member asynchronously
    const promises = data.map(async (staffMember) => {
      const adminData = staffMember.admin_id;
      const admin_data = await AdminRegister.findOne({
        admin_id: adminData,
      });
      return { ...staffMember._doc, admin_data }; // Attach abcd to staffMember data
    });

    // Wait for all promises to resolve
    const updatedData = await Promise.all(promises);

    const dataCount = updatedData.length;

    res.json({
      statusCode: 200,
      data: updatedData,
      count: dataCount,
      message: "Search successful",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/getByAdmin", async (req, res) => {
  try {
    const { first_name, last_name } = req.body;

    // Fetch admin data based on the provided first_name and last_name
    const adminData = await AdminRegister.findOne({
      first_name,
      last_name,
    });

    if (!adminData) {
      return res.status(404).json({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    // Fetch staff data associated with the admin
    const staffData = await StaffMember.find({
      admin_id: adminData.admin_id,
    });

    const dataCount = staffData.length;

    // Create an array with combined admin and staff data
    const combinedData = staffData.map((staffMember) => ({
      ...staffMember._doc,
      admin_data: { ...adminData._doc },
    }));

    res.json({
      statusCode: 200,
      data: combinedData,
      count: dataCount,
      message: "Search successful",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// ==========================  User  ==================================================================

// StaffMember Login
router.post("/login", async (req, res) => {
  try {
    const staff_member = await StaffMember.findOne({
      staffmember_email: req.body.email,
    });

    if (!staff_member) {
      return res.status(201).json({
        statusCode: 201,
        message: "staff-Member does not exist",
      });
    }

    // const compare = await bcrypt.compare(req.body.password, staff_member.staffmember_password);

    // if (!compare) {
    //   return res.status(200).json({
    //     statusCode: 202,
    //     message: "Invalid Saff-Member password",
    //   });
    // }

    if (req.body.password !== staff_member.staffmember_password) {
      return res.json({
        statusCode: 202,
        message: "Invalid Saff-Member password",
      });
    }

    const token = await createVenorToken({
      _id: staff_member._id,
      staff_member_id: staff_member.staffmember_id,
      admin_id: staff_member.admin_id,
      staffmember_name: staff_member.staffmember_name,
      staffmember_designation: staff_member.staffmember_designation,
      staffmember_phoneNumber: staff_member.staffmember_phoneNumber,
      staffmember_email: staff_member.staffmember_email,
      createdAt: staff_member.createdAt,
      updatedAt: staff_member.updatedAt,
    });

    res.json({
      statusCode: 200,
      staff_memberToken: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: error,
    });
  }
});

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
