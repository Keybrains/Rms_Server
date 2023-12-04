var express = require("express");
var router = express.Router();
var Tenants = require("../../modals/Tenants");
var Rentals = require("../../modals/Rentals");
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../authentication");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var moment = require("moment");
// const nodemailer = require("nodemailer");

//add tenant working  API
// router.post("/tenant", async (req, res) => {
//   try {
//     var count = await Tenants.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["tenant_id"] = pad(count + 1);

//     const {
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//     } = req.body;

//     const currentDate = new Date();
//     const endDate = new Date(req.body.end_date);

//     if (endDate <= currentDate) {
//       req.body["propertyOnRent"] = true;
//     } else {
//       req.body["propertyOnRent"] = false;
//     }

//     entries.forEach((entry, index) => {
//       entry.entryIndex = (index + 1).toString().padStart(2, "0");
//     });

//     const data = await Tenants.create({
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//     });

//     data.entries = entries;

//     const tenantRentalAddress = req.body.rental_adress;

//     console.log("Attempting to find matching rental for address:", tenantRentalAddress);

//     const matchingRental = await Rentals.findOne({
//       "entries.rental_adress": tenantRentalAddress,
//     });

//     console.log("Matching Rental:", matchingRental);

//     if (matchingRental) {
//       const matchingEntry = matchingRental.entries.find(
//         (entry) => entry.rental_adress === tenantRentalAddress
//       );

//       console.log("Matching Entry:", matchingEntry);

//       if (matchingEntry) {
//         console.log("Setting isrenton to true");
//         matchingEntry.isrenton = true;
//         await matchingRental.save();
//       }
//     }

//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Tenants Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// })

// router.post("/tenant", async (req, res) => {
//   try {
//     var count = await Tenants.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }

//     req.body["tenant_id"] = pad(count + 1);

//     const {
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//     } = req.body;

//     const currentDate = new Date();
//     const endDate = new Date(req.body.end_date);

//     if (endDate <= currentDate) {
//       req.body["propertyOnRent"] = true;
//     } else {
//       req.body["propertyOnRent"] = false;
//     }

//     entries.forEach((entry, index) => {
//       entry.entryIndex = (index + 1).toString().padStart(2, "0");
//     });

//     const data = await Tenants.create({
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//     });

//     data.entries = entries;

//     const tenantRentalAddress = entries[0].rental_adress;

//     console.log(
//       "Attempting to find matching rental for address:",
//       tenantRentalAddress
//     );

//     const matchingRental = await Rentals.findOne({
//       "entries.rental_adress": tenantRentalAddress,
//     });

//     console.log("Matching Rental:", matchingRental);

//     if (matchingRental) {
//       const matchingEntry = matchingRental.entries.find(
//         (entry) => entry.rental_adress === tenantRentalAddress
//       );

//       console.log("Matching Entry:", matchingEntry);

//       if (
//         matchingEntry &&
//         matchingEntry.rental_adress.trim() === tenantRentalAddress.trim()
//       ) {
//         console.log("Setting isrenton to true");
//         matchingEntry.isrenton = true;
//         await matchingRental.save();
//       } else {
//         console.log("Conditions not met for setting isrenton to true.");
//       }
//     }

//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Tenants Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// });

const nodemailer = require("nodemailer");
const { createTransport } = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.socketlabs.com",
  port: 587,
  secure: false,
  auth: {
    user: "server39897",
    pass: "c9J3Wwm5N4Bj",
  },
});

// router.post("/tenant", async (req, res) => {
//   try {
//     var count = await Tenants.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["tenant_id"] = pad(count + 1);

//     const {
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//     } = req.body;

//     const currentDate = new Date();
//     const endDate = new Date(req.body.end_date);

//     if (endDate <= currentDate) {
//       req.body["propertyOnRent"] = true;
//     } else {
//       req.body["propertyOnRent"] = false;
//     }

//     entries.forEach((entry, index) => {
//       entry.entryIndex = (index + 1).toString().padStart(2, "0");
//     });

//     const data = await Tenants.create({
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//     });

//     data.entries = entries;

//     const tenantRentalAddress = entries[0].rental_adress;

//     console.log(
//       "Attempting to find matching rental for address:",
//       tenantRentalAddress
//     );

//     const matchingRental = await Rentals.findOne({
//       "entries.rental_adress": tenantRentalAddress,
//     });

//     console.log("Matching Rental:", matchingRental);

//     if (matchingRental) {
//       const matchingEntry = matchingRental.entries.find(
//         (entry) => entry.rental_adress === tenantRentalAddress
//       );

//       console.log("Matching Entry:", matchingEntry);

