var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../../authentication");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var moment = require("moment");
const bcrypt = require("bcrypt");
const StaffMember = require("../../../modals/superadmin/StaffMember");
const PropertyType = require("../../../modals/superadmin/PropertyType");
const RentalOwner = require("../../../modals/superadmin/RentalOwner");
const Tenant = require("../../../modals/superadmin/Tenant");
const Unit = require("../../../modals/superadmin/Unit");
const Lease = require("../../../modals/superadmin/Leasing");
const Rentals = require("../../../modals/superadmin/Rentals");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");

//Admin Registers
// router.post("/register", async (req, res) => {
//   try {
//     const user = await AdminRegister.findOne({ email: req.body.email });
//     if (user) {
//       return res
//         .status(401)
//         .send({ statusCode: 401, message: "Email all ready in use" });
//     }
//     let hashConvert = await hashPassword(req.body.password, req.body.cPassword);
//     req.body.password = hashConvert;
//     req.body.cPassword = hashConvert;

//     const timestamp = Date.now();
//     const uniqueId = `${timestamp}`;

//     req.body["admin_id"] = uniqueId;
//     req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
//     req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
//     const data = await AdminRegister.create(req.body);

//     if (data) {
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add successfully",
//       });
//     } else {
//       return res.json({ statusCode: 500, message: "User doesn't exist" });
//     }
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/register", async (req, res) => {
  try {
    const user = await AdminRegister.findOne({
      email: req.body.email,
      isAdmin_delete: false,
    });
    if (user) {
      return res
        .status(401)
        .send({ statusCode: 401, message: "Email already in use" });
    }

    const checkCompanyName = await AdminRegister.findOne({
      company_name: req.body.company_name,
      isAdmin_delete: false,
    });

    if (checkCompanyName) {
      return res
        .status(402)
        .send({ statusCode: 402, message: "CompanyName already in use" });
    }

    let hashConvert = await hashPassword(req.body.password, req.body.cPassword);
    req.body.password = hashConvert;
    req.body.cPassword = hashConvert;

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["admin_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const data = await AdminRegister.create(req.body);

    if (data) {
      const trialData = {
        status: "active",
        start_date: moment().format("YYYY-MM-DD HH:mm:ss"),
        end_date: moment().add(15, "days").format("YYYY-MM-DD HH:mm:ss"),
      };

      const subscription = {
        status: "inactive",
        start_date: "",
        end_date: "",
        plan_purchase_id: null, // Set initial value to null
      };

      // Update the user document with the trial data
      await AdminRegister.findByIdAndUpdate(data._id, {
        $set: { trial: trialData, subscription: subscription },
      });

      res.json({
        statusCode: 200,
        data: data,
        message: "Added successfully",
      });
    } else {
      return res.json({ statusCode: 500, message: "User doesn't exist" });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//Admin Login
// router.post("/login", async (req, res) => {
//   try {
//     const user = await AdminRegister.findOne({
//       email: req.body.email,
//       isAdmin_delete: false,
//     });

//     if (!user) {
//       return res
//         .status(201)
//         .json({ statusCode: 201, message: "User doesn't exist" });
//     }

//     const isMatch = await hashCompare(req.body.password, user.password);

//     if (!isMatch) {
//       return res
//         .status(200)
//         .json({ statusCode: 202, message: "Invalid Admin Password" });
//     }

//     const currentDate = moment().startOf("day");
//     let response;

//     // Check trial status and validity (ignoring time)
//     if (
//       user.trial.status === "active" &&
//       currentDate.isBetween(
//         moment(user.trial.start_date).startOf("day"),
//         moment(user.trial.end_date).startOf("day"),
//         null,
//         "[]"
//       )
//     ) {
//       response = {
//         statusCode: 200,
//         message: "User Authenticated",
//         token: await createToken({
//           _id: user._id,
//           admin_id: user.admin_id,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           email: user.email,
//           company_name: user.company_name,
//           phone_number: user.phone_number,
//         }),
//       };
//     } else if (user.trial.status === "inactive") {
//       if (user.subscription.status === "inactive") {
//         response = {
//           statusCode: 203,
//           message:
//             "Your plan purchase has expired. Please purchase a new plan.",
//         };
//       } else {
//         // Check subscription start and end dates
//         const subscriptionStart = moment(user.subscription.start_date).startOf(
//           "day"
//         );
//         const subscriptionEnd = moment(user.subscription.end_date).startOf(
//           "day"
//         );

//         if (
//           user.subscription.status === "active" &&
//           currentDate.isBetween(subscriptionStart, subscriptionEnd, null, "[]")
//         ) {
//           response = {
//             statusCode: 200,
//             message: "User Authenticated",
//             token: await createToken({
//               _id: user._id,
//               admin_id: user.admin_id,
//               first_name: user.first_name,
//               last_name: user.last_name,
//               email: user.email,
//               company_name: user.company_name,
//               phone_number: user.phone_number,
//             }),
//           };
//         } else {
//           response = {
//             statusCode: 203,
//             message:
//               "Your subscription has expired. Please purchase a new plan.",
//           };
//         }
//       }
//     } else {
//       response = {
//         statusCode: 201,
//         message: "Your free trial has expired. Please purchase a subscription.",
//       };
//     }

//     return res.json(response);
//   } catch (error) {
//     res.json({ statusCode: 500, message: error.message });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const user = await AdminRegister.findOne({
      email: req.body.email,
      isAdmin_delete: false,
    });

    if (!user) {
      return res
        .status(201)
        .json({ statusCode: 201, message: "User doesn't exist" });
    }

    // Compare the encrypted password sent from the scraper with the hashed password stored in the database
    const isMatch = await compareEncryptedPassword(
      req.body.password,
      user.password
    );

    if (!isMatch) {
      return res
        .status(200)
        .json({ statusCode: 202, message: "Invalid Admin Password" });
    }

    const currentDate = moment().startOf("day");
    let response;

    // Check trial status and validity (ignoring time)
    if (
      user.trial.status === "active" &&
      currentDate.isBetween(
        moment(user.trial.start_date).startOf("day"),
        moment(user.trial.end_date).startOf("day"),
        null,
        "[]"
      )
    ) {
      response = {
        statusCode: 200,
        message: "User Authenticated",
        token: await createToken({
          _id: user._id,
          admin_id: user.admin_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          company_name: user.company_name,
          phone_number: user.phone_number,
        }),
      };
    } else if (user.trial.status === "inactive") {
      if (user.subscription.status === "inactive") {
        response = {
          statusCode: 203,
          message:
            "Your plan purchase has expired. Please purchase a new plan.",
        };
      } else {
        // Check subscription start and end dates
        const subscriptionStart = moment(user.subscription.start_date).startOf(
          "day"
        );
        const subscriptionEnd = moment(user.subscription.end_date).startOf(
          "day"
        );

        if (
          user.subscription.status === "active" &&
          currentDate.isBetween(subscriptionStart, subscriptionEnd, null, "[]")
        ) {
          response = {
            statusCode: 200,
            message: "User Authenticated",
            token: await createToken({
              _id: user._id,
              admin_id: user.admin_id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              company_name: user.company_name,
              phone_number: user.phone_number,
            }),
          };
        } else {
          response = {
            statusCode: 203,
            message:
              "Your subscription has expired. Please purchase a new plan.",
          };
        }
      }
    } else {
      response = {
        statusCode: 201,
        message: "Your free trial has expired. Please purchase a subscription.",
      };
    }

    return res.json(response);
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

// Function to compare the encrypted password sent from the scraper with the hashed password stored in the database
async function compareEncryptedPassword(encryptedPassword, hashedPassword) {
  return bcrypt.compare(encryptedPassword, hashedPassword);
}

router.get("/admin", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await AdminRegister.aggregate([
      {
        $match: { isAdmin_delete: false },
      },
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

    var count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Admins",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/appliance/:appliance_id", async (req, res) => {
  try {
    const { appliance_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await Applience.findOneAndUpdate(
      { appliance_id: appliance_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Applience Updated Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Applience not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// For Admin (in params pass company name and get Responce)
router.get("/company/:company_name", async (req, res) => {
  try {
    const company_name = req.params.company_name;
    const data = await AdminRegister.find({ company_name });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified company_name",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Admin",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/admin", async (req, res) => {
  try {
    // Assuming req.body contains an array of admin IDs to update
    const adminIdsToUpdate = req.body;

    // Update the isAdmin_delete field for the specified admin IDs
    const result = await AdminRegister.updateMany(
      { admin_id: { $in: adminIdsToUpdate } },
      { $set: { isAdmin_delete: true } }
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "Admins Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/admin_count/:admin_id", async (req, res) => {
  try {
    const { admin_id } = req.params;
    const staffMember = (await StaffMember.find({ admin_id: admin_id })).length;
    const propertyType = (await PropertyType.find({ admin_id: admin_id }))
      .length;
    const rental_owner = (await RentalOwner.find({ admin_id: admin_id }))
      .length;
    const tenant = (await Tenant.find({ admin_id: admin_id })).length;
    const unit = (await Unit.find({ admin_id: admin_id })).length;
    const lease = (await Lease.find({ admin_id: admin_id })).length;
    const rentals_properties = (await Rentals.find({ admin_id: admin_id }))
      .length;

    res.status(200).json({
      statusCode: 200,
      staff_member: staffMember,
      property_type: propertyType,
      rentals_properties: rentals_properties,
      rental_owner: rental_owner,
      tenant: tenant,
      unit: unit,
      lease: lease,
      message: "Count get successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/admin_profile/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    const data = await AdminRegister.findOne(
      { admin_id: admin_id },
      "-password"
    );

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified admin_id",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read Admin Profile",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/superadmin_login", async (req, res) => {
  try {
    const superAdmin = await Admin_Register.findOne({
      email: req.body.email,
      role: req.body.role,
    });

    if (!superAdmin) {
      return res.status(201).json({
        statusCode: 201,
        message: "superAdmin does not exist",
      });
    }

    const isMatch = await compareEncryptedPassword(
      req.body.password,
      superAdmin.password
    );

    if (!isMatch) {
      return res.json({
        statusCode: 202,
        message: "Invalid Super-Admin password",
      });
    }

    const token = await createToken({
      _id: superAdmin._id,
      superAdmin_id: superAdmin.superAdmin_id,
      first_name: superAdmin.first_name,
      last_name: superAdmin.last_name,
      email: superAdmin.email,
      phone_number: superAdmin.phone_number,
      company_name: superAdmin.company_name,
      createdAt: superAdmin.createdAt,
      updatedAt: superAdmin.updatedAt,
    });

    res.json({
      statusCode: 200,
      vendorToken: token,
      data: superAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
