var express = require("express");
var router = express.Router();
var Tenant = require("../../../modals/superadmin/Tenant");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var Lease = require("../../../modals/superadmin/Leasing");
var Rentals = require("../../../modals/superadmin/Rentals");
var Unit = require("../../../modals/superadmin/Unit");
var WorkOrder = require("../../../modals/superadmin/WorkOrder");
const { createTenantToken } = require("../../../authentication");
var moment = require("moment");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");
const crypto = require("crypto");
var emailService = require("./emailService");
const Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const Plans = require("../../../modals/superadmin/Plans");
const nodemailer = require("nodemailer");
const { default: axios } = require("axios");
const transporter = nodemailer.createTransport({
  host: "smtp.socketlabs.com",
  port: 587,
  secure: false,
  auth: {
    user: "server39897",
    pass: "c9J3Wwm5N4Bj",
  },
});

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

//========================== Admin ==================================

router.get("/dashboard_workorder/:tenant_id/:admin_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;
    const admin_id = req.params.admin_id;

    const new_workorder = await WorkOrder.find({
      tenant_id: tenant_id,
      admin_id: admin_id,
      status: "New",
    })
      .select("work_subject work_category workOrder_id date status")
      .sort({ date: -1 });

    const currentDate = moment().format("YYYY-MM-DD");
    const overdue_workorder = await WorkOrder.find({
      tenant_id: tenant_id,
      admin_id: admin_id,
      status: { $ne: "Complete" },
      date: { $lt: currentDate },
    })
      .select("work_subject work_category workOrder_id date status")
      .sort({ date: -1 });

    res.json({
      data: { new_workorder, overdue_workorder },
      statusCode: 200,
      message: "Read Work-orders",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

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
  try {
    const admin_id = req.params.admin_id;

    const planPurchase = await Plans_Purchased.findOne({
      admin_id,
      is_active: true,
    });

    let tenants = [];

    if (planPurchase) {
      const plan = await Plans.findOne({ plan_id: planPurchase.plan_id });
      if (plan && plan.plan_name === "Free Plan") {
        const adminTenants = await Tenant.find({
          admin_id: admin_id,
          is_delete: false,
        });
        const trialTenants = await Tenant.find({
          admin_id: "is_trial",
          is_delete: false,
        });
        tenants = [...adminTenants, ...trialTenants];
      } else {
        tenants = await Tenant.find({ admin_id: admin_id, is_delete: false });
      }
    } else {
      tenants = await Tenant.find({ admin_id: admin_id, is_delete: false });
    }

    for (const tenant of tenants) {
      const password = decrypt(tenant.tenant_password);
      tenant.tenant_password = password;
    }

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
    const externalApiResponse = await axios.get(
      `https://saas.cloudrentalmanager.com/api/plans/planlimitations/tenant/${tenantData.admin_id}`
    );

    if (externalApiResponse.status === 201) {
      return res.status(201).json(externalApiResponse.data);
    }

    const existingTenants = await Tenant.findOne({
      admin_id: tenantData.admin_id,
      tenant_phoneNumber: tenantData.tenant_phoneNumber,
      is_delete: false,
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

      const ApiResponse = await axios.post(
        `https://saas.cloudrentalmanager.com/api/admin/passwordmail`,{
          tenant_email: req.body.tenant_email
          // name : tenantData.tenant_firstName + tenantData.tenant_lastName
        }
      );
      if (ApiResponse.status === 200) {
        console.log('Password mail sent successfully');

      // const subject = "Tenant Login Credentials";
      // const text = `
      //   <p>Hello,</p>
      //   <p>Here are your credentials for tenant login:</p>
      //   <p>Email: ${req.body.tenant_email}</p>
      //   <p>Login URL: http://localhost:3000/auth/createpassword</p>
      // `;

      // // Send email with login credentials
      // await emailService.sendWelcomeEmail(req.body.tenant_email, subject, text);

      let hashConvert = encrypt(req.body.tenant_password);
      req.body.tenant_password = hashConvert;

      const tenant = await Tenant.create(tenantData);
      res.json({
        statusCode: 200,
        data: tenant,
        message: "Add Tenant Successfully",
      });
    }
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
      is_delete: false,
    });

    if (existingTenant) {
      return res.status(201).json({
        statusCode: 201,
        message: `Cannot delete tenant. The tenant is already assigned to a lease.`,
      });
    } else {
      const deletedTenant = await Tenant.updateOne(
        { tenant_id: tenant_id },
        { $set: { is_delete: true } }
      );

       if (deletedTenant.modifiedCount === 1) {
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
      message: "Tenant Login Success",
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
    const currentDate = moment().startOf("day"); // Get current date

    const tenantData = await Tenant.findOne({ tenant_id: tenant_id });

    if (!tenantData) {
      return res.status(404).json({
        statusCode: 404,
        message: "Tenant not found",
      });
    }

    const leaseData = await Lease.find({ tenant_id: tenant_id });
    const filteredLeaseData = leaseData.filter((lease) => {
      const startDate = moment(lease.start_date);
      const endDate = moment(lease.end_date);
      return currentDate.isBetween(startDate, endDate, null, "[]");
    });

    const entry = filteredLeaseData.map((lease) => {
      const entryData = lease.entry.filter(
        (entry) => entry.charge_type === "Rent"
      );
      return entryData[0];
    });

    console.log(entry[0]);

    const rental_id = filteredLeaseData[0].rental_id;
    const rentalData = await Rentals.findOne({ rental_id: rental_id });
    const unit_id = filteredLeaseData[0].unit_id;
    const unitData = await Unit.findOne({ unit_id: unit_id });

    const object = {
      lease_id: filteredLeaseData[0].lease_id,
      lease_type: filteredLeaseData[0].lease_type,
      start_date: filteredLeaseData[0].start_date,
      end_date: filteredLeaseData[0].end_date,
      tenant_id: tenant_id,
      tenant_firstName: tenantData.tenant_firstName,
      tenant_lastName: tenantData.tenant_lastName,
      tenant_phoneNumber: tenantData.tenant_phoneNumber,
      tenant_email: tenantData.tenant_email,
      rental_id: rental_id,
      rental_adress: rentalData.rental_adress,
      unit_id: unit_id,
      rental_unit: unitData.rental_unit,
      amount: entry[0].amount,
      date: entry[0].date,
      rent_cycle: entry[0].rent_cycle,
    };

    res.json({
      statusCode: 200,
      data: object,
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
    const leaseData = await Lease.find({
      tenant_id: tenant_id,
      is_delete: "false",
    });

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
    const rentals = await Tenant.find({ admin_id, is_delete: false });
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

router.get("/count/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    const property_tenant = await Lease.find({
      tenant_id: tenant_id,
      is_delete: false,
    });

    const workorder_tenant = await WorkOrder.find({
      tenant_id: tenant_id,
      is_delete: false,
    });

    res.json({
      property_tenant: property_tenant.length,
      workorder_tenant: workorder_tenant.length,
      statusCode: 200,
      message: "Read Tenant Dashboard count",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/limitation/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    const rentalCount = await Tenant.count({ admin_id, is_delete: false });
    const planPur = await Plans_Purchased.findOne({ admin_id });
    const planId = planPur.plan_id;
    const plan = await Plans.findOne({ plan_id: planId });

    if (!plan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan not found",
      });
    }

    const propertyCountLimit = plan.tenant_count;

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
