var express = require("express");
var router = express.Router();
var Notification = require("../../../modals/superadmin/Notification");
var Charge = require("../../../modals/superadmin/Charge");
const moment = require("moment");
const Payment = require("../../../modals/payment/Payment");
const Surcharge = require("../../../modals/payment/Surcharge");
const Admin_Register = require("../../../modals/superadmin/Admin_Register");
const Unit = require("../../../modals/superadmin/Unit");
const Tenant = require("../../../modals/superadmin/Tenant");
const Rentals = require("../../../modals/superadmin/Rentals");

// router.get("/:tenant_id", async (req, res) => {
//   try {
//     const tenant_id = req.params.tenant_id;

//     var data = await Notification.aggregate([
//       {
//         $match: {
//           notification_send_to: {
//             $elemMatch: { tenant_id: tenant_id },
//           },
//           "notification_read.is_tenant_read": false,
//         },
//       },

//       {
//         $sort: { createdAt: -1 },
//       },
//     ]);

//     for (let i = 0; i < data.length; i++) {
//       const admin_id = data[i].admin_id;
//       const unit_id = data[i].unit_id;
//       const rental_id = data[i].rental_id;

//       const admin_data = await Admin_Register.findOne({ admin_id });
//       const unit_data = await Unit.findOne({ unit_id: unit_id });
//       const rental_data = await Rentals.findOne({ rental_id: rental_id });

//       data[i].admin_data = {
//         admin_id: admin_data?.admin_id,
//         first_name: admin_data?.first_name,
//         last_name: admin_data?.last_name,
//       };

//       data[i].unit_data = unit_data;
//       data[i].rental_data = rental_data;
//     }

//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Read Notification",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/tenant/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    var data = await Notification.aggregate([
      {
        $match: {
          "notification_send_to.tenant_id": tenant_id,
          "notification_read.is_tenant_read": false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;
      const unit_id = data[i].unit_id;
      const rental_id = data[i].rental_id;

      const admin_data = await Admin_Register.findOne({ admin_id });
      const unit_data = await Unit.findOne({ unit_id: unit_id });
      const rental_data = await Rentals.findOne({ rental_id: rental_id });

      data[i].admin_data = {
        admin_id: admin_data?.admin_id,
        first_name: admin_data?.first_name,
        last_name: admin_data?.last_name,
      };

      data[i].unit_data = unit_data;
      data[i].rental_data = rental_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Notification",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/staff/:staffmember_id", async (req, res) => {
  try {
    const staffmember_id = req.params.staffmember_id;

    var data = await Notification.aggregate([
      {
        $match: {
          notification_send_to: {
            $elemMatch: { staffmember_id: staffmember_id },
          },
          "notification_read.is_staffmember_read": false,
        },
      },
      
      {
        $sort: { createdAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;
      const unit_id = data[i].unit_id;
      const rental_id = data[i].rental_id;

      const admin_data = await Admin_Register.findOne({ admin_id });
      const unit_data = await Unit.findOne({ unit_id: unit_id });
      const rental_data = await Rentals.findOne({ rental_id: rental_id });

      data[i].admin_data = {
        admin_id: admin_data?.admin_id,
        first_name: admin_data?.first_name,
        last_name: admin_data?.last_name,
      };

      data[i].unit_data = unit_data;
      data[i].rental_data = rental_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Notification",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/vendor/:vendor_id", async (req, res) => {
  try {
    const vendor_id = req.params.vendor_id;

    var data = await Notification.aggregate([
      {
        $match: {
          notification_send_to: {
            $elemMatch: { vendor_id: vendor_id },
          },
          "notification_read.is_vendor_read": false,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;
      const unit_id = data[i].unit_id;
      const rental_id = data[i].rental_id;

      const admin_data = await Admin_Register.findOne({ admin_id });
      const unit_data = await Unit.findOne({ unit_id: unit_id });
      const rental_data = await Rentals.findOne({ rental_id: rental_id });

      data[i].admin_data = {
        admin_id: admin_data?.admin_id,
        first_name: admin_data?.first_name,
        last_name: admin_data?.last_name,
      };

      data[i].unit_data = unit_data;
      data[i].rental_data = rental_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Vendor Notification",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/staff_notification/:notification_id", async (req, res) => {
  try {
    const notification_id = req.params.notification_id;
    const updateNotification = await Notification.findOneAndUpdate(
      { notification_id: notification_id },
      { "notification_read.is_staffmember_read": true },
      { new: true }
    );

    res.json({
      data: updateNotification,
      statusCode: 200,
      message: "Updated is_staffmember_read to true",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/tenant_notification/:notification_id", async (req, res) => {
  try {
    const notification_id = req.params.notification_id;
    const updateNotification = await Notification.findOneAndUpdate(
      { notification_id: notification_id },
      { "notification_read.is_tenant_read": true },
      { new: true }
    );

    res.json({
      data: updateNotification,
      statusCode: 200,
      message: "Updated is_tenant_read to true",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/vendor_notification/:notification_id", async (req, res) => {
  try {
    const notification_id = req.params.notification_id;
    const updateNotification = await Notification.findOneAndUpdate(
      { notification_id: notification_id },
      { "notification_read.is_vendor_read": true },
      { new: true }
    );

    res.json({
      data: updateNotification,
      statusCode: 200,
      message: "Updated is_vendor_read to true",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/superadmin/:superadmin_id", async (req, res) => {
  try {
    const superadmin_id = req.params.superadmin_id;
    console.log(`Superadmin ID: ${superadmin_id}`); // Debugging line

    var data = await Notification.aggregate([
      {
        $match: {
          "notification_send_to.superadmin_id": superadmin_id,
          "notification_read.is_superadmin_read": false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    console.log(`Data: ${JSON.stringify(data)}`); // Debugging line

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Notification",
    });
  } catch (error) {
    console.error(`Error: ${error.message}`); // Debugging line
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.put("/superadmin_notification/:notification_id", async (req, res) => {
  try {
    const notification_id = req.params.notification_id;
    const updateNotification = await Notification.findOneAndUpdate(
      { notification_id: notification_id },
      { "notification_read.is_superadmin_read": true },
      { new: true }
    );

    res.json({
      data: updateNotification,
      statusCode: 200,
      message: "Updated is_superadmin_read to true",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/admin/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;
    console.log(`Admin ID: ${admin_id}`);

    var data = await Notification.aggregate([
      {
        $match: {
          "notification_send_to.admin_id": admin_id,
          "notification_read.is_admin_read": false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    console.log(`Data: ${JSON.stringify(data)}`);

    res.json({
      statusCode: 200,
      data: data,
      message: "Read Notification",
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/admin_notification/:notification_id", async (req, res) => {
  try {
    const notification_id = req.params.notification_id;
    const updateNotification = await Notification.findOneAndUpdate(
      { notification_id: notification_id },
      { "notification_read.is_admin_read": true },
      { new: true }
    );

    res.json({
      data: updateNotification,
      statusCode: 200,
      message: "Updated is_admin_read to true",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
