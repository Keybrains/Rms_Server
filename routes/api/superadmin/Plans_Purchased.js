var express = require("express");
var router = express.Router();
var Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const moment = require("moment");
var Notification = require("../../../modals/superadmin/Notification");
const Plans = require("../../../modals/superadmin/Plans");
var AdminRegister = require("../../../modals/superadmin/Admin_Register");

router.post("/purchase", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    req.body["purchase_id"] = uniqueId;
    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const data = await Plans_Purchased.create(req.body);

    const adminDetails = await AdminRegister.findOne({
      admin_id: req.body.admin_id,
    });

    const planDetails = await Plans.findOne({ plan_id: req.body.plan_id });

    if (data && adminDetails && planDetails) {
      const notificationTimestamp = Date.now();
      const notification = {
        notification_id: notificationTimestamp,
        admin_id: req.body.admin_id,
        notification_title: "New Plan Purchased",
        notification_detail: `${planDetails.plan_name} purchased by ${adminDetails.first_name} ${adminDetails.last_name}.`,
        notification_type: {
          key: "Plan_purchased",
          value: "Plan Purchased",
        },
        notification_send_to: [{ superadmin_id: "1707921684230" }],
        notification_read: { is_superadmin_read: false },
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      await Notification.create(notification);
      res.json({
        statusCode: 200,
        data: data,
        message: "Plan Purchased Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/plan-purchase/:id", async (req, res) => {
  try {
    const planPurchase = await Plans_Purchased.findOne({
      admin_id: req.params.id,
      is_active: true,
    });

    if (!planPurchase) {
      return res.status(404).json({
        statusCode: 404,
        message: "Plan purchase not found",
      });
    }

    const plan = await Plans.findOne({ plan_id: planPurchase.plan_id });

    res.status(200).json({
      statusCode: 200,
      message: "Plan purchase details retrieved successfully",
      data: { ...planPurchase.toObject(), plan_detail: plan },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
