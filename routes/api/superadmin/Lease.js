var express = require("express");
var router = express.Router();
var Lease = require("../../../modals/superadmin/Leasing");
var Tenant = require("../../../modals/superadmin/Tenant");
var Cosigner = require("../../../modals/superadmin/Cosigner");
var Charge = require("../../../modals/superadmin/Charge");
var Unit = require("../../../modals/superadmin/Unit");
var Rentals = require("../../../modals/superadmin/Rentals");
var moment = require("moment");
const { default: mongoose } = require("mongoose");

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

        const cosignerTimestamp = Date.now();
        cosignerData.cosigner_id = `${cosignerTimestamp}`;
        cosignerData.tenant_id = tenant.tenant_id;
        cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
        cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

        cosigner = await Cosigner.create(cosignerData);
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

      const cosignerTimestamp = Date.now();
      cosignerData.cosigner_id = `${cosignerTimestamp}`;
      cosignerData.tenant_id = tenant.tenant_id;
      cosignerData.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
      cosignerData.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      cosigner = await Cosigner.create(cosignerData);

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
    const leases = await Lease.findOne({ admin_id: admin_id });

    const data = [];

    for (const lease in leases) {
      const tenant = await Tenant.findOne({ tenant_id: lease.tenant_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });
      data.push({
        tenant,
        rental,
        unit,
        lease,
      });
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

module.exports = router;