//       if (
//         matchingEntry &&
//         matchingEntry.rental_adress.trim() === tenantRentalAddress.trim()
//       ) {
//         console.log("Setting isrenton to true");
//         matchingEntry.isrenton = true;
//         await matchingRental.save();
//       } else {
//         console.log("Conditions not met for setting isrenton to true.");
//       }
//     }

//     const info = await transporter.sendMail({
//       from: '"302 Properties" <mailto:info@cloudpress.host>',
//       to: tenant_email,
//       subject: "Welcome Mail",
//       text: 'Hello, Welcome to 302 Properties.',
//     });

//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Tenants Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// })

// router.post("/tenant", async (req, res) => {
//   try {
//     var count = await Tenants.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }

//     req.body["tenant_id"] = pad(count + 1);

//     const {
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//       recurringChargeSchema,
//       oneTimeChargeSchema,
//     } = req.body;

//     const currentDate = new Date();
//     const endDate = new Date(req.body.end_date);

//     if (endDate <= currentDate) {
//       req.body["propertyOnRent"] = true;
//     } else {
//       req.body["propertyOnRent"] = false;
//     }

//     entries.forEach((entry, index) => {
//       entry.entryIndex = (index + 1).toString().padStart(2, "0");
//     });

//     const data = await Tenants.create({
//       tenant_id,
//       tenant_firstName,
//       tenant_lastName,
//       tenant_unitNumber,
//       tenant_mobileNumber,
//       tenant_workNumber,
//       tenant_homeNumber,
//       tenant_faxPhoneNumber,
//       tenant_email,
//       tenant_password,
//       alternate_email,
//       tenant_residentStatus,
//       birth_date,
//       textpayer_id,
//       comments,
//       contact_name,
//       relationship_tenants,
//       email,
//       emergency_PhoneNumber,
//       entries,
//       recurringChargeSchema,
//       oneTimeChargeSchema,
//     });

//     data.entries = entries;

//     const tenantRentalAddress = entries[0].rental_adress;

//     console.log(
//       "Attempting to find matching rental for address:",
//       tenantRentalAddress
//     );

//     const matchingRental = await Rentals.findOne({
//       "entries.rental_adress": tenantRentalAddress,
//     });

//     console.log("Matching Rental:", matchingRental);

//     if (matchingRental) {
//       const matchingEntry = matchingRental.entries.find(
//         (entry) => entry.rental_adress === tenantRentalAddress
//       );

//       console.log("Matching Entry:", matchingEntry);

//       if (
//         matchingEntry &&
//         matchingEntry.rental_adress.trim() === tenantRentalAddress.trim()
//       ) {
//         console.log("Setting isrenton to true");
//         matchingEntry.isrenton = true;
//         await matchingRental.save();
//       } else {
//         console.log("Conditions not met for setting isrenton to true.");
//       }
//     }

//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Tenants Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// });
router.post("/tenant", async (req, res) => {
  try {
    var count = await Tenants.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["tenant_id"] = pad(count + 1);
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const {
      tenant_id,
      tenant_firstName,
      tenant_lastName,
      tenant_unitNumber,
      tenant_mobileNumber,
      tenant_workNumber,
      tenant_homeNumber,
      tenant_faxPhoneNumber,
      tenant_email,
      tenant_password,
      alternate_email,
      tenant_residentStatus,
      birth_date,
      textpayer_id,
      comments,
      contact_name,
      relationship_tenants,
      email,
      emergency_PhoneNumber,
      entries,
    } = req.body;

    const currentDate = new Date();
    const endDate = new Date(req.body.end_date);

    if (endDate <= currentDate) {
      req.body["propertyOnRent"] = true;
    } else {
      req.body["propertyOnRent"] = false;
    }

    entries.forEach((entry, index) => {
      entry.entryIndex = (index + 1).toString().padStart(2, "0");
    });

    const data = await Tenants.create({
      tenant_id,
      tenant_firstName,
      tenant_lastName,
      tenant_unitNumber,
      tenant_mobileNumber,
      tenant_workNumber,
      tenant_homeNumber,
      tenant_faxPhoneNumber,
      tenant_email,
      tenant_password,
      alternate_email,
      // tenant_residentStatus,
      birth_date,
      textpayer_id,
      comments,
      contact_name,
      relationship_tenants,
      email,
      emergency_PhoneNumber,
      entries,
    });

    data.entries = entries;

    const tenantRentalAddress = entries[0].rental_adress;

    console.log(
      "Attempting to find matching rental for address:",
      tenantRentalAddress
    );

    const matchingRental = await Rentals.findOne({
      "entries.rental_adress": tenantRentalAddress,
    });

    console.log("Matching Rental:", matchingRental);

    if (matchingRental) {
      const matchingEntry = matchingRental.entries.find(
        (entry) => entry.rental_adress === tenantRentalAddress
      );

      console.log("Matching Entry:", matchingEntry);

      if (
        matchingEntry &&
        matchingEntry.rental_adress.trim() === tenantRentalAddress.trim()
      ) {
        console.log("Setting isrenton to true");
        matchingEntry.isrenton = true;
        await matchingRental.save();
      } else {
        console.log("Conditions not met for setting isrenton to true.");
      }
    }
    console.log(tenant_residentStatus);
    console.log(entries[0].tenant_residentStatus, "entries");
    if (entries[0].tenant_residentStatus) {
      const info = await transporter.sendMail({
        from: '"donotreply" <mailto:info@cloudpress.host>',
        to: `${tenant.tenant_email}`,
        subject: "Welcome to your new resident center with 302 Properties",
        text: `
    Hello ${tenant_firstName},
        
    Thank you for registering with 302 Properties. Your account has been created.
        
    You're invited to join our Resident Center! After signing in, you can enjoy many benefits including the ability to:
        
    - Pay rent online and set up autopay
    - Submit maintenance requests and general inquiries
    - Record information about your renters insurance policy
    - Check out the resident center video library to see everything the site has to offer.
    
    Activate your account now:
    ${"https://propertymanager.cloudpress.host/auth/login"}
    
    Username: ${tenant_email}
    password: ${tenant_password}
    
    Want to easily find the sign-in page in the future? Bookmark the page in your preferred browser!
    
    Best regards,
    The 302 Properties Team
    `,
      });
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Add Tenants Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: false,
      message: error.message,
    });
  }
});

