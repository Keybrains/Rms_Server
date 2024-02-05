var express = require("express");
var router = express.Router();
const moment = require("moment");
const WorkOrder = require("../../../modals/superadmin/WorkOrder");
var Parts = require("../../../modals/superadmin/PartsAndLabors");
const Rentals = require("../../../modals/superadmin/Rentals");
const Unit = require("../../../modals/superadmin/Unit");
const Tenant = require("../../../modals/superadmin/Tenant");
const StaffMember = require("../../../modals/superadmin/StaffMember");

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
    if (!workOrderData) {
      return res.status(201).json({
        statusCode: 201,
        message: "Work Order not found.",
      });
    }

    const partsData = await Parts.findOne({ workOrder_id });

    const rentalAdress = await Rentals.findOne({
      rental_id: workOrderData.rental_id,
    });

    const rentalUnit = await Unit.findOne({
      unit_id: workOrderData.unit_id,
    });

    const staffMember = await StaffMember.findOne({
      staffmember_id: workOrderData.staffmember_id,
    });

    if (workOrderData.tenant_id) {
      const tenantData = await Tenant.findOne({
        tenant_id: workOrderData.tenant_id,
      });
    }

    if (!partsData) {
      return res.status(202).json({
        statusCode: 202,
        message: "Parts data not found for the specified workOrder.",
      });
    }

    res.json({
      statusCode: 200,
      data: { workOrderData, partsData },
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
      const partsData = await Parts.findOne({
        workOrder_id: workOrderData.workOrder_id,
      });

      const rentalAdress = await Rentals.findOne({
        rental_id: workOrderData.rental_id,
      });

      if (rentalAdress) {
        partsData.rental_adress = rentalAdress.rental_adress;
      }

      const rentalUnit = await Unit.findOne({
        unit_id: workOrderData.unit_id,
      });

      if (rentalUnit) {
        partsData.rental_unit = rentalUnit.rental_unit;
      }

      const staffMember = await StaffMember.findOne({
        staffmember_id: workOrderData.staffmember_id,
      });

      if (staffMember) {
        partsData.staffmember_name = staffMember.staffmember_name;
      }

      if (workOrderData.tenant_id) {
        const tenantData = await Tenant.findOne({
          tenant_id: workOrderData.tenant_id,
        });
        if (condition) {
          partsData.tenant_firstName = tenantData.tenant_firstName;
          partsData.tenant_lastName = tenantData.tenant_lastName;
        }
      }

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
