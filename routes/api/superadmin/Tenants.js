var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var Lease = require("../../../modals/superadmin/Leasing");
var Rentals = require("../../../modals/superadmin/Rentals");
var Unit = require("../../../modals/superadmin/Unit");
var RentalOwner = require("../../../modals/superadmin/RentalOwner");
var StaffMember = require("../../../modals/superadmin/StaffMember");
var PropertyType = require("../../../modals/superadmin/PropertyType");
const { createTenantToken } = require("../../../authentication");
var moment = require("moment");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");
const crypto = require("crypto");
var emailService = require("./emailService");

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

// ================= Super Admin =================================

router.get("/tenant/get/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Tenant.aggregate([
      {
        $match: { admin_id: admin_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    if (!data) {
      res.status(201).json({
        statusCode: 201,
        message: "Tenants not found for the specified admin.",
      });
    }

    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      const admin_data = await Admin_Register.findOne(
        { admin_id: admin_id },
        "admin_id first_name last_name"
      );

      data[i].admin_data = admin_data;
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
        { tenant_firstName: { $regex: new RegExp(searchValue, "i") } },
        { tenant_lastName: { $regex: new RegExp(searchValue, "i") } },
        { tenant_email: { $regex: new RegExp(searchValue, "i") } },
        {
          tenant_phoneNumber: !isNaN(searchValue) ? Number(searchValue) : null,
        },
      ];
    }

    const data = await Tenant.find(query);

    const promises = data.map((tenant) => {
      return Tenant.findOne({ admin_id: tenant.admin_id });
    });

    const adminDataArray = await Promise.all(promises);

    const updatedData = data.map((tenant, index) => {
      return {
        ...tenant._doc,
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

// ============== Admin ==================================

router.get("/tenant_details/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    var data = await Tenant.aggregate([
      {
        $match: { tenant_id: tenant_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    if (!data) {
      res.status(201).json({
        statusCode: 201,
        message: "Tenant not found.",
      });
    }

    data[0].leaseData = [];
    // Fetch lease data for the current tenant
    const lease_data = await Lease.find({ tenant_id: tenant_id });

    // Loop through each lease data for the current tenant
    for (let j = 0; j < lease_data.length; j++) {
      const rental_id = lease_data[j].rental_id;
      // Fetch unit data for the current rental_id
      const rental_data = await Rentals.findOne({ rental_id: rental_id });

      const unit_id = lease_data[j].unit_id;
      // Fetch unit data for the current unit_id
      const unit_data = await Unit.findOne({ unit_id: unit_id });
      // Add unit_data to lease_data object

      const object = {
        lease_id: lease_data[j].lease_id,
        start_date: lease_data[j].start_date,
        end_date: lease_data[j].end_date,
        lease_type: lease_data[j].lease_type,
        rental_id: rental_id,
        rental_adress: rental_data.rental_adress,
        rentalowner_id: rental_data.rentalowner_id,
        unit_id: unit_id,
        rental_unit: unit_data.rental_unit || "",
      };

      data[0].leaseData.push(object);
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

router.get("/tenants/:admin_id", async (req, res) => {
  const admin_id = req.params.admin_id;
  try {
    const tenants = await Tenant.find({ admin_id: admin_id });

    if (tenants.length === 0) {
      return res
        .status(201)
        .json({ message: "No tenants found for the given admin" });
    }

    res.json({
      statusCode: 200,
      data: tenants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get_tenant/:tenant_id", async (req, res) => {
  const tenant_id = req.params.tenant_id;
  try {
    const tenants = await Tenant.findOne({ tenant_id: tenant_id });

    if (tenants.length === 0) {
      return res.status(201).json({ message: "No tenant found." });
    }

    const pass = decrypt(tenants.tenant_password);
    console.log(pass);
    tenants.tenant_password = pass;

    res.json({
      statusCode: 200,
      data: tenants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/tenants", async (req, res) => {
  const tenantData = req.body;
  try {
    const existingTenants = await Tenant.findOne({
      admin_id: tenantData.admin_id,
      tenant_phoneNumber: tenantData.tenant_phoneNumber,
    });

    const adminData = await AdminRegister.findOne({
      admin_id: req.body.admin_id,
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

      // Ensure recipient email is defined
      if (!req.body.tenant_email) {
        return res
          .status(400)
          .json({ message: "Recipient email not provided" });
      }

      const subject = "Tenant Login Credentials";
      const text = `
        <p>Hello,</p>
        <p>Here are your credentials for tenant login:</p>
        <p>Email: ${req.body.tenant_email}</p>
        <p>Password: ${req.body.tenant_password}</p>
        <p>Login URL: https://302-properties.vercel.app/auth/${adminData.company_name}/tenants/login</p>
      `;

      // Send email with login credentials
      await emailService.sendWelcomeEmail(req.body.tenant_email, subject, text);

      let hashConvert = encrypt(req.body.tenant_password);
      req.body.tenant_password = hashConvert;

      const tenant = await Tenant.create(tenantData);
      res.json({
        statusCode: 200,
        data: tenant,
        message: "Add Tenant Successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/tenants/:tenant_id", async (req, res) => {
  try {
    const { tenant_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const pass = encrypt(req.body.tenant_password);
    console.log(pass);
    req.body.tenant_password = pass;

    const result = await Tenant.findOneAndUpdate(
      { tenant_id: tenant_id },
      { $set: req.body },
      { new: true }
    );
    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Tenant Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Tenant not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/tenant/:tenant_id", async (req, res) => {
  const tenant_id = req.params.tenant_id;
  try {
    const existingTenant = await Lease.findOne({
      tenant_id: tenant_id,
    });

    if (existingTenant) {
      return res.status(201).json({
        statusCode: 201,
        message: `Cannot delete tenant. The tenant is already assigned to a lease.`,
      });
    } else {
      const deletedTenant = await Tenant.deleteOne({
        tenant_id: tenant_id,
      });

      console.log(deletedTenant.deletedCount, tenant_id);
      if (deletedTenant.deletedCount === 1) {
        return res.status(200).json({
          statusCode: 200,
          message: `Tenant deleted successfully.`,
        });
      } else {
        return res.status(201).json({
          statusCode: 201,
          message: `Tenant not found. No action taken.`,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Tenant Login
router.post("/login", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      tenant_email: req.body.email,
      admin_id: req.body.admin_id,
    });

    if (!tenant) {
      return res.status(201).json({
        statusCode: 201,
        message: "Tenant does not exist",
      });
    }

    const pass = decrypt(tenant.tenant_password);

    if (req.body.password !== pass) {
      return res.status(200).json({
        statusCode: 202,
        message: "Invalid Tenant password",
      });
    }

    const token = await createTenantToken({
      _id: tenant._id,
      tenant_id: tenant.tenant_id,
      admin_id: tenant.admin_id,
      tenant_firstName: tenant.tenant_firstName,
      tenant_lastName: tenant.tenant_lastName,
      tenant_phoneNumber: tenant.tenant_phoneNumber,
      tenant_alternativeNumber: tenant.tenant_alternativeNumber,
      tenant_email: tenant.tenant_email,
      tenant_alternativeEmail: tenant.tenant_alternativeEmail,
      tenant_birthDate: tenant.tenant_birthDate,
      taxPayer_id: tenant.taxPayer_id,
      comments: tenant.comments,
      emergency_contact: tenant.emergency_contact,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });

    res.json({
      statusCode: 200,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});

router.get("/tenant_profile/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    const tenantData = await Tenant.findOne({ tenant_id: tenant_id });

    if (!tenantData) {
      return res.status(201).json({
        statusCode: 201,
        message: "Tenant not found",
      });
    }

    const data = {};
    const leaseData = await Lease.find({ tenant_id: tenant_id });

    data.tenantData = tenantData;
    data.leaseData = [];
    for (let i = 0; i < leaseData.length; i++) {
      const rental_id = leaseData[i].rental_id;

      const rentalData = await Rentals.findOne({ rental_id: rental_id });

      data.leaseData.push({
        lease: leaseData[i],
        rental: rentalData,
      });
    }

    res.json({
      statusCode: 200,
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

router.get("/tenant_property/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    const tenantData = await Tenant.findOne({ tenant_id: tenant_id });

    if (!tenantData) {
      return res.status(201).json({
        statusCode: 201,
        message: "Tenant not found",
      });
    }

    const data = [];
    const leaseData = await Lease.find({ tenant_id: tenant_id });

    for (let i = 0; i < leaseData.length; i++) {
      const rental_id = leaseData[i].rental_id;

      const rentalData = await Rentals.findOne({ rental_id: rental_id });

      data.push({
        lease_id: leaseData[i].lease_id,
        start_date: leaseData[i].start_date,
        end_date: leaseData[i].end_date,
        rental_id: rentalData.rental_id,
        rental_adress: rentalData.rental_adress,
      });
    }

    res.json({
      statusCode: 200,
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


router.get("/property_count/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    const countData = await Lease.find({ tenant_id: tenant_id });

    res.json({
      statusCode: 200,
      data: countData.length,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/tenant_count/:admin_id", async (req, res) => {
  try {
    const { admin_id } = req.params;
    const rentals = await Tenant.find({ admin_id });
    const count = rentals.length;
    res.status(200).json({
      statusCode: 200,
      count: count,
      message: "Work-Order not found",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/rental_tenant/:rental_id", async (req, res) => {
  try {
    const { rental_id } = req.params;
    const leases = await Lease.find({ rental_id });

    const tenants = [];
    for (const lease of leases) {
      const tenant = await Tenant.findOne({ tenant_id: lease.tenant_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });
      if (tenant) {
        tenants.push({
          ...tenant.toObject(),
          ...lease.toObject(),
          ...rental.toObject(),
          ...unit.toObject(),
        });
      }
    }

    res.status(200).json({
      statusCode: 200,
      data: tenants,
      count: tenants.length,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/leases/:lease_id", async (req, res) => {
  try {
    const { lease_id } = req.params;

    const getedLease = await Lease.findOne({ lease_id });
    const leasesData = await Lease.find({
      rental_id: getedLease.rental_id,
      unit_id: getedLease.unit_id,
    });

    const tenants = [];
    for (const lease of leasesData) {
      const tenant = await Tenant.findOne({ tenant_id: lease.tenant_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });
      if (tenant) {
        const object = {
          lease_id: lease.lease_id,
          tenant_id: lease.tenant_id,
          admin_id: lease.admin_id,
          rental_id: lease.rental_id,
          moveout_notice_given_date: lease.moveout_notice_given_date,
          moveout_date: lease.moveout_date,
          unit_id: lease.unit_id,
          lease_type: lease.lease_type,
          start_date: lease.start_date,
          end_date: lease.end_date,
          tenant_firstName: tenant.tenant_firstName,
          tenant_lastName: tenant.tenant_lastName,
          tenant_phoneNumber: tenant.tenant_phoneNumber,
          tenant_email: tenant.tenant_email,
          rental_adress: rental.rental_adress,
          rental_unit: unit.rental_unit,
        };
        tenants.push(object);
      }
    }

    res.status(200).json({
      statusCode: 200,
      data: tenants,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