//get tenant
router.get("/tenant", async (req, res) => {
  try {
    var data = await Tenants.find();
    data.reverse();
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Tenants",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/existing/tenant", async (req, res) => {
  try {
    // Group records by tenant_mobileNumber and select one record for each group
    const uniqueRecords = await Tenants.aggregate([
      {
        $group: {
          _id: "$tenant_mobileNumber",
          record: { $first: "$$ROOT" }, // Select the first record in each group
        },
      },
      {
        $replaceRoot: { newRoot: "$record" }, // Replace the root with the selected record
      },
    ]);

    res.json({
      data: uniqueRecords,
      statusCode: 200,
      message: "Read All Tenants",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//new api to get
router.get("/tenants", async (req, res) => {
  try {
    // Find tenants with at least one entry
    const tenantsWithData = await Tenants.find({
      entries: { $not: { $size: 0 } },
    });

    // Extract data for each tenant along with their entries
    const data = tenantsWithData
      .map((tenant) => {
        return tenant.entries.map((entry) => {
          return {
            _id: tenant._id,
            tenant_firstName: tenant.tenant_firstName,
            tenant_lastName: tenant.tenant_lastName,
            tenant_unitNumber: tenant.tenant_unitNumber,
            tenant_mobileNumber: tenant.tenant_mobileNumber,
            tenant_workNumber: tenant.tenant_workNumber,
            tenant_homeNumber: tenant.tenant_homeNumber,
            tenant_faxPhoneNumber: tenant.tenant_faxPhoneNumber,
            tenant_email: tenant.tenant_email,
            tenant_password: tenant.tenant_password,
            alternate_email: tenant.alternate_email,
            tenant_residentStatus: tenant.tenant_residentStatus,
            birth_date: tenant.birth_date,
            textpayer_id: tenant.textpayer_id,
            comments: tenant.comments,
            contact_name: tenant.contact_name,
            relationship_tenants: tenant.relationship_tenants,
            email: tenant.email,
            emergency_PhoneNumber: tenant.emergency_PhoneNumber,

            entries: {
              entryIndex: entry.entryIndex,
              rental_units: entry.rental_units,
              rental_adress: entry.rental_adress,
              lease_type: entry.lease_type,
              start_date: entry.start_date,
              end_date: entry.end_date,
              leasing_agent: entry.leasing_agent,
              rent_cycle: entry.rent_cycle,
              amount: entry.amount,
              account: entry.account,
              nextDue_date: entry.nextDue_date,
              memo: entry.memo,
              upload_file: entry.upload_file,
              isrenton: entry.isrenton,
              rent_paid: entry.rent_paid,
              propertyOnRent: entry.propertyOnRent,
              Due_date: entry.Due_date,
              Security_amount: entry.Security_amount,
              createdAt: entry.createdAt,
              updateAt: entry.updateAt,
              // recuring_amount: entry.recuring_amount,
              // recuring_account: entry.recuring_account,
              // recuringnextDue_date: entry.recuringnextDue_date,
              // recuringmemo: entry.recuringmemo,
              // recuringfrequency: entry.recuringfrequency,
              // onetime_account: entry.onetime_account,
              // onetime_amount: entry.onetime_amount,
              // onetime_Due_date: entry.onetime_Due_date,
              // onetime_memo: entry.onetime_memo,

              // add cosigner
              cosigner_firstName: entry.cosigner_firstName,
              cosigner_lastName: entry.cosigner_lastName,
              cosigner_mobileNumber: entry.cosigner_mobileNumber,
              cosigner_workNumber: entry.cosigner_workNumber,
              cosigner_homeNumber: entry.cosigner_homeNumber,
              cosigner_faxPhoneNumber: entry.cosigner_faxPhoneNumber,
              cosigner_email: entry.cosigner_email,
              cosigner_alternateemail: entry.cosigner_alternateemail,
              cosigner_streetAdress: entry.cosigner_streetAdress,
              cosigner_city: entry.cosigner_city,
              cosigner_state: entry.cosigner_state,
              cosigner_zip: entry.cosigner_zip,
              cosigner_country: entry.cosigner_country,
              cosigner_postalcode: entry.cosigner_postalcode,

              // add account
              account_name: entry.account_name,
              account_type: entry.account_type,

              //account level (sub account)
              parent_account: entry.parent_account,
              account_number: entry.account_number,
              fund_type: entry.fund_type,
              cash_flow: entry.cash_flow,
              notes: entry.notes,
              entry_id: entry._id,
              recurring_charges: entry.recurring_charges.map(
                (recuringCharge) => ({
                  recuring_amount: recuringCharge.recuring_amount,
                  recuring_account: recuringCharge.recuring_account,
                  recuringnextDue_date: recuringCharge.recuringnextDue_date,
                  recuringmemo: recuringCharge.recuringmemo,
                  recuringfrequency: recuringCharge.recuringfrequency,
                })
              ),
              one_time_charges: entry.one_time_charges.map((oneTimeCharge) => ({
                onetime_account: oneTimeCharge.onetime_account,
                onetime_amount: oneTimeCharge.onetime_amount,
                onetime_Due_date: oneTimeCharge.onetime_Due_date,
                onetime_memo: oneTimeCharge.onetime_memo,
              })),
            },
          };
        });
      })
      .flat(); // Flatten the nested arrays

    res.json({
      data: data,
      statusCode: 200,
      message: "Read Non-Empty Tenants",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/tenant", async (req, res) => {
  try {
    let result = await Tenants.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Tenants Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//edit tenant
// PUT request to update tenant data old
// router.put("/tenant/:id", async (req, res) => {
//   try {
//     // Update the tenant data
//     let result = await Tenants.findByIdAndUpdate(req.params.id, req.body);

//     // Check if end_date matches the current date and update propertyOnRent
//     const currentDate = new Date();
//     const endDate = new Date(req.body.end_date);

//     if (endDate <= currentDate) {
//       await Tenants.findByIdAndUpdate(req.params.id, {
//         propertyOnRent: true,
//       });
//     } else {
//       await Tenants.findByIdAndUpdate(req.params.id, {
//         propertyOnRent: false,
//       });
//     }

//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "Tenant Data Updated Successfully",
//     });
//   } catch (err) {
//     res.json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

// put api new change new entry add existing tenant add new index id and add recored
// router.put("/tenant/:id", async (req, res) => {
//   try {
//     const tenantId = req.params.id;
//     const updateData = req.body;
//     const tenant = await Tenants.findById(tenantId);

//     if (!tenant) {
//       return res
//         .status(404)
//         .json({ statusCode: 404, message: "Tenant not found" });
//     }

//     const currentDate = new Date();
//     const endDate = new Date(updateData.end_date);

//     if (endDate <= currentDate) {
//       updateData.propertyOnRent = true;
//     } else {
//       updateData.propertyOnRent = false;
//     }

//     if (updateData.entries && Array.isArray(updateData.entries)) {
//       // Find the last entry in the existing entries
//       const lastEntry =
//         tenant.entries.length > 0
//           ? tenant.entries[tenant.entries.length - 1]
//           : null;
//       let nextEntryIndex = lastEntry
//         ? (parseInt(lastEntry.entryIndex) + 1).toString().padStart(2, "0")
//         : "01";

//       // Loop through the entries and set entryIndex
//       updateData.entries.forEach((entry) => {
//         entry.entryIndex = nextEntryIndex;
//         nextEntryIndex = (parseInt(nextEntryIndex) + 1)
//           .toString()
//           .padStart(2, "0");
//       });

//       tenant.entries.push(...updateData.entries);
//     }

//     // Update the main tenant data and entries array
//     const result = await tenant.save();

//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "Tenant Data Updated Successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });
router.put("/tenant/:id", async (req, res) => {
  try {
    const tenantId = req.params.id;
    const updateData = req.body;
    const tenant = await Tenants.findById(tenantId);
    console.log(updateData, "updateData");
    console.log(tenant, "tenant=======================");
    if (!tenant) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Tenant not found" });
    }

    const currentDate = new Date();
    const endDate = new Date(updateData.end_date);

    if (endDate <= currentDate) {
      updateData.propertyOnRent = true;
    } else {
      updateData.propertyOnRent = false;
    }

    if (updateData.entries && Array.isArray(updateData.entries)) {
      // Find the last entry in the existing entries
      const lastEntry =
        tenant.entries.length > 0
          ? tenant.entries[tenant.entries.length - 1]
          : null;
      let nextEntryIndex = lastEntry
        ? (parseInt(lastEntry.entryIndex) + 1).toString().padStart(2, "0")
        : "01";

      // Loop through the entries and set entryIndex
      updateData.entries.forEach((entry) => {
        entry.entryIndex = nextEntryIndex;
        nextEntryIndex = (parseInt(nextEntryIndex) + 1)
          .toString()
          .padStart(2, "0");
        entry.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      });

      if (updateData.entries[0].tenant_residentStatus) {
        const info = await transporter.sendMail({
          from: '"donotreply" <mailto:info@cloudpress.host>',
          to: `${tenant.tenant_email}`,
          subject: "Welcome to your new resident center with 302 Properties",
          text: `
      Hello ${tenant.tenant_firstName},
          
      Thank you for registering with 302 Properties. Your account has been created.
      
      You're invited to join our Resident Center! After signing in, you can enjoy many benefits including the ability to:
      
      - Pay rent online and set up autopay
      - Submit maintenance requests and general inquiries
      - Record information about your renters insurance policy
      - Check out the resident center video library to see everything the site has to offer.
      
      Activate your account now:
      ${"https://propertymanager.cloudpress.host/auth/login"}
      
      Username: ${tenant.tenant_email}
      password: ${tenant.tenant_password}
      
      Want to easily find the sign-in page in the future? Bookmark the page in your preferred browser!
      
      Best regards,
      The 302 Properties Team
      `,
        });

        tenant.entries.push(...updateData.entries);
      }
    }
    // Update the main tenant data and entries array
    const result = await tenant.save();

    res.json({
      statusCode: 200,
      data: result,
      message: "Tenant Data Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});
//get  rentroll table data
router.get("/rentroll", async (req, res) => {
  try {
    var data = await Tenants.find();
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All rentroll",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get tenant table  summary data id wise

router.get("/tenant_summary/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL parameter
    var data = await Tenants.findById(userId);
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: " tenant summaryGet Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "tenant summary not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/tenant_summary/tenant/:tenant_email", async (req, res) => {
  try {
    const email = req.params.tenant_email;

    // Use await to fetch data and handle the result as an array
    const data = await Tenants.find({ tenant_email: email });
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: " tenant summaryGet Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "tenant summary not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Define a route to get a tenant's rental addresses by email
router.get("/tenant_rental_addresses/:tenantId", async (req, res) => {
  try {
    const userId = req.params.tenantId; // Get the user ID from the URL parameter
    var data = await Tenants.findById(userId);

    if (data && data.entries.length > 0) {
      // Extract rental addresses from the data.entries array
      const rental_adress = data.entries.map((entry) => entry.rental_adress);

      res.json({
        rental_adress: rental_adress, // Use "rental_adress" here
        statusCode: 200,
        message: "Rental addresses retrieved successfully for the tenant",
      });
    } else {
      // If data.entries is an empty array, it means no results were found for the tenant ID
      res.status(404).json({
        statusCode: 404,
        message: "Tenant not found or has no rental addresses",
      });
    }
  } catch (error) {
    // Handle errors properly
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});

//fillter api lease type wise
router.post("/filterlease_type", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.lease_type) {
      // Corrected from req.body.rentals
      pipeline.push({
        $match: { lease_type: req.body.lease_type },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await Tenants.aggregate(pipeline);
    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };
    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//search tenant table data like firstname , lastname

router.post("/search_tenant", async (req, res) => {
  try {
    let newArray = [];
    newArray.push(
      {
        tenant_firstName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        tenant_lastName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      }
    );
    var data = await Tenants.find({
      $or: newArray,
    });

    // Calculate the count of the searched data
    const dataCount = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: dataCount, // Include the count in the response
      message: "Read All Tenants",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//search RentRoll  table data like lease (rentale_address) , leasetype (type)
router.post("/search-rentroll", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      newArray.push({
        amount: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      });
    } else {
      newArray.push(
        {
          property_type: { $regex: req.body.search, $options: "i" },
        },
        {
          lease_type: { $regex: req.body.search, $options: "i" },
        }
      );
    }

    var data = await Tenants.find({
      $or: newArray,
    });
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Rentroll",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Login tenant
router.post("/login", async (req, res) => {
  try {
    const user = await Tenants.findOne({ tenant_email: req.body.tenant_email });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await Tenants.findOne({
      tenant_password: req.body.tenant_password,
    });
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }

    const tokens = await createToken({
      _id: user._id,
      // userName: user.userName,
      tenant_email: user.tenant_email,
      // mobileNumber: user.mobileNumber,
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
    res.json({ statusCode: 500, message: error });
  }
});

//get tenant table in  rental_adress $ id   wise  data

router.get("/tenant_summary/:rental_adress/:id", async (req, res) => {
  try {
    const rentalAdress = req.params.rental_adress;
    const userId = req.params.id;

    var data = await Tenants.findOne({
      rental_adress: rentalAdress,
      _id: userId,
    });

    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: "property summary retrieved successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "property summary not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//find account_name(accountname in lease form in account dropdoun)
router.get("/account_name", async (req, res) => {
  try {
    var data = await Tenants.find().select("account_name");
    res.json({
      statusCode: 200,
      data: data,
      message: "read all account detail",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//find rental_address(proparty in lease form)
router.get("/property", async (req, res) => {
  try {
    var data = await Tenants.find().select("rental_adress");
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

// rental address wise get all data
router.get("/renton_property/:rental_adress", async (req, res) => {
  try {
    const rentalAdress = req.params.rental_adress;
    console.log("Rental Address:", rentalAdress);
    const data = await Tenants.find({ "entries.rental_adress": rentalAdress });
    console.log("Rental data:", data);
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: "Property summary retrieved successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Property summary not found for the specified rental address.",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//entry wise delete

router.delete("/tenant/:tenantId/entry/:entryIndex", async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const entryIndex = req.params.entryIndex; // Do not parse to int

    const tenants = await Tenants.find();
    const tenant = tenants.find((t) => t._id.toString() === tenantId);

    if (!tenant || !tenant.entries) {
      res.status(404).json({
        statusCode: 404,
        message: "Tenant not found or has no entries",
      });
      return;
    }

    const entryIndexToDelete = tenant.entries.findIndex(
      (e) => e.entryIndex === entryIndex
    );

    if (entryIndexToDelete === -1) {
      res.status(404).json({
        statusCode: 404,
        message: "Entry not found",
      });
      return;
    }

    // Remove the entry from the entries array
    tenant.entries.splice(entryIndexToDelete, 1);

    // Save the updated tenant data
    await tenant.save();

    res.status(200).json({
      statusCode: 200,
      message: "Entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//update recored specific put api
router.put("/tenants/:tenantId/entry/:entryIndex", async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const entryIndex = req.params.entryIndex;
    const updatedTenantData = req.body.entries[0];
    const updatedData = {
      tenant_firstName: req.body.tenant_firstName,
      tenant_lastName: req.body.tenant_lastName,
      tenant_unitNumber: req.body.tenant_unitNumber,
      tenant_mobileNumber: req.body.tenant_mobileNumber,
      tenant_workNumber: req.body.tenant_workNumber,
      tenant_homeNumber: req.body.tenant_homeNumber,
      tenant_faxPhoneNumber: req.body.tenant_faxPhoneNumber,
      tenant_email: req.body.tenant_email,
      tenant_password: req.body.tenant_password,
      alternate_email: req.body.alternate_email,
      tenant_residentStatus: req.body.tenant_residentStatus,
      birth_date: req.body.birth_date,
      textpayer_id: req.body.textpayer_id,
      comments: req.body.comments,
      contact_name: req.body.contact_name,
      relationship_tenants: req.body.relationship_tenants,
      email: req.body.email,
      emergency_PhoneNumber: req.body.emergency_PhoneNumber,
    };

    // Find the tenant by ID
    const tenant = await Tenants.findById(tenantId);

    if (!tenant) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Tenant not found" });
    }

    const entryToUpdate = tenant.entries.find(
      (entry) => entry.entryIndex === entryIndex
    );

    if (!entryToUpdate) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Entry not found" });
    }
    updatedTenantData["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    tenant.set(updatedData);
    Object.assign(entryToUpdate, updatedTenantData);

    const result = await tenant.save();

    res.json({
      statusCode: 200,
      data: result,
      message: "Tenant Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/tenant_summary/:tenantId/entry/:entryIndex", async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const entryIndex = req.params.entryIndex; // Do not parse to int

    const tenants = await Tenants.find();
    const tenant = tenants.find((t) => t._id.toString() === tenantId);

    if (!tenant || !tenant.entries) {
      res.status(404).json({
        statusCode: 404,
        message: "Tenant not found or has no entries",
      });
      return;
    }
    const entry = tenant.entries.find((e) => e.entryIndex === entryIndex);

    if (!entry) {
      res.status(404).json({
        statusCode: 404,
        message: "Entry not found",
      });
      return;
    }

    // Include common fields of the tenant in the response
    const tenantDataWithEntry = {
      _id: tenant._id,
      tenant_id: tenant.tenant_id,
      tenant_firstName: tenant.tenant_firstName,
      tenant_lastName: tenant.tenant_lastName,
      tenant_unitNumber: tenant.tenant_unitNumber,
      tenant_mobileNumber: tenant.tenant_mobileNumber,
      tenant_workNumber: tenant.tenant_workNumber,
      tenant_homeNumber: tenant.tenant_homeNumber,
      tenant_faxPhoneNumber: tenant.tenant_faxPhoneNumber,
      tenant_email: tenant.tenant_email,
      tenant_password: tenant.tenant_password,
      alternate_email: tenant.alternate_email,
      tenant_residentStatus: tenant.tenant_residentStatus,
      birth_date: tenant.birth_date,
      textpayer_id: tenant.textpayer_id,
      comments: tenant.comments,
      contact_name: tenant.contact_name,
      relationship_tenants: tenant.relationship_tenants,
      email: tenant.email,
      emergency_PhoneNumber: tenant.emergency_PhoneNumber,
      entries: entry,
    };

    res.json({
      data: tenantDataWithEntry,
      statusCode: 200,
      message: "Read Tenant Entry",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/tenant/:tenantId/entries", async (req, res) => {
  try {
    const tenantId = req.params.tenantId;

    const tenants = await Tenants.find();
    const tenant = tenants.find((t) => t._id.toString() === tenantId);

    if (!tenant || !tenant.entries) {
      res.status(404).json({
        statusCode: 404,
        message: "Tenant not found or has no entries",
      });
      return;
    }

    // Map all entries for the tenant
    const entries = tenant.entries.map((entry) => {
      return {
        _id: tenant._id,
        tenant_id: tenant.tenant_id,
        tenant_firstName: tenant.tenant_firstName,
        tenant_lastName: tenant.tenant_lastName,
        tenant_mobileNumber: tenant.tenant_mobileNumber,
        tenant_email: tenant.tenant_email,
        tenant_password: tenant.tenant_password,
        entries: entry,
      };
    });

    res.json({
      data: entries,
      statusCode: 200,
      message: "Read Tenant Entries",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get data specifice rental address wise & entry endex wise
//get data specifice rental address wise & entry endex wise
// router.get("/tenant-detail/tenants/:rental_adress", async (req, res) => {
//   try {
//     const rental_adress = req.params.rental_adress;
//     console.log("Rental Address:", rental_adress);

//     const data = await Tenants.find({
//       "entries.rental_adress": rental_adress,
//     });

//     if (!data || data.length === 0) {
//       res.status(404).json({
//         statusCode: 404,
//         message: "No tenants found for the specified rental address",
//       });
//       return;
//     }

//     const tenantDataWithEntries = data.map((tenant) => ({
//       _id: tenant._id,
//       tenant_id: tenant.tenant_id,
//       tenant_firstName: tenant.tenant_firstName,
//       tenant_lastName: tenant.tenant_lastName,
//       tenant_mobileNumber: tenant.tenant_mobileNumber,
//       tenant_email: tenant.tenant_email,
//       tenant_password: tenant.tenant_password,
//       entries: tenant.entries.filter(
//         (entry) => entry.rental_adress === rental_adress
//       ),
//     }));

//     res.json({
//       data: tenantDataWithEntries,
//       statusCode: 200,
//       message: "Read Tenant Entries",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Internal server error",
//     });
//   }
// });

router.get(
  "/tenant-detail/tenants/:rental_adress/:rental_units?",
  async (req, res) => {
    try {
      const { rental_adress, rental_units } = req.params;

      let data;

      if (rental_units) {
        // If rental_units is provided, search based on both rental_adress and rental_units
        data = await Tenants.find({
          "entries.rental_adress": rental_adress,
          "entries.rental_units": rental_units,
        });
      } else {
        // If rental_units is not provided, search based only on rental_adress
        data = await Tenants.find({
          "entries.rental_adress": rental_adress,
        });
      }

      if (!data || data.length === 0) {
        res.status(404).json({
          statusCode: 404,
          message: "No tenants found for the specified parameters",
        });
        return;
      }

      const tenantDataWithEntries = data.map((tenant) => ({
        _id: tenant._id,
        tenant_id: tenant.tenant_id,
        tenant_firstName: tenant.tenant_firstName,
        tenant_lastName: tenant.tenant_lastName,
        tenant_mobileNumber: tenant.tenant_mobileNumber,
        tenant_email: tenant.tenant_email,
        tenant_password: tenant.tenant_password,
        entries: tenant.entries.filter(
          (entry) =>
            (!rental_units || entry.rental_units === rental_units) &&
            entry.rental_adress === rental_adress
        ),
      }));

      res.json({
        data: tenantDataWithEntries,
        statusCode: 200,
        message: "Read Tenant Entries",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: "Internal server error",
      });
    }
  }
);

// //get tenant name only rental address wise get data // working
// router.get("/tenant-name/tenant/:rental_address", async (req, res) => {
//   try {
//     const rental_address = req.params.rental_address;
//     console.log("Rental Address:", rental_address);

//     const data = await Tenants.findOne({
//       "entries.rental_adress": rental_address
//     });

//     if (!data) {
//       res.status(404).json({
//         statusCode: 404,
//         message: "Entry not found",
//       });
//       return;
//     }

//     const tenantData = {
//       tenant_firstName: data.tenant_firstName,
//       tenant_lastName: data.tenant_lastName,
//     };
//     console.log("tenantData",tenantData)

//     res.json({
//       data: tenantData,
//       statusCode: 200,
//       message: "Tenant Name Details",
//     });
//   } catch (error) {
//     // Handle errors properly
//     console.error(error);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Internal server error",
//     });
//   }
// });

// working this diffrent forment
// router.get("/tenant-name/tenant/:rental_address", async (req, res) => {
//   try {
//     const rental_address = req.params.rental_address;
//     console.log("Rental Address:", rental_address);

//     const data = await Tenants.find({
//       "entries.rental_adress": rental_address
//     });

//     if (!data || data.length === 0) {
//       res.status(404).json({
//         statusCode: 404,
//         message: "Entries not found",
//       });
//       return;
//     }

//     const tenantData = data.map(entry => ({
//       tenant_firstName: entry.tenant_firstName,
//       tenant_lastName: entry.tenant_lastName,
//     }));

//     console.log("tenantData", tenantData);

//     res.json({
//       data: tenantData,
//       statusCode: 200,
//       message: "Tenant Name Details",
//     });
//   } catch (error) {
//     // Handle errors properly
//     console.error(error);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Internal server error",
//     });
//   }
// });

router.get("/tenant-name/tenant/:rental_address", async (req, res) => {
  try {
    const rental_address = req.params.rental_address;
    console.log("Rental Address:", rental_address);

    const data = await Tenants.find({
      "entries.rental_adress": rental_address,
    });

    if (!data || data.length === 0) {
      res.status(404).json({
        statusCode: 404,
        message: "Entries not found",
      });
      return;
    }

    // Extract the desired fields from the data
    const tenantData = data.map((entry) => ({
      tenant_firstName: entry.tenant_firstName,
      tenant_lastName: entry.tenant_lastName,
      _id: entry._id,
      entryIndex: entry.entries[0].entryIndex, // Assuming there's only one entry
    }));

    console.log("tenantData", tenantData);

    res.json({
      data: tenantData,
      statusCode: 200,
      message: "Tenant Name Details",
    });
  } catch (error) {
    // Handle errors properly
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});

router.put("/moveout/:id/:entryIndex", async (req, res) => {
  try {
    const { id, entryIndex } = req.params;

    let result = await Tenants.findOneAndUpdate(
      {
        "_id": id,
        "entries.entryIndex": entryIndex
      },
      {
        $set: {
          "entries.$.moveout_date": req.body.moveout_date,
          "entries.$.moveout_notice_given_date": req.body.moveout_notice_given_date,
          "entries.$.end_date": req.body.end_date,
          // Add other fields you want to update
        }
      },
      { new: true }
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "Entry Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//get id wise rental address
router.get("/rental-address/:id", async (req, res) => {
  try {
    const tenantId = req.params.id;

    // Find the tenant document by ID
    const tenant = await Tenants.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Extract and send the rental addresses
    const rentalAddresses = tenant.entries.map((entry) => entry.rental_adress);

    res.status(200).json({ rentalAddresses });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.put("/moveout/:id/:entryIndex", async (req, res) => {
  try {
    const { id, entryIndex } = req.params;

    let result = await Tenants.findOneAndUpdate(
      {
        _id: id,
        "entries.entryIndex": entryIndex,
      },
      {
        $set: {
          "entries.$.moveout_date": req.body.moveout_date,
          "entries.$.moveout_notice_given_date":
            req.body.moveout_notice_given_date,
          // Add other fields you want to update
        },
      },
      { new: true }
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "Entry Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
