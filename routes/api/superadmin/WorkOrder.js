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
const Lease = require("../../../modals/superadmin/Leasing");

router.post("/work-order", async (req, res) => {
  try {
    const timestamp = Date.now();
    const workId = `${timestamp}`;
    req.body.workOrder["workOrder_id"] = workId;
    req.body.workOrder["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.workOrder["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    var workOrder = await WorkOrder.create(req.body.workOrder);

    const parts = [];

    for (const part of req.body.parts) {
      const timestampFotParts = Date.now();
      const partId = `${timestampFotParts}`;
      part["parts_id"] = partId;
      part["workOrder_id"] = workOrder.workOrder_id;
      part["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      part["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      var newpart = await Parts.create(part);
      parts.push(newpart);
    }

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
      const rentalAdress = await Rentals.findOne({
        rental_id: workOrderData.rental_id,
      });

      const rentalUnit = await Unit.findOne({
        unit_id: workOrderData.unit_id,
      });

      const staffMember = await StaffMember.findOne({
        staffmember_id: workOrderData.staffmember_id,
      });

      const object = {
        workOrderData,
        rentalAdress,
        rentalUnit,
        staffMember,
      };
      resultDataArray.push(object);
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

router.put("/work-order/:workOrder_id", async (req, res) => {
  try {
    const { workOrder_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.workOrder["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await WorkOrder.findOneAndUpdate(
      { workOrder_id: workOrder_id },
      { $set: req.body.workOrder },
      { new: true }
    );

    const parts = [];

    for (const part of req.body.parts) {
      part["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      const partsData = await Parts.findOneAndUpdate(
        { parts_id: part.parts_id },
        { $set: part },
        { new: true }
      );
      parts.push(partsData);
    }

    if (result) {
      res.json({
        statusCode: 200,
        data: { result, parts },
        message: "Work-Order updsted Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Work-Order not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/vendor_work/:vendor_id", async (req, res) => {
  try {
    const vendor_id = req.params.vendor_id;

    var data = await WorkOrder.aggregate([
      {
        $match: { vendor_id: vendor_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const rental_id = data[i].rental_id;
      const unit_id = data[i].unit_id;

      const unit_data = await Unit.findOne({
        unit_id: unit_id,
      });
      const rental_data = await Rentals.findOne({
        rental_id: rental_id,
      });

      // Attach client and property information to the data item
      data[i].unit_data = unit_data;
      data[i].rental_data = rental_data;
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

router.get("/staff_work/:staffmember_id", async (req, res) => {
  try {
    const { staffmember_id } = req.params;

    var data = await WorkOrder.aggregate([
      {
        $match: { staffmember_id: staffmember_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const rental_id = data[i].rental_id;
      const unit_id = data[i].unit_id;

      // Fetch property information
      const rental_data = await Rentals.findOne(
        {
          rental_id: rental_id,
        },
        "property_id rental_adress rental_city rental_state rental_country rental_postcode admin_id rental_id"
      );

      const unit_data = await Unit.findOne({ unit_id: unit_id });

      // Attach client and property information to the data item
      data[i].rental_data = rental_data;
      data[i].unit_data = unit_data;
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

router.get("/tenant_work/:tenant_id", async (req, res) => {
  try {
    const tenant_id = req.params.tenant_id;

    var data = await Lease.aggregate([
      {
        $match: { tenant_id: tenant_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const rental_id = data[i].rental_id;
      const unit_id = data[i].unit_id;

      // Fetch property information
      const workorder_data = await WorkOrder.findOne({
        rental_id: rental_id,
        unit_id: unit_id,
      });
      const unit_data = await Unit.findOne({
        unit_id: unit_id,
      });
      const rental_data = await Rentals.findOne({
        rental_id: rental_id,
      });

      // Attach client and property information to the data item
      data[i].workorder_data = workorder_data;
      data[i].unit_data = unit_data;
      data[i].rental_data = rental_data;
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

router.get("/workorder_details/:workOrder_id", async (req, res) => {
  try {
    const workOrder_id = req.params.workOrder_id;

    var data = await WorkOrder.aggregate([
      {
        $match: { workOrder_id: workOrder_id }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const unit_id = data[i].unit_id;
      const rental_id = data[i].rental_id;
      const tenant_id = data[i].tenant_id;
      const vendor_id = data[i].vendor_id;

      // Fetch property information
      const unit_data = await Unit.findOne({
        unit_id: unit_id,
      });
      const property_data = await Rentals.findOne({
        rental_id: rental_id,
      });

      const tenant_data = await Tenant.findOne({
        tenant_id: tenant_id,
      });

      const vendor_data = await Tenant.findOne({
        vendor_id: vendor_id,
      });

      const partsandcharge_data = await Parts.find({
        workOrder_id: workOrder_id,
      });

      // Attach client and property information to the data item
      data[i].unit_data = unit_data;
      data[i].property_data = property_data;
      data[i].tenant_data = tenant_data;
      data[i].vendor_data = vendor_data;
      data[i].partsandcharge_data = partsandcharge_data;
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

module.exports = router;
