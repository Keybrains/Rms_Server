var express = require("express");
var router = express.Router();
var Lease = require("../../../modals/superadmin/Leasing");
var Tenant = require("../../../modals/superadmin/Tenant");
var Cosigner = require("../../../modals/superadmin/Cosigner");
var Charge = require("../../../modals/superadmin/Charge");
var Unit = require("../../../modals/superadmin/Unit");
var Rentals = require("../../../modals/superadmin/Rentals");
var Notification = require("../../../modals/superadmin/Notification");
var emailService = require("./emailService");
const RentalOwner = require("../../../modals/superadmin/RentalOwner");
var moment = require("moment");
const { default: mongoose } = require("mongoose");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");
const crypto = require("crypto");
const StaffMember = require("../../../modals/superadmin/StaffMember");
const PropertyType = require("../../../modals/superadmin/PropertyType");

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
// ===================  Super Admin ==================================

router.get("/lease/get/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Lease.aggregate([
      {
        $match: { admin_id: admin_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    data = data.map((item) => {
      const { uploaded_file, ...rest } = item;
      return rest;
    });

    for (let i = 0; i < data.length; i++) {
      const unitId = data[i].unit_id;
      const tenant_id = data[i].tenant_id;
      const rental_id = data[i].rental_id;

      const unit_data = await Unit.findOne({ unit_id: unitId }).exec();

      const tenant_data = await Tenant.findOne(
        { tenant_id: tenant_id },
        "tenant_id admin_id tenant_firstName tenant_lastName createdAt updatedAt"
      );

      const rental_data = await Rentals.findOne({ rental_id: rental_id });

      data[i].tenant_data = tenant_data;
      data[i].unit_data = unit_data;
      data[i].tenant_data = tenant_data;
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Lease",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// ============== User ==================================

// router.post("/leases", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   let lease,
//     tenant,
//     cosigner,
//     charge = [];

//   try {
//     const { leaseData, tenantData, cosignerData, chargeData } = req.body;

//     const existingTenant = await Tenant.findOne({
//       admin_id: tenantData.admin_id,
//       tenant_id: tenantData.tenant_id,
//     });

//     if (!existingTenant) {
//       const existingTenants = await Tenant.findOne({
//         admin_id: tenantData.admin_id,
//         tenant_phoneNumber: tenantData.tenant_phoneNumber,
//       });
//       if (existingTenants) {
//         return res.status(201).json({
//           statusCode: 201,
//           message: `${tenantData.tenant_phoneNumber} Phone Number Already Existing`,
//         });
//       } else {
//         const tenantTimestamp = Date.now();
//         tenantData.tenant_id = `${tenantTimestamp}`;
//         tenantData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         tenantData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         const pass = encrypt(tenantData.tenant_password);
//         tenantData.tenant_password = pass;
//         tenant = await Tenant.create(tenantData);

//         const leaseTimestamp = Date.now();
//         leaseData.lease_id = `${leaseTimestamp}`;
//         leaseData.tenant_id = tenant.tenant_id;
//         leaseData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         leaseData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         leaseData.entry = chargeData;
//         lease = await Lease.create(leaseData);

//         const getRentalsData = await Rentals.findOne({
//           rental_id: lease.rental_id,
//         });

//         if (!getRentalsData) {
//           return res.status(200).json({
//             statusCode: 202,
//             message: "Rentals data not found for the provided rental_id",
//           });
//         }

//         await Rentals.updateOne(
//           { rental_id: lease.rental_id },
//           { $set: { is_rent_on: true } }
//         );

//         if (cosignerData) {
//           const cosignerTimestamp = Date.now();
//           cosignerData.cosigner_id = `${cosignerTimestamp}`;
//           cosignerData.tenant_id = tenant.tenant_id;
//           cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//           cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//           cosigner = await Cosigner.create(cosignerData);
//         }

//         const chargeTimestamp = Date.now();
//         const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//         const filteredCharge = {
//           charge_id: `${chargeTimestamp}`,
//           admin_id: lease.admin_id,
//           tenant_id: lease.tenant_id,
//           lease_id: lease.lease_id,
//           is_leaseAdded: true,
//           createdAt: createdAt,
//           updatedAt: updatedAt,
//           entry: [],
//         };

//         for (const chargesData of chargeData) {
//           filteredCharge.entry.push(chargesData);
//         }

//         const newCharge = await Charge.create(filteredCharge);
//         charge.push(newCharge);
//       }
//     } else {
//       tenant = existingTenant;
//       const leaseTimestamp = Date.now();
//       leaseData.lease_id = `${leaseTimestamp}`;
//       leaseData.tenant_id = tenant.tenant_id;
//       leaseData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//       leaseData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
//       leaseData.entry = chargeData;
//       lease = await Lease.create(leaseData);

//       const getRentalsData = await Rentals.findOne({
//         rental_id: lease.rental_id,
//       });

//       if (!getRentalsData) {
//         // Handle case when Rentals data is not found
//         return res.status(200).json({
//           statusCode: 202,
//           message: "Rentals data not found for the provided rental_id",
//         });
//       }

//       await Rentals.updateOne(
//         { rental_id: lease.rental_id },
//         { $set: { is_rent_on: true } }
//       );

//       if (cosignerData) {
//         const cosignerTimestamp = Date.now();
//         cosignerData.cosigner_id = `${cosignerTimestamp}`;
//         cosignerData.tenant_id = tenant.tenant_id;
//         cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//         cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//         cosigner = await Cosigner.create(cosignerData);
//       }

//       const chargeTimestamp = Date.now();
//       const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
//       const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//       const filteredCharge = {
//         charge_id: `${chargeTimestamp}`,
//         admin_id: lease.admin_id,
//         tenant_id: lease.tenant_id,
//         lease_id: lease.lease_id,
//         is_leaseAdded: true,
//         createdAt: createdAt,
//         updatedAt: updatedAt,
//         total_amount: 0,
//         entry: [],
//       };

//       for (let i = 0; i < chargeData.length; i++) {
//         const chargesData = chargeData[i];
//         filteredCharge.total_amount += parseInt(chargesData.amount);
//         chargesData.entry_id = `${chargeTimestamp}-${i}`;
//         filteredCharge.entry.push(chargesData);
//       }

//       charge = await Charge.create(filteredCharge);
//     }

//     await session.commitTransaction();
//     session.endSession();

//     // Notification When Assign Lease
//     const notificationTimestamp = Date.now();
//     const notificationData = {
//       notification_id: notificationTimestamp,
//       admin_id: lease.admin_id,
//       rental_id: lease.rental_id,
//       unit_id: lease.unit_id,
//       notification_title: "Lease Created",
//       notification_detail: "A new lease has been created.",
//       notification_read: { is_tenant_read: false, is_staffmember_read: false },
//       notification_type: { type: "Assign Lease", lease_id: lease.lease_id },
//       notification_send_to: [
//         { tenant_id: tenant.tenant_id, staffmember_id: getRentalsData[0].staffmember_id },
//       ], // Fill this array with users you want to send the notification to
//       createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       is_lease: true,
//     };

//     const notification = await Notification.create(notificationData);

//     res.json({
//       statusCode: 200,
//       data: { lease, tenant, cosigner, charge, notification },
//       message: "Add Lease Successfully",
//     });
//   } catch (error) {
//     try {
//       await session.abortTransaction();
//     } catch (abortError) {
//       console.error("Error aborting transaction:", abortError);
//     } finally {
//       session.endSession();
//     }

//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });


router.post("/leases", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let lease,
    tenant,
    cosigner,
    charge = [];

  try {
    const { leaseData, tenantData, cosignerData, chargeData } = req.body;

    const existingTenant = await Tenant.findOne({
      admin_id: tenantData.admin_id,
      tenant_id: tenantData.tenant_id,
    });

    //tenant
    if (!existingTenant) {
      const existingTenants = await Tenant.findOne({
        admin_id: tenantData.admin_id,
        tenant_phoneNumber: tenantData.tenant_phoneNumber,
      });

      if (existingTenants) {
        return res.status(201).json({
          statusCode: 201,
          message: `${tenantData.tenant_phoneNumber} Phone Number Already Existing`,
        });
      } else {
        const tenantTimestamp = Date.now();
        tenantData.tenant_id = `${tenantTimestamp}`;
        tenantData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        tenantData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
        const pass = encrypt(tenantData.tenant_password);
        tenantData.tenant_password = pass;

        tenant = await Tenant.create(tenantData);
      }
    } else {
      tenant = existingTenant;
    }

    //lease
    const leaseTimestamp = Date.now();
    leaseData.lease_id = `${leaseTimestamp}`;
    leaseData.tenant_id = tenant.tenant_id;
    leaseData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    leaseData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    leaseData.entry = chargeData.entry;
    for (let i = 0; i < leaseData.entry.length; i++) {
      leaseData.entry[i].entry_id = `${leaseTimestamp}-${i}`;
    }
    lease = await Lease.create(leaseData);

    //update rental
    const getRentalsData = await Rentals.findOne({
      rental_id: lease.rental_id,
    });

    if (!getRentalsData) {
      // Handle case when Rentals data is not found
      return res.status(200).json({
        statusCode: 202,
        message: "Rentals data not found for the provided rental_id",
      });
    }

    await Rentals.updateOne(
      { rental_id: lease.rental_id },
      { $set: { is_rent_on: true } }
    );

    //cosigner
    if (cosignerData) {
      const cosignerTimestamp = Date.now();
      cosignerData.cosigner_id = `${cosignerTimestamp}`;
      cosignerData.tenant_id = tenant.tenant_id;
      cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      cosigner = await Cosigner.create(cosignerData);
    }

    //cahrges
    const chargeTimestamp = Date.now();
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const filteredCharge = {
      ...chargeData,
      charge_id: `${chargeTimestamp}`,
      tenant_id: lease.tenant_id,
      lease_id: lease.lease_id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      total_amount: 0,
    };

    for (let i = 0; i < filteredCharge.entry.length; i++) {
      const chargesData = filteredCharge.entry[i];
      filteredCharge.total_amount += parseInt(chargesData.amount);
      chargesData.entry_id = `${leaseTimestamp}-${i}`;
    }

    charge = await Charge.create(filteredCharge);

    await session.commitTransaction();
    session.endSession();

    res.json({
      statusCode: 200,
      data: { lease, tenant, cosigner, charge },
      message: "Add Lease Successfully",
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    } finally {
      session.endSession();
    }

    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/leases/:lease_id", async (req, res) => {
  const { lease_id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  let lease,
    tenant,
    cosigner,
    charge = [];

  try {
    const { leaseData, tenantData, cosignerData, chargeData } = req.body;

    const existingTenant = await Tenant.findOne({
      admin_id: tenantData.admin_id,
      tenant_id: tenantData.tenant_id,
    });

    //tenant
    if (!existingTenant) {
      const existingTenants = await Tenant.findOne({
        admin_id: tenantData.admin_id,
        tenant_phoneNumber: tenantData.tenant_phoneNumber,
      });

      if (existingTenants) {
        return res.status(201).json({
          statusCode: 201,
          message: `${tenantData.tenant_phoneNumber} Phone Number Already Existing`,
        });
      } else {
        const tenantTimestamp = Date.now();
        tenantData.tenant_id = `${tenantTimestamp}`;
        tenantData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        tenantData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
        const pass = encrypt(tenantData.tenant_password);
        tenantData.tenant_password = pass;

        tenant = await Tenant.create(tenantData);
      }
    } else {
      const pass = encrypt(tenantData.tenant_password);
      tenantData.tenant_password = pass;
      tenantData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      tenant = await Tenant.findOneAndUpdate(
        { tenant_id: tenantData.tenant_id },
        { $set: tenantData },
        { new: true }
      );
    }

    //lease
    leaseData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    leaseData.entry = chargeData.entry;
    for (let i = 0; i < leaseData.entry.length; i++) {
      leaseData.entry[i].entry_id = `${leaseTimestamp}-${i}`;
    }

    const previousLease = await Lease.findOne({ lease_id });

    lease = await Lease.findOneAndUpdate(
      { lease_id: leaseData.lease_id },
      { $set: leaseData },
      { new: true }
    );

    //rental
    if (previousLease.rental_id !== lease.rental_id) {
      const getRentalsData = await Rentals.findOne({
        rental_id: lease.rental_id,
      });

      if (!getRentalsData) {
        return res.status(200).json({
          statusCode: 202,
          message: "Rentals data not found for the provided rental_id",
        });
      }

    await Rentals.updateOne(
      { rental_id: lease.rental_id },
      { $set: { is_rent_on: true } }
    );

      const rentalFind = await Lease.findOne({
        rental_id: previousLease.rental_id,
      });

      if (!rentalFind) {
        await Rentals.updateOne(
          { rental_id: previousLease.rental_id },
          { $set: { is_rent_on: false } }
        );
      }
    }

    //cosigner
    if (cosignerData) {
      cosignerData.tenant_id = tenant.tenant_id;
      cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      cosigner = await Cosigner.findOneAndUpdate(
        { cosigner_id: cosignerData.cosigner_id },
        { $set: cosignerData },
        { new: true }
      );
    }

    //cahrges
    for (const entry of leaseData.entry) {
      const newCharge = await Lease.findOneAndUpdate(
        { "entry.entry_id": entry.entry_id },
        { $set: { entry: entry } },
        { new: true }
      );
      charge.push(newCharge);
    }

    await session.commitTransaction();
    session.endSession();


      // Notification When Assign Lease
      const notificationTimestamp = Date.now();
      const notificationData = {
        notification_id: notificationTimestamp,
        admin_id: lease.admin_id,
        rental_id: lease.rental_id,
        unit_id: lease.unit_id,
        notification_title: "Lease Created",
        notification_detail: "A new lease has been created.",
        notification_read: { is_tenant_read: false, is_staffmember_read: false },
        notification_type: { type: "Assign Lease", lease_id: lease.lease_id },
        notification_send_to: [
          { tenant_id: tenant.tenant_id, staffmember_id: getRentalsData.staffmember_id },
        ], // Fill this array with users you want to send the notification to
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        is_lease: true,
      };
  
      const notification = await Notification.create(notificationData);

    res.json({
      statusCode: 200,
      data: { lease, tenant, cosigner, charge },
      message: "Lease Updated Successfully",
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    } finally {
      session.endSession();
    }

    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Check Lease (same Rental Assign or not from start_date and end_date )
router.post("/check_lease", async (req, res) => {
  try {
    // Extract start_date and end_date from the request body
    const { lease_id, tenant_id, rental_id, unit_id, start_date, end_date } = req.body;

    // Find existing lease in the database
    let findPlanName = await Lease.findOne({
      lease_id: lease_id,
      tenant_id: tenant_id,
      rental_id: rental_id,
      unit_id: unit_id,
    });

    if (findPlanName) {
      // Check for date overlap with existing lease
      const existingStartDate = moment(findPlanName.start_date);
      const existingEndDate = moment(findPlanName.end_date);
      const newStartDate = moment(start_date);
      const newEndDate = moment(end_date);

      if (
        (newStartDate.isSameOrAfter(existingStartDate) &&
          newStartDate.isBefore(existingEndDate)) ||
        (newEndDate.isAfter(existingStartDate) &&
          newEndDate.isSameOrBefore(existingEndDate))
      ) {
        // Date range overlaps with existing lease
        return res.json({
          statusCode: 201,
          message:
            "Please select another date range. Overlapping with existing lease.",
        });
      }

      // Check if the provided date range is entirely before or after the existing lease
      if (
        newEndDate.isBefore(existingStartDate) ||
        newStartDate.isAfter(existingEndDate)
      ) {
        // Date range is entirely before or after existing lease
        return res.json({
          statusCode: 200,
          message: "Date range is available.",
        });
      } else {
        // Date range overlaps with existing lease
        return res.json({
          statusCode: 400,
          message:
            "Please select another date range. Overlapping with existing lease.",
        });
      }
    }

    // If no existing lease, send success response
    res.json({
      statusCode: 200,
      message: "Date range is available.",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/leases/:admin_id", async (req, res) => {
  const admin_id = req.params.admin_id;
  try {
    const leases = await Lease.find({ admin_id: admin_id });

    const data = [];

    for (const lease of leases) {
      const tenant = await Tenant.findOne({ tenant_id: lease.tenant_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });

      const charge = lease?.entry?.filter(
        (item) => item.charge_type === "Rent"
      );

      const object = {
        lease_id: lease.lease_id,
        tenant_id: lease.tenant_id,
        rental_id: lease.rental_id,
        unit_id: lease.unit_id,
        lease_type: lease.lease_type,
        start_date: lease.start_date,
        end_date: lease.end_date,
        amount: charge[0].amount,
        tenant_firstName: tenant.tenant_firstName,
        tenant_lastName: tenant.tenant_lastName,
        rental_adress: rental.rental_adress,
        rental_unit: unit.rental_unit,
        createdAt: lease.createdAt,
        updatedAt: lease.updatedAt,
      };

      data.push(object);
    }

    res.json({
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/leases/:lease_id", async (req, res) => {
  const lease_id = req.params.lease_id;
  try {
    const deletedTenant = await Lease.deleteOne({
      lease_id: lease_id,
    });

    if (deletedTenant.deletedCount === 1) {
      return res.status(200).json({
        statusCode: 200,
        message: `Lease deleted successfully.`,
      });
    } else {
      return res.status(201).json({
        statusCode: 201,
        message: `Lease not found. No action taken.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/lease_mail", async (req, res) => {
  try {
    const data = {
      email: req.body.email,
    };
    // Customize email content
    //   const subject =
    //     "Welcome to your new Resident Center with Keybrainstech.managebuilding.com!";
    //   // const company_name = data.company_name;
    //   const buttonText = "Activate account";
    //   const buttonLink = `https://http://192.168.1.13:8444/api/api#/client/request/`;
    //   const accountInformation = `
    //   <div style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
    //     <p><strong>Account information</strong></p>
    //     <p>Website: http://*********.managebuilding.com/Resident/</p>
    //     <p>Username: *********@gmail.com</p>
    //   </div>
    // `;

    //   // const text = `<p><h3>company_name<h3></p><hr />Hello ${req.body.first_name} ${req.body.last_name},<p>We're inviting you to log in to our Job cloud.<p/><p>Job cloud is a self-serve online experience where you can access your account details. Log in any time to view things like recent quotes or invoices.</p>`;
    //   const text = `
    //     <p><h3>Keybrainstech</h3></p>
    //     <hr />
    //     <p>Hello Shivam Shukla</p>
    //     <p>You're invited to join our Resident Center! After signing in, you can enjoy many benefits including the ability to:.</p>
    //     <p>Pay rent online and set up autopay</p>
    //     <p>Pay Submit maintenance requests and general inquiries</p>
    //     <p>Record information about your renters insurance policy</p>
    //     <p><a href="${buttonLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">${buttonText}</a></p>
    //     <div ></div>
    //     ${accountInformation}

    //   `;

    //   // const email = req.body.email;

    //   // const client = await Clients.findOne({ email: req.body.email });

    //   // Send welcome email using the email service
    //   await emailService.sendWelcomeEmail(data.email, subject, text);

    return res.status(200).json({
      statusCode: 200,
      message: "Tenant Mail Send Successfully",
    });
  } catch (error) {
    console.error("Error:", error);

    // Extract relevant error details
    const errorMessage = error.message || "Internal Server Error";

    return res.status(500).json({
      statusCode: 500,
      message: errorMessage,
      errorDetails: error, // Include the entire error object for more information
    });
  }
});

router.get("/get_tenants/:rental_id/:unit_id", async (req, res) => {
  try {
    const { rental_id, unit_id } = req.params;
    const leases = await Lease.find({ rental_id, unit_id });
    const tenantData = [];
    for (const lease of leases) {
      const tenant = await Tenant.findOne({
        tenant_id: lease.tenant_id,
      });

      tenantData.push(tenant);
    }

    const uniqueTenantData = {};
    tenantData.forEach((item) => {
      uniqueTenantData[item.tenant_id] = item;
    });

    const filteredData = Object.values(uniqueTenantData);

    res.json({
      statusCode: 200,
      data: filteredData,
      message: "Data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/unit_leases/:unit_id", async (req, res) => {
  const unit_id = req.params.unit_id;
  try {
    const leases = await Lease.find({ unit_id: unit_id });

    const data = [];

    await Promise.all(
      leases.map(async (lease) => {
        const tenant = await Tenant.findOne({ tenant_id: lease.tenant_id });
        const charge = await Charge.findOne({
          lease_id: lease.lease_id,
          charge_type: "Last Month's Rent",
        });
        const object = {
          tenant_id: tenant.tenant_id,
          tenant_firstName: tenant.tenant_firstName,
          tenant_lastName: tenant.tenant_lastName,
          start_date: lease.start_date,
          end_date: lease.end_date,
          lease_id: lease.lease_id,
          lease_type: lease.lease_type,
          amount: charge.amount,
        };
        data.push(object);
      })
    );

    res.json({
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/lease_summary/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    var data = await Lease.aggregate([
      {
        $match: { lease_id: lease_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const tenant_id = data[0].tenant_id;
    const unit_id = data[0].unit_id;
    const rental_id = data[0].rental_id;

    const tenant_data = await Tenant.findOne({ tenant_id: tenant_id });

    const rental_data = await Rentals.findOne({
      rental_id: rental_id,
    });
    const property_data = await PropertyType.findOne({
      property_id: rental_data.property_id,
    });

    const rentalOwner_data = await RentalOwner.findOne({
      rentalowner_id: rental_data.rentalowner_id,
    });

    const unit_data = await Unit.findOne({ unit_id: unit_id });
    const charge = data[0].entry.filter((item) => item.charge_type === "Rent");

    const object = {
      lease_id: data[0].lease_id,
      tenant_id: data[0].tenant_id,
      admin_id: data[0].admin_id,
      rental_id: data[0].rental_id,
      unit_id: data[0].unit_id,
      lease_type: data[0].lease_type,
      start_date: data[0].start_date,
      end_date: data[0].end_date,
      tenant_firstName: tenant_data.tenant_firstName,
      tenant_lastName: tenant_data.tenant_lastName,
      tenant_email: tenant_data.tenant_email,
      rental_adress: rental_data.rental_adress,
      rental_unit: unit_data.rental_unit,
      rentalOwner_firstName: rentalOwner_data.rentalOwner_firstName,
      rentalOwner_lastName: rentalOwner_data.rentalOwner_lastName,
      amount: charge[0].amount,
      date: charge[0].date,
    };

    res.json({
      statusCode: 200,
      data: object,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/get_lease/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    var data = await Lease.aggregate([
      {
        $match: { lease_id: lease_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const tenant_id = data[0].tenant_id;
    const unit_id = data[0].unit_id;
    const rental_id = data[0].rental_id;

    const tenant_data = await Tenant.findOne({ tenant_id: tenant_id });

    const password = decrypt(tenant_data.tenant_password);
    tenant_data.tenant_password = password;

    const rental_data = await Rentals.findOne({
      rental_id: rental_id,
    });

    const rentalOwner_data = await RentalOwner.findOne({
      rentalowner_id: rental_data.rentalowner_id,
    });

    const unit_data = await Unit.findOne({ unit_id: unit_id });

    const rec_charge_data = data[0].entry.filter(
      (item) => item.charge_type === "Recurring Charge"
    );

    const one_charge_data = data[0].entry.filter(
      (item) => item.charge_type === "One Time Charge"
    );

    const rent_charge_data = data[0].entry.filter(
      (item) => item.charge_type === "Rent"
    );

    const Security_charge_data = data[0].entry.filter(
      (item) => item.charge_type === "Security Deposite"
    );

    res.json({
      statusCode: 200,
      data: {
        tenant: tenant_data,
        rental: rental_data,
        rentalOwner_data,
        unit_data,
        rec_charge_data,
        one_charge_data,
        rent_charge_data,
        Security_charge_data,
        leases: data[0],
      },
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/lease_moveout/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;
    req.body["end_date"] = req.body.moveout_date;
    const lease = await Lease.findOneAndUpdate(
      { lease_id },
      {
        $set: {
          end_date: req.body.end_date,
          moveout_notice_given_date: req.body.moveout_notice_given_date,
          moveout_date: req.body.moveout_date,
        },
      },
      { new: true }
    );

    res.json({
      statusCode: 200,
      data: lease,
      message: "Entry Updated Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/lease_tenant/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    var data = await Lease.findOne({ lease_id });

    const tenant = await Tenant.findOne({ tenant_id: data.tenant_id });

    const object = {
      tenant_id: tenant.tenant_id,
      admin_id: tenant.admin_id,
      tenant_firstName: tenant.tenant_firstName,
      tenant_lastName: tenant.tenant_lastName,
    };

    res.json({
      statusCode: 200,
      data: object,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
