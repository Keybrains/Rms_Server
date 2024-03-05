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
const Notification = require("../../../modals/superadmin/Notification");
  
router.post("/work-order", async (req, res) => {
  try {
    const timestamp = Date.now();
    const workId = `${timestamp}`;
    req.body.workOrder["workOrder_id"] = workId;
    req.body.workOrder["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body.workOrder["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    var workOrder = await WorkOrder.create(req.body.workOrder);
    const parts = [];
    
    if (req.body.parts) {
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
    }

    const notificationTimestamp = Date.now();
    const notificationData = {
      notification_id: notificationTimestamp,
      admin_id: workOrder.admin_id,
      rental_id: workOrder.rental_id,
      unit_id: workOrder.unit_id,
      notification_title: "Workorder Created",
      notification_detail: "A new Workorder has been created and assinged",

      notification_type: {
        type: "Create Workorder",
        workorder_id: workOrder.workOrder_id,
      },

      // -----------
      tenant_id: workOrder.tenant_id ? workOrder.tenant_id : "",

      // -----------
      notification_read: workOrder.tenant_id
        ? {
            is_staffmember_read: false,
            is_tenant_read: false,
            is_vendor_read: false,
          }
        : {
            is_staffmember_read: false,
            is_vendor_read: false,
          },

      // ----------
      notification_send_to: workOrder.tenant_id
        ? [
            {
              tenant_id: workOrder.tenant_id,
              staffmember_id: workOrder.staffmember_id,
              vendor_id: workOrder.vendor_id,
            },
          ]
        : [
            {
              tenant_id: "",
              staffmember_id: workOrder.staffmember_id,
              vendor_id: workOrder.vendor_id,
            },
          ],
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      is_workorder: true,
    };
    const notification = await Notification.create(notificationData);

    res.json({
      statusCode: 200,
      data: { workOrder, parts, notification },
      message: "Add Work Order Successfully",
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

    const workOrderData = await WorkOrder.findOne({
      workOrder_id,
      is_delete: false,
    });

    if (!workOrderData) {
      res.status(201).json({
        statusCode: 201,
        message: "Work Order Not Found",
      });
    }
    const partsandcharge_data = await Parts.find({ workOrder_id });

    const property_data = await Rentals.findOne({
      rental_id: workOrderData.rental_id,
    });

    const unit_data = await Unit.findOne({
      unit_id: workOrderData.unit_id,
    });

    const staff_data = await StaffMember.findOne({
      staffmember_id: workOrderData.staffmember_id,
    });

    const vendor_data = await Vendor.findOne({
      vendor_id: workOrderData.vendor_id,
    });

    var tenant_data;
    if (workOrderData.tenant_id) {
      tenant_data = await Tenant.findOne({
        tenant_id: workOrderData.tenant_id,
      });
    }

    res.json({
      statusCode: 200,
      data: {
        ...workOrderData.toObject(),
        partsandcharge_data,
        property_data,
        unit_data,
        staff_data,
        vendor_data,
        tenant_data,
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

    const workOrdersData = await WorkOrder.find({
      admin_id,
      is_delete: false,
    }).sort({ createdAt: -1 });
    if (!workOrdersData || workOrdersData.length === 0) {
      return res.status(200).json({
        statusCode: 201,
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

// router.put("/work-order/:workOrder_id", async (req, res) => {
//   try {
//     const { workOrder_id } = req.params;

//     // Ensure that updatedAt field is set
//     req.body.workOrder["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
//     console.log(req.body);
//     const result = await WorkOrder.findOneAndUpdate(
//       { workOrder_id: workOrder_id },
//       { $set: req.body.workOrder },
//       { new: true }
//     );

//     const parts = [];

//     for (const part of req.body.parts) {
//       part["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
//       const partsData = await Parts.findOneAndUpdate(
//         { parts_id: part.parts_id },
//         { $set: part },
//         { new: true }
//       );
//       parts.push(partsData);
//     }

//     if (result) {
//       res.json({
//         statusCode: 200,
//         data: { result, parts },
//         message: "Work-Order updsted Successfully",
//       });
//     } else {
//       res.status(202).json({
//         statusCode: 202,
//         message: "Work-Order not found",
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

router.put("/work-order/:workOrder_id", async (req, res) => {
  try {
    const { workOrder_id } = req.params;
    const { status, date, staffmember_id, updated_by } = req.body.workOrder;

    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await WorkOrder.findOneAndUpdate(
      { workOrder_id: workOrder_id },
      {
        $set: {
          ...req.body.workOrder,
          updatedAt,
        },
        $push: {
          workorder_updates: {
            status,
            date,
            staffmember_id,
            updated_by,
            updatedAt,
          },
        },
      },
      { new: true }
    );

    const parts = [];

    for (const part of req.body.parts) {
      part["updatedAt"] = updatedAt;
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
        message: "Work-Order updated Successfully",
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
        $match: { vendor_id: vendor_id, is_delete: false }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    if (!data) {
      res.status(201).json({
        statusCode: 201,
        message: "No work orders found for the specified vendor.",
      });
    }

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
        $match: { staffmember_id: staffmember_id, is_delete: false }, // Filter by user_id
      },
      {
        $sort: { createdAt: -1 }, // Filter by user_id
      },
    ]);

    if (!data) {
      res.status(201).json({
        statusCode: 201,
        message: "No work orders found for the specified staff member.",
      });
    }

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

    const currentDate = new Date();

    const leases = await Lease.find({
      tenant_id,
      $expr: {
        $and: [
          { $lte: [{ $toDate: "$start_date" }, currentDate] },
          { $gte: [{ $toDate: "$end_date" }, currentDate] },
        ],
      },
    });

    const data = [];
    for (const lease of leases) {
      var work = await WorkOrder.find({
        rental_id: lease.rental_id,
        unit_id: lease.unit_id,
        is_delete: false,
      });
      data.push(...work);
    }
    if (!data) {
      res.status(201).json({
        statusCode: 201,
        message: "No work orders found for the specified tenant.",
      });
    }

    const return_data = [];

    // Fetch client and property information for each item in data
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      const rental_id = data[i].rental_id;
      const unit_id = data[i].unit_id;

      // Fetch property information
      const workorder_data = await WorkOrder.findOne({
        rental_id: rental_id,
        unit_id: unit_id,
      });

      const staffmember_data = await StaffMember.findOne({
        staffmember_id: workorder_data.staffmember_id,
      });
      if (workorder_data) {
        const unit_data = await Unit.findOne({
          unit_id: unit_id,
        });

        const rental_data = await Rentals.findOne({
          rental_id: rental_id,
        });

        return_data.push({
          workOrder_id: data[i].workOrder_id,
          work_subject: data[i].work_subject,
          work_category: data[i].work_category,
          priority: data[i].priority,
          status: data[i].status,
          createdAt: data[i].createdAt,
          updatedAt: data[i].updatedAt,
          rental_id: rental_data.rental_id,
          unit_id: unit_data.unit_id,
          rental_adress: rental_data.rental_adress,
          rental_unit: unit_data.rental_unit,
          staffmember_name: staffmember_data.staffmember_name,
        });
      }
    }

    const count = return_data.length;

    res.json({
      statusCode: 200,
      data: return_data,
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

router.get("/rental_workorder/:rental_id", async (req, res) => {
  try {
    const rental_id = req.params.rental_id;

    var data = await WorkOrder.aggregate([
      {
        $match: { rental_id: rental_id, is_delete: false },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (!data) {
      res.status(201).json({
        statusCode: 201,
        message: "No work orders found for the specified property.",
      });
    }

    for (const work of data) {
      const staffmember = await StaffMember.findOne({
        staffmember_id: work.staffmember_id,
      });
      work.staffmember_name = staffmember ? staffmember.staffmember_name : null;
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

router.delete("/delete_workorder/:workOrder_id", async (req, res) => {
  const workOrder_id = req.params.workOrder_id;
  console.log(workOrder_id, "workOrder_id");
  try {
    // Find the work order by workOrder_id
    const workOrder = await WorkOrder.findOne({ workOrder_id: workOrder_id });

    if (!workOrder) {
      return res.status(404).json({
        statusCode: 404,
        message: `Work Order not found. No action taken.`,
      });
    }

    // Check if the status of the work order is "New"
    if (workOrder.status === "New") {
      // Update is_delete field to true for WorkOrder
      const result = await WorkOrder.updateOne(
        { workOrder_id: workOrder_id },
        { $set: { is_delete: true } }
      );
      console.log(result, "result");

      if (result.modifiedCount === 1) {
        // Update is_delete field to true for related Parts
        await Parts.updateMany(
          { workOrder_id: workOrder_id },
          { $set: { is_delete: true } }
        );

        return res.status(200).json({
          statusCode: 200,
          message: `Work Order and related parts deleted successfully.`,
        });
      }
    } else {
      return res.status(203).json({
        statusCode: 203,
        message: `Work Order status is not 'New'. No action taken.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
