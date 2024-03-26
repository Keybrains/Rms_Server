var express = require("express");
var router = express.Router();
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var StaffMember = require("../../../modals/superadmin/StaffMember");
const moment = require("moment");
const {
  createStaffMemberToken,
  hashPassword,
  hashCompare,
} = require("../../../authentication");
const Rentals = require("../../../modals/superadmin/Rentals");
const WorkOrder = require("../../../modals/superadmin/WorkOrder");
const Unit = require("../../../modals/superadmin/Unit");
const Leasing = require("../../../modals/superadmin/Leasing");
const RentalOwner = require("../../../modals/superadmin/RentalOwner");
const PropertyType = require("../../../modals/superadmin/PropertyType");
const crypto = require("crypto");
var emailService = require("./emailService");
const { default: axios } = require("axios");
const Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const Plans = require("../../../modals/superadmin/Plans");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "mansi");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  // Make sure to require the crypto module
  const decipher = crypto.createDecipher("aes-256-cbc", "mansi");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

// ============== Super Admin ==================================

//get all Staff-Member for Super-Admin
router.get("/staffmember/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    const planPur = await Plans_Purchased.findOne({
      admin_id,
      is_active: true,
    });

    const plan = await Plans.findOne({ plan_id: planPur.plan_id });
    console.log(plan);

    var data = [];
    if (plan.plan_name === "Free Plan") {
      console.log("=========");
      const data1 = await StaffMember.find({
        admin_id: admin_id,
        is_delete: false,
      });

      const data2 = await StaffMember.find({
        admin_id: "is_trial",
        is_delete: false,
      });

      data.push(...data1, ...data2);
    } else {
      const data1 = await StaffMember.find({
        admin_id: admin_id,
        is_delete: false,
      });

      data.push(...data1);
    }

    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      // Fetch property information
      const admin = await AdminRegister.findOne({ admin_id: admin_id });

      // Attach client and property information to the data item
      data[i].admin = admin;
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Request",
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
    const adminId = req.body.admin_id;

    let query = {
      admin_id: adminId,
    };

    if (searchValue) {
      query.$or = [
        { staffmember_name: { $regex: new RegExp(searchValue, "i") } },
        { staffmember_designation: { $regex: new RegExp(searchValue, "i") } },
        { staffmember_email: { $regex: new RegExp(searchValue, "i") } },
        {
          staffmember_phoneNumber: !isNaN(searchValue)
            ? Number(searchValue)
            : null,
        },
      ];
    }

    const data = await StaffMember.find(query);

    const promises = data.map((staffMember) => {
      return AdminRegister.findOne({ admin_id: staffMember.admin_id });
    });

    const adminDataArray = await Promise.all(promises);

    const updatedData = data.map((staffMember, index) => {
      return {
        ...staffMember._doc,
        admin_data: adminDataArray[index],
      };
    });

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

