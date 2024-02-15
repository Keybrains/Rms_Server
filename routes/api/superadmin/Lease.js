var express = require("express");
var router = express.Router();
var Lease = require("../../../modals/superadmin/Leasing");
var Tenant = require("../../../modals/superadmin/Tenant");
var Cosigner = require("../../../modals/superadmin/Cosigner");
var Charge = require("../../../modals/superadmin/Charge");
var Unit = require("../../../modals/superadmin/Unit");
var Rentals = require("../../../modals/superadmin/Rentals");
var emailService = require("./emailService");
const RentalOwner = require("../../../modals/superadmin/RentalOwner");
var moment = require("moment");
const { default: mongoose } = require("mongoose");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");

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

        tenant = await Tenant.create(tenantData);

        const leaseTimestamp = Date.now();
        leaseData.lease_id = `${leaseTimestamp}`;
        leaseData.tenant_id = tenant.tenant_id;
        leaseData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        leaseData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

        lease = await Lease.create(leaseData);

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

        if (cosignerData.cosigner_phoneNumber) {
          const cosignerTimestamp = Date.now();
          cosignerData.cosigner_id = `${cosignerTimestamp}`;
          cosignerData.tenant_id = tenant.tenant_id;
          cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
          cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

          cosigner = await Cosigner.create(cosignerData);
        }
        for (const chargesData of chargeData) {
          const chargeTimestamp = Date.now();
          chargesData.charge_id = `${chargeTimestamp}`;
          chargesData.tenant_id = tenant.tenant_id;
          chargesData.lease_id = lease.lease_id;
          chargesData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
          chargesData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

          const newCharge = await Charge.create(chargesData);
          charge.push(newCharge);
        }
      }
    } else {
      tenant = existingTenant;
      const leaseTimestamp = Date.now();
      leaseData.lease_id = `${leaseTimestamp}`;
      leaseData.tenant_id = tenant.tenant_id;
      leaseData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      leaseData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      lease = await Lease.create(leaseData);

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

      if (cosignerData.cosigner_phoneNumber) {
        const cosignerTimestamp = Date.now();
        cosignerData.cosigner_id = `${cosignerTimestamp}`;
        cosignerData.tenant_id = tenant.tenant_id;
        cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

        cosigner = await Cosigner.create(cosignerData);
      }

      for (const chargesData of chargeData) {
        const chargeTimestamp = Date.now();
        chargesData.charge_id = `${chargeTimestamp}`;
        chargesData.tenant_id = tenant.tenant_id;
        chargesData.lease_id = lease.lease_id;
        chargesData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        chargesData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

        const newCharge = await Charge.create(chargesData);
        charge.push(newCharge);
      }
    }

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

// Check Lease (same Rental Assign or not from start_date and end_date )
router.post("/check_lease", async (req, res) => {
  try {
    // Extract start_date and end_date from the request body
    const { tenant_id, rental_id, unit_id, start_date, end_date } = req.body;

    // Find existing lease in the database
    let findPlanName = await Lease.findOne({
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

    await Promise.all(
      leases.map(async (lease) => {
        const tenant = await Tenant.findOne({ tenant_id: lease.tenant_id });
        const rental = await Rentals.findOne({ rental_id: lease.rental_id });
        const unit = await Unit.findOne({ unit_id: lease.unit_id });
        const charge = await Charge.findOne({
          lease_id: lease.lease_id,
          charge_type: "Last Month's Rent",
        });
        data.push({
          tenant,
          rental,
          unit,
          lease,
          charge,
        });
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
    const subject =
      "Welcome to your new Resident Center with Keybrainstech.managebuilding.com!";
    // const company_name = data.company_name;
    const buttonText = "Activate account";
    const buttonLink = `https://http://192.168.1.13:8444/api/api#/client/request/`;
    const accountInformation = `
    <div style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
      <p><strong>Account information</strong></p>
      <p>Website: http://*********.managebuilding.com/Resident/</p>
      <p>Username: *********@gmail.com</p>
    </div>
  `;

    // const text = `<p><h3>company_name<h3></p><hr />Hello ${req.body.first_name} ${req.body.last_name},<p>We're inviting you to log in to our Job cloud.<p/><p>Job cloud is a self-serve online experience where you can access your account details. Log in any time to view things like recent quotes or invoices.</p>`;
    const text = `
      <p><h3>Keybrainstech</h3></p>
      <hr />
      <p>Hello Shivam Shukla</p>
      <p>You're invited to join our Resident Center! After signing in, you can enjoy many benefits including the ability to:.</p>
      <p>Pay rent online and set up autopay</p>
      <p>Pay Submit maintenance requests and general inquiries</p>
      <p>Record information about your renters insurance policy</p>
      <p><a href="${buttonLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">${buttonText}</a></p>
      <div ></div>
      ${accountInformation}

    `;

    // const email = req.body.email;

    // const client = await Clients.findOne({ email: req.body.email });

    // Send welcome email using the email service
    await emailService.sendWelcomeEmail(data.email, subject, text);

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

    res.json({
      statusCode: 200,
      data: tenantData,
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

    const rentalOwner_data = await RentalOwner.findOne({
      rentalowner_id: rental_data.rentalowner_id,
    });

    const unit_data = await Unit.findOne({ unit_id: unit_id });
    const charge = await Charge.findOne({
      lease_id: lease_id,
      charge_type: "Last Month's Rent",
    });

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
      charge_id: charge.charge_id,
      amount: charge.amount,
      date: charge.date,
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

router.put("/lease_moveout/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;
    req.body["end_date"] = req.body.moveout_date;
    console.log(req.body);
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

router.get("/tenants/:lease_id", async (req, res) => {
  try {
    const lease_id = req.params.lease_id;

    var data = await Lease.findOne({ lease_id });

    const tenant_id = data.tenant_id;
    const tenant_data = await Tenant.findOne({ tenant_id: tenant_id });

    res.json({
      statusCode: 200,
      data: tenant_data,
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
