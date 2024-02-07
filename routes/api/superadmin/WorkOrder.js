var express = require("express");
var router = express.Router();
const moment = require("moment");
const WorkOrder = require("../../../modals/superadmin/WorkOrder");
var Parts = require("../../../modals/superadmin/PartsAndLabors");
const Rentals = require("../../../modals/superadmin/Rentals");
const Unit = require("../../../modals/superadmin/Unit");
const Tenant = require("../../../modals/superadmin/Tenant");
const StaffMember = require("../../../modals/superadmin/StaffMember");
const Vendor = require("../../../modals/superadmin/Vendor");

router.post("/work-order", async (req, res) => {
  try {
    const timestamp = Date.now();
    const workId = `${timestamp}`;
    req.body.workOrder["workOrder_id"] = workId;
    req.body.workOrder["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.workOrder["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    var workOrder = await WorkOrder.create(req.body.workOrder);

    const partId = `${timestamp}`;
    req.body.parts["parts_id"] = partId;
    req.body.parts["workOrder_id"] = workOrder.workOrder_id;
    req.body.parts["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.parts["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    var parts = await Parts.create(req.body.parts);

    res.json({
      statusCode: 200,
      data: { workOrder, parts },
      message: "Add Umit Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/work-order/:workOrder_id", async (req, res) => {
  try {
    const workOrder_id = req.params.workOrder_id;

    const workOrderData = await WorkOrder.findOne({ workOrder_id });

    const partsData = await Parts.find({ workOrder_id });

    const rentalAdress = await Rentals.findOne({
      rental_id: workOrderData.rental_id,
    });

    const rentalUnit = await Unit.findOne({
      unit_id: workOrderData.unit_id,
    });

    const staffMember = await StaffMember.findOne({
      staffmember_id: workOrderData.staffmember_id,
    });

    const vendor = await Vendor.findOne({
      vendor_id: workOrderData.vendor_id,
    });

    var tenantData;
    if (workOrderData.tenant_id) {
      tenantData = await Tenant.findOne({
        tenant_id: workOrderData.tenant_id,
      });
    }

    res.json({
      statusCode: 200,
      data: {
        workOrderData,
        partsData,
        rentalAdress,
        rentalUnit,
        staffMember,
        vendor,
        tenantData,
      },
      message: "Data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/work-orders/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    const workOrdersData = await WorkOrder.find({ admin_id });
    if (!workOrdersData || workOrdersData.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "No work orders found for the specified admin.",
      });
    }

    const resultDataArray = [];

    for (const workOrderData of workOrdersData) {
      const partsData = await Parts.find({
        workOrder_id: workOrderData.workOrder_id,
      });

      resultDataArray.push({
        workOrderData,
        partsData,
      });
    }

    res.json({
      statusCode: 200,
      data: resultDataArray,
      message: "Data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