router.get("/count/:staffmember_id/:admin_id", async (req, res) => {
  try {
    const staffmember_id = req.params.staffmember_id;
    const admin_id = req.params.admin_id;
    const property_staffMember = await Rentals.find({
      staffmember_id: staffmember_id,
      admin_id: admin_id,
      is_delete: false,
    });
    const workorder_staffMember = await WorkOrder.find({
      staffmember_id: staffmember_id,
      admin_id: admin_id,
      is_delete: false,
    });

    res.json({
      property_staffMember: property_staffMember.length,
      workorder_staffMember: workorder_staffMember.length,
      statusCode: 200,
      message: "Read StaffMember count",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get(
  "/dashboard_workorder/:staffmember_id/:admin_id",
  async (req, res) => {
    try {
      const staffmember_id = req.params.staffmember_id;
      const admin_id = req.params.admin_id;

      const new_workorder = await WorkOrder.find({
        staffmember_id: staffmember_id,
        admin_id: admin_id,
        status: "New",
      })
        .select("work_subject work_category workOrder_id date status")
        .sort({ date: -1 });

      const currentDate = moment().format("YYYY-MM-DD");
      const overdue_workorder = await WorkOrder.find({
        staffmember_id: staffmember_id,
        admin_id: admin_id,
        status: { $ne: "Complete" },
        date: { $lt: currentDate },
      })
        .select("work_subject work_category workOrder_id date status")
        .sort({ date: -1 });

      res.json({
        data: { new_workorder, overdue_workorder },
        statusCode: 200,
        message: "Read Overdue Work-orders",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

// StaffMember Login
router.post("/login", async (req, res) => {
  try {
    const staff_member = await StaffMember.findOne({
      admin_id: req.body.admin_id,
      staffmember_email: req.body.email,
      is_delete: false
    });

    if (!staff_member) {
      return res.status(201).json({
        statusCode: 201,
        message: "staff-Member does not exist",
      });
    }

    const compare = decrypt(staff_member.staffmember_password);

    if (req.body.password !== compare) {
      return res.status(200).json({
        statusCode: 202,
        message: "Invalid Saff-Member password",
      });
    }

    const token = await createStaffMemberToken({
      _id: staff_member._id,
      staffmember_id: staff_member.staffmember_id,
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
      message: "Staff Member Login Success",
      token: token,
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
    console.log(req.body.admin_id);
    const externalApiResponse = await axios.get(
      `https://saas.cloudrentalmanager.com/api/plans/planlimitations/staff/${req.body.admin_id}`
    );
    console.log(externalApiResponse);
    if (externalApiResponse.status === 201) {
      return res.status(200).json(externalApiResponse.data);
    }

    let findStaffMember = await StaffMember.findOne({
      staffmember_email: req.body.staffmember_email,
      admin_id: req.body.admin_id,
      is_delete: false,
    });

    const adminData = await AdminRegister.findOne({
      admin_id: req.body.admin_id,
    });

    if (!findStaffMember) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      req.body["staffmember_id"] = uniqueId;
      req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

      const ApiResponse = await axios.post(
        `https://saas.cloudrentalmanager.com/api/admin/passwordmail`,{
          tenant_email: req.body.staffmember_email
          // name : tenantData.tenant_firstName + tenantData.tenant_lastName
        }
      );
      if (ApiResponse.status === 200) {
        console.log('Password mail sent successfully');
      }

      // const subject = "Staff-Member Login Credentials";
      // const text = `
      //   <p>Hello,</p>
      //   <p>Here are your credentials for staffmember login:</p>
      //   <p>Email: ${req.body.staffmember_email}</p>
      //   <p>Password: ${req.body.staffmember_password}</p>
      //   <p>Login URL: https://saas.cloudrentalmanager.com/auth/${adminData.company_name}/staffmember/login</p>
      // `;

      // await emailService.sendWelcomeEmail(
      //   req.body.staffmember_email,
      //   subject,
      //   text
      // );

      let hashConvert = encrypt(req.body.staffmember_password);
      req.body.staffmember_password = hashConvert;

      var data = await StaffMember.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add StaffMember Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.staffmember_email} E-mail Already in use`,
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

    const planPur = await Plans_Purchased.findOne({
      admin_id,
      is_active: true,
    });

    let plan = null;
    if (planPur) {
    const plan = await Plans.findOne({ plan_id: planPur.plan_id });
    }
    var data = [];
    if (!plan || plan.plan_name === "Free Plan") {
      const data1 = await StaffMember.find({
        admin_id: admin_id,
        is_delete: false,
      });

      const data2 = await StaffMember.find({
        admin_id: "is_trial",
        is_delete: false,
      });

      data.push(...data1, ...data2);
    } else {
      const data1 = await StaffMember.find({
        admin_id: admin_id,
        is_delete: false,
      });

      data.push(...data1);
    }

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      // Fetch property information
      const admin = await AdminRegister.findOne({ admin_id: admin_id });

      // Attach client and property information to the data item
      data[i].admin = admin;
    }
    data.reverse();

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

//delete staff member for admin (data not delete in Database, only change is_delete Boolean)
router.delete("/staff_member/:staffmember_id", async (req, res) => {
  const staffmember_id = req.params.staffmember_id;
  try {
    const existingTenant = await Rentals.findOne({
      staffmember_id: staffmember_id,
      is_delete: false,
    });

    if (existingTenant) {
      return res.status(201).json({
        statusCode: 201,
        message: `Cannot delete Staff Member. The Staff Member is already assigned to a lease.`,
      });
    } else {
      let result = await StaffMember.updateOne(
        { staffmember_id: staffmember_id },
        { $set: { is_delete: true } }
      );

      if (result.modifiedCount === 1) {
        return res.status(404).json({
          statusCode: 404,
          message: "Staff Member not found",
        });
      }

      res.json({
        statusCode: 200,
        data: result,
        message: "Staff Member Deleted Successfully",
      });
    }
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
    var {
      admin_id,
      staffmember_email,
      staffmember_name,
      staffmember_designation,
      staffmember_phoneNumber,
      staffmember_password,
    } = req.body;
    req.body.staffmember_password = encrypt(staffmember_password);

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
    const data = await StaffMember.findOne({ staffmember_id });
    data.staffmember_password = decrypt(data.staffmember_password);

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

// ======================================== For Staff-Member Profile==========================================================================

router.get("/staffmember_profile/:staffmember_id", async (req, res) => {
  const staffmember_id = req.params.staffmember_id;
  console.log(staffmember_id, "staffmember_id");
  try {
    const stamember_data = await StaffMember.findOne({
      staffmember_id: staffmember_id,
    });

    if (staffmember_id.length === 0) {
      return res
        .status(201)
        .json({ message: "No StaffMember found for the given staffmember_id" });
    }

    res.json({
      statusCode: 200,
      data: stamember_data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/staffmember_property/:staffmember_id", async (req, res) => {
  try {
    const staffmember_id = req.params.staffmember_id;
    const data = [];

    const rentalData = await Rentals.find({ staffmember_id });

    for (let i = 0; i < rentalData.length; i++) {
      const property_id = rentalData[i].property_id;

      const property_data = await PropertyType.findOne({ property_id });

      data.push({
        rental_id: rentalData[i].rental_id,
        rental_adress: rentalData[i].rental_adress,
        property_id: property_id,
        propertysub_type: property_data?.propertysub_type,
        rental_city: rentalData[i].rental_city,
        rental_country: rentalData[i].rental_country,
        rental_state: rentalData[i].rental_state,
        createdAt: rentalData[i].createdAt,
        updatedAt: rentalData[i].updatedAt,
      });
    }

    res.json({
      statusCode: 200,
      // data: data,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/staffmember_summary/:rental_id", async (req, res) => {
  try {
    const rental_id = req.params.rental_id;

    var data = await Rentals.aggregate([
      {
        $match: { rental_id: rental_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    //   // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      // const rental_id = data[i].rental_id;
      const rentalowner_id = data[i].rentalowner_id;
      const staffmember_id = data[i].staffmember_id;
      const property_id = data[i].property_id;

      // Fetch property information
      // const lease_data = await Leasing.findOne({ tenant_id: tenant_id });
      // const rental_data = await Rentals.findOne({
      //   rental_id: rental_id,
      // });
      const staffmember_data = await StaffMember.findOne({
        staffmember_id: staffmember_id,
      });
      const rentalowner_data = await RentalOwner.findOne({
        rentalowner_id: rentalowner_id,
      });
      const unit_data = await Unit.findOne({
        rental_id: rental_id,
      });
      const property_type_data = await PropertyType.findOne({
        property_id: property_id,
      });

      // Attach client and property information to the data item
      // data[i].rental_data = rental_data;
      data[i].staffmember_data = staffmember_data;
      data[i].rentalowner_data = rentalowner_data;
      data[i].unit_data = unit_data;
      data[i].property_type_data = property_type_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Property Details",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/staff_count/:admin_id", async (req, res) => {
  try {
    const { admin_id } = req.params;
    const rentals = await StaffMember.find({ admin_id, is_delete: false });
    const count = rentals.length;
    res.status(200).json({
      statusCode: 200,
      count: count,
      message: "Work-Order not found",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/limitation/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    const rentalCount = await StaffMember.count({ admin_id, is_delete: false });
    const planPur = await Plans_Purchased.findOne({ admin_id });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });

    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const propertyCountLimit = plan.staffmember_count;

    if (rentalCount >= propertyCountLimit) {
      return res.status(201).json({
        statusCode: 201,
        rentalCount: rentalCount,
        propertyCountLimit: propertyCountLimit,
        message:
          "Plan limitation is for " + propertyCountLimit + " tenant records",
      });
    }

    res.status(200).json({
      statusCode: 200,
      rentalCount: rentalCount,
      propertyCountLimit: propertyCountLimit,
      message: "Plan limitations checked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
