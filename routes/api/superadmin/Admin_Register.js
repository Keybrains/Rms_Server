var express = require("express");
var router = express.Router();
var { createToken } = require("../../../authentication");
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
var emailService = require("./emailService");
var Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const crypto = require("crypto");
const Plans = require("../../../modals/superadmin/Plans");
const Vendor = require("../../../modals/superadmin/Vendor");
const { default: axios } = require("axios");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");

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

router.post("/register", async (req, res) => {
  try {
    const admin = await AdminRegister.findOne({
      email: req.body.email,
      isAdmin_delete: false,
    });
    if (admin) {
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

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["admin_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const subject = "Admin Login Credentials";
    const text = `
      <p>Hello,</p>
      <p>Here are your credentials for Admin login:</p>
      <p>Email: ${req.body.email}</p>
      <p>Password: ${req.body.password}</p>
      <p>Login URL: https://saas.cloudrentalmanager.com/auth/login</p>
    `;

    await emailService.sendWelcomeEmail(req.body.email, subject, text);

    let hashConvert = encrypt(req.body.password);
    req.body.password = hashConvert;

    const data = await AdminRegister.create(req.body);

    const plan = await Plans.findOne({ plan_name: "Free Plan" });

    const planObject = {
      admin_id: data?.admin_id,
      plan_id: plan?.plan_id,
      status: "",
      purchase_date: moment().format("YYYY-MM-DD"),
      plan_amount: 0,
      expiration_date: moment().add(14, "days").format("YYYY-MM-DD"),
      first_name: data?.first_name,
      last_name: data?.last_name,
      email: data?.email,
      is_active: true,
    };

    const response = await axios.post(
      `https://saas.cloudrentalmanager.com/api/purchase/purchase`,
      planObject
    );

    res.json({
      statusCode: 200,
      data: data,
      message: "Added successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/admin_edit/:admin_id", async (req, res) => {
  try {
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.password = encrypt(req.body.password);
    let result = await AdminRegister.findOneAndUpdate(
      { admin_id: req.params.admin_id },
      { $set: req.body }
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Admin Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
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
      roll: "admin",
    });

    if (!user) {
      return res
        .status(200)
        .json({ statusCode: 201, message: "User doesn't exist" });
    }

    if (user.status === "deactivate") {
      return res.status(200).json({
        statusCode: 204,
        message: "Account is deactivated. Please contact support.",
      });
    }

    const isMatch = decrypt(user.password);
    console.log(isMatch);
    if (req.body.password !== isMatch) {
      return res
        .status(200)
        .json({ statusCode: 202, message: "Invalid Admin Password" });
    }

    // const currentDate = moment().startOf("day");

    // // Check trial status and validity (ignoring time)
    // if (
    //   user.trial.status === "active" &&
    //   currentDate.isBetween(
    //     moment(user.trial.start_date).startOf("day"),
    //     moment(user.trial.end_date).startOf("day"),
    //     null,
    //     "[]"
    //   )
    // ) {
    //   response = {
    //     statusCode: 200,
    //     message: "User Authenticated",
    //     token: await createToken({
    //       _id: user._id,
    //       admin_id: user.admin_id,
    //       first_name: user.first_name,
    //       last_name: user.last_name,
    //       email: user.email,
    //       company_name: user.company_name,
    //       phone_number: user.phone_number,
    //     }),
    //   };
    // } else if (user.trial.status === "inactive") {
    //   if (user.subscription.status === "inactive") {
    //     response = {
    //       statusCode: 203,
    //       message:
    //         "Your plan purchase has expired. Please purchase a new plan.",
    //     };
    //   } else {
    //     // Check subscription start and end dates
    //     const subscriptionStart = moment(user.subscription.start_date).startOf(
    //       "day"
    //     );
    //     const subscriptionEnd = moment(user.subscription.end_date).startOf(
    //       "day"
    //     );

    //     if (
    //       user.subscription.status === "active" &&
    //       currentDate.isBetween(subscriptionStart, subscriptionEnd, null, "[]")
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
    //     } else {
    //       response = {
    //         statusCode: 203,
    //         message:
    //           "Your subscription has expired. Please purchase a new plan.",
    //       };
    //     }
    //   }
    // } else {
    //   response = {
    //     statusCode: 201,
    //     message: "Your free trial has expired. Please purchase a subscription.",
    //   };
    // }

    let response = {
      statusCode: 200,
      message: "User Authenticated",
      token: await createToken({
        admin_id: user.admin_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        company_name: user.company_name,
        phone_number: user.phone_number,
      }),
    };

    return res.json(response);
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

router.get("/admin", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10;
    var pageNumber = parseInt(req.query.pageNumber) || 0;

    // Fetch admins with pagination
    var admins = await AdminRegister.find({
      isAdmin_delete: false,
      roll: "admin",
    });
    var admins = await AdminRegister.find({
      isAdmin_delete: false,
      roll: "admin",
    })
      .sort({ createdAt: -1 })
      .skip(pageSize * pageNumber)
      .limit(pageSize)
      .lean(); // Add lean() for performance if you don't need a full Mongoose document

    // Fetch plan details for each admin
    const plansDetailsPromises = admins.map(async (admin) => {
      // Find the plan purchased by the admin
      const planPurchased = await Plans_Purchased.findOne({
        admin_id: admin.admin_id,
      }).lean();
      if (!planPurchased) {
        return { ...admin, planName: "No Plan Found" };
      }
      // Using the plan_id from the plan purchased to find the plan details
      const planDetails = await Plans.findOne({
        plan_id: planPurchased.plan_id,
      }).lean();
      return {
        ...admin,
        planName: planDetails ? planDetails.plan_name : "Unknown Plan",
      };
    });

    const adminsDetailsWithPlans = await Promise.all(plansDetailsPromises);

    res.json({
      statusCode: 200,
      data: adminsDetailsWithPlans,
      count: adminsDetailsWithPlans.length,
      message: "Read All Admins with Their Plans",
    });
  } catch (error) {
    console.error("Failed to fetch admin plans:", error);
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
    const data = await AdminRegister.find({
      company_name,
      isAdmin_delete: false,
    });

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
    const staffMember = (
      await StaffMember.find({ admin_id: admin_id, is_delete: false })
    ).length;
    const propertyType = (
      await PropertyType.find({ admin_id: admin_id, is_delete: false })
    ).length;
    const rental_owner = (
      await RentalOwner.find({ admin_id: admin_id, is_delete: false })
    ).length;
    const tenant = (await Tenant.find({ admin_id: admin_id, is_delete: false }))
      .length;
    const unit = (await Unit.find({ admin_id: admin_id, is_delete: false }))
      .length;
    const lease = (await Lease.find({ admin_id: admin_id, is_delete: false }))
      .length;
    const rentals_properties = (
      await Rentals.find({ admin_id: admin_id, is_delete: false })
    ).length;
    const vendor = (await Vendor.find({ admin_id: admin_id, is_delete: false }))
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
      vendor: vendor,
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
      { admin_id: admin_id, isAdmin_delete: false },
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

router.post("/superadmin_register", async (req, res) => {
  try {
    const user = await AdminRegister.findOne({
      email: req.body.email,
    });
    if (user) {
      return res
        .status(401)
        .send({ statusCode: 401, message: "Email already in use" });
    }

    const checkCompanyName = await AdminRegister.findOne({
      company_name: req.body.company_name,
    });

    if (checkCompanyName) {
      return res
        .status(402)
        .send({ statusCode: 402, message: "CompanyName already in use" });
    }

    let hashConvert = encrypt(req.body.password);
    req.body.password = hashConvert;

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["superadmin_id"] = uniqueId;
    req.body["roll"] = "super_admin";
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const data = await AdminRegister.create(req.body);

    res.json({
      statusCode: 200,
      data: data,
      message: "Added successfully",
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
    const superAdmin = await AdminRegister.findOne({
      email: req.body.email,
      roll: "super_admin",
    });

    if (!superAdmin) {
      return res.status(201).json({
        statusCode: 201,
        message: "superAdmin does not exist",
      });
    }

    const isMatch = decrypt(superAdmin.password);
    console.log(req.body);
    if (req.body.password !== isMatch) {
      return res.json({
        statusCode: 202,
        message: "Invalid Super-Admin password",
      });
    }

    const token = await createToken({
      superadmin_id: superAdmin.superadmin_id,
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
      token: token,
      data: superAdmin,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/check_company/:admin", async (req, res) => {
  try {
    const admin = req.params.admin;
    const adminData = await AdminRegister.findOne({
      company_name: admin,
      isAdmin_delete: false,
    });
    if (!adminData) {
      return res.status(201).json({
        statusCode: 201,
        message: "Admin Not Found",
      });
    }
    res.json({
      statusCode: 200,
      data: adminData,
      message: "Added successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/superadmin_count", async (req, res) => {
  try {
    const admin = (
      await AdminRegister.find({ roll: "admin", isAdmin_delete: false })
    ).length;
    const plan = (await Plans.find()).length;

    res.json({
      statusCode: 200,
      admin: admin,
      plan: plan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/togglestatus/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    const { status } = req.body;

    if (!["activate", "deactivate"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const admin = await AdminRegister.findOne({ admin_id: adminId });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.status = status === "activate" ? "activate" : "deactivate";
    await admin.save();

    res.json({
      success: true,
      message: `Admin status updated to ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ============================ Reset Password ==================================
const tokenExpirationMap = new Map();

function isTokenValid(email) {
  const token = encrypt(email);
  const expirationTimestamp = tokenExpirationMap.get(token);
  console.log(
    `Token: ${token}, Expiration: ${new Date(
      expirationTimestamp
    )}, Current: ${new Date()}`
  );

  return expirationTimestamp && Date.now() < expirationTimestamp;
}

router.post("/passwordmail", async (req, res) => {
  try {
    const { tenant_email } = req.body;
    console.log("object", tenant_email);
    const encryptedEmail = encrypt(tenant_email);

    console.log("object", encryptedEmail);
    const token = encryptedEmail;

    const expirationTime = 2 * 24 * 60 * 60 * 1000;
    // Store the expiration time along with the token
    const expirationTimestamp = Date.now() + expirationTime;
    tokenExpirationMap.set(token, expirationTimestamp);

    const subject = "Welcome to your new resident center with 302 Properties";

    const text = `
    <p>Hello Sir/Ma'am,</p>

        <p>Reset your password now:</p>
        <p><a href="${
          `http://localhost:3000/auth/changepassword?token=` +
          token
        }" style="text-decoration: none;">Reset Password Link</a></p>
        
        <p>Best regards,<br>
        The 302 Properties Team</p>
    `;

    // Send email with login credentials
    await emailService.sendWelcomeEmail(req.body.tenant_email, subject, text);

    res.json({
      statusCode: 200,
      data: info,
      message: "Send Mail Successfully",
    });

    // Optionally, you can schedule a cleanup task to remove expired tokens from the map
    scheduleTokenCleanup();
  } catch (error) {
    res.json({
      statusCode: false,
      message: error.message,
    });
  }
});

function scheduleTokenCleanup() {
  setInterval(() => {
    const currentTimestamp = Date.now();

    for (const [token, expirationTimestamp] of tokenExpirationMap.entries()) {
      if (currentTimestamp > expirationTimestamp) {
        tokenExpirationMap.delete(token);
        console.log(
          `Token generated for email: ${decrypt(token)}, Expiration: ${new Date(
            expirationTimestamp
          )}`
        );
      }
    }
  }, 15 * 60 * 1000);
}

router.get("/check_token_status/:token", (req, res) => {
  const { token } = req.params;
  const expirationTimestamp = tokenExpirationMap.get(token);

  if (expirationTimestamp && Date.now() < expirationTimestamp) {
    res.json({ expired: false });
  } else {
    res.json({ expired: true });
  }
});

router.put("/reset_password/:mail", async (req, res) => {
  try {
    const encryptmail = req.params.mail;
    const email = decrypt(encryptmail);
    console.log("email",email)

    // Check if the token is still valid
    if (!isTokenValid(email)) {
      return res.json({
        statusCode: 401,
        message: "Token expired. Please request a new password reset email.",
      });
    }

    const newPassword = req.body.password;
    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required.",
      });
    }

    const hashConvert = encrypt(newPassword);
    const updateData = { password: hashConvert };

    let result = null;
    let collection = null;
    let admin = null;

    // Check AdminRegister collection first
    const adminData = await AdminRegister.findOne({ email, isAdmin_delete: false});
    if (adminData) {
      console.log("admin")
      result = await AdminRegister.findOneAndUpdate(
        { email: email, is_delete: false },
        { password: updateData.password },
        { new: true }
      );

      if (result) {
        collection = "admin-register";
      }
    } else {
      // Define an array of collections to check after AdminRegister
      const collections = [Tenant, Vendor, StaffMember];

      // Iterate through the collections
      for (const Collection of collections) {   
        result = await Collection.findOneAndUpdate(
          { [`${Collection.modelName.toLowerCase()}_email`]: email, is_delete: false},
          {
            $set: {
              [`${Collection.modelName.toLowerCase()}_password`]:
                updateData.password,
            },
          },
          { new: true }
        );
      
        if (result) {
          console.log(result, "====");
          collection = Collection.modelName;
          break;
        }
      }
    }
    console.log("result",result)
    if (result) {
      // Password changed successfully, remove the token from the map
      tokenExpirationMap.delete(encrypt(email));

      let url;
      if (collection === "admin-register") {
        url = "/auth/login";
      } else {
        const adminData = await Admin_Register.findOne({
          admin_id: result.admin_id,
          isAdmin_delete: false
        });
        url = `/auth/${adminData.company_name}/${collection}/login`;
      }

      return res.status(200).json({
        data: result,
        url,
        message: `Password Updated Successfully for ${collection}`,
      });
    } else {
      return res.status(404).json({
        message:
          "No matching record found for the provided email in any collection",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
