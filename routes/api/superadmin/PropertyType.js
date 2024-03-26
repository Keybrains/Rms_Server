var express = require("express");
var router = express.Router();
var AdminRegister = require("../../../modals/superadmin/Admin_Register");
var PropertyType = require("../../../modals/superadmin/PropertyType");
const moment = require("moment");
const Rentals = require("../../../modals/superadmin/Rentals");
const Plans_Purchased = require("../../../modals/superadmin/Plans_Purchased");
const Plans = require("../../../modals/superadmin/Plans");

// ==================== Admin =====================================================

//Post new property type for admin
router.post("/property_type", async (req, res) => {
  try {
    let findPropertyNameName = await PropertyType.findOne({
      property_type: req.body.property_type,
      propertysub_type: req.body.propertysub_type,
      admin_id: req.body.admin_id,
      is_delete: false,
    });
    if (!findPropertyNameName) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      req.body["property_id"] = uniqueId;
      req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      var data = await PropertyType.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add PropertyType Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.propertysub_type} Name Already Added`,
      });
    }
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
        { property_type: { $regex: new RegExp(searchValue, "i") } },
        { propertysub_type: { $regex: new RegExp(searchValue, "i") } },
      ];
    }

    const data = await PropertyType.find(query);

    const promises = data.map((propertyType) => {
      return AdminRegister.findOne({ admin_id: propertyType.admin_id });
    });

    const adminDataArray = await Promise.all(promises);

    const updatedData = data.map((propertyType, index) => {
      return {
        ...propertyType._doc,
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

//get all property type for Super-Admin
router.get("/property_type/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    const planPur = await Plans_Purchased.findOne({
      admin_id,
      is_active: true,
    });

    let plan = null;
    if (planPur) {
      const plan = await Plans.findOne({ plan_id: planPur.plan_id });
    }
    var data = [];
    if (!plan || plan.plan_name === "Free Plan") {
      const data1 = await PropertyType.find({
        admin_id: admin_id,
        is_delete: false,
      });

      const data2 = await PropertyType.find({
        admin_id: "is_trial",
        is_delete: false,
      });

      data.push(...data1, ...data2);
    } else {
      const data1 = await PropertyType.find({
        admin_id: admin_id,
        is_delete: false,
      });

      data.push(...data1);
    }

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const admin_id = data[i].admin_id;

      // Fetch property information
      const admin = await AdminRegister.findOne({ admin_id: admin_id });

      // Attach client and property information to the data item
      data[i].admin = admin;
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

//delete property type for Admin (data not delete in Database, only change is_delete Boolean)
router.delete("/property_type/:property_id", async (req, res) => {
  const property_id = req.params.property_id;
  try {
    const existingTenant = await Rentals.findOne({
      property_id: property_id,
      is_delete: false,
    });
    if (existingTenant) {
      return res.status(201).json({
        statusCode: 201,
        message: `Cannot delete Property-Type. The Property-Type is already assigned to a lease.`,
      });
    } else {
      const result = await PropertyType.updateOne(
        { property_id: property_id },
        { $set: { is_delete: true } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          statusCode: 404,
          message: "Property-Type not found",
        });
      }

      res.json({
        statusCode: 200,
        data: result,
        message: "Property-Type Deleted Successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//update property type for admin
router.put("/property_type/:property_id", async (req, res) => {
  try {
    const { property_id } = req.params;
    const { property_type, propertysub_type, admin_id, is_multiunit } =
      req.body;

    if (!admin_id) {
      res.status(401).json({
        statusCode: 401,
        message: "admin_id is required in the request body",
      });
      return;
    }

    // Check if the property_type and propertysub_type already exist for the specified admin_id
    const existingProperty = await PropertyType.findOne({
      admin_id,
      property_type,
      propertysub_type,
      is_multiunit,
    });

    if (existingProperty) {
      res.status(200).json({
        statusCode: 400,
        message: "Update Atleast one field.",
      });
      return; // Stop further execution
    }

    req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    // Update the property if it exists
    const result = await PropertyType.findOneAndUpdate(
      { property_id, admin_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        statusCode: 200,
        data: result,
        message: "PropertyType Updated Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "PropertyType not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//get perticuler property type for admin
router.get("/property/type/:property_id", async (req, res) => {
  try {
    const property_id = req.params.property_id;
    const data = await PropertyType.find({ property_id });

    if (data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No record found for the specified property_id",
      });
    }

    res.json({
      data: data,
      statusCode: 200,
      message: "Read PropertyType",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
