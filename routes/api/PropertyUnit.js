var express = require("express");
var router = express.Router();
var PropertyUnit = require("../../modals/PropertyUnit");
var Tenants = require("../../modals/Tenants")

router.post("/propertyunit", async (req, res) => {
  try {
    let findPropertyUnit = await PropertyUnit.findOne({
      rental_units: req.body.rental_units,
    });
    if (!findPropertyUnit) {
      var data = await PropertyUnit.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Property-Unit Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.rental_units} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/rentals_property/:rental_adress", async (req, res) => {
    try {
      const adress = req.params.rental_adress;
      console.log(adress, "adress")
      var data = await PropertyUnit.find({ rental_adress: adress }).select(
        "rental_units"
      );
      console.log(data, "data")
      if (data) {
        res.json({
          data: data,
          statusCode: 200,
          message: "Rental property details retrieved successfully",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "Rental property details not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

  
router.put("/propertyunit/:id", async (req, res) => {
    try {
      // Update the PropertyUnit
      let updatedPropertyUnit = await PropertyUnit.findByIdAndUpdate(req.params.id, req.body);
  
      // Update all PropertyUnits with the same rentalId
      await PropertyUnit.updateMany(
        { rentalId: updatedPropertyUnit.rentalId },
        {
          $set: {
            rental_adress: req.body.rental_adress || updatedPropertyUnit.rental_adress,
            rental_city: req.body.rental_city || updatedPropertyUnit.rental_city,
            rental_country: req.body.rental_country || updatedPropertyUnit.rental_country,
            rental_postcode: req.body.rental_postcode || updatedPropertyUnit.rental_postcode,
            // Add more fields as needed
          },
        }
      );
  
      // Update the corresponding entry in Rentals
      await Rentals.updateOne(
        {
          _id: updatedPropertyUnit.rentalId,
          'entries._id': updatedPropertyUnit._id,
        },
        {
          $set: {
            'entries.$.rental_adress': req.body.rental_adress || updatedPropertyUnit.rental_adress,
            'entries.$.rental_city': req.body.rental_city || updatedPropertyUnit.rental_city,
            'entries.$.rental_country': req.body.rental_country || updatedPropertyUnit.rental_country,
            'entries.$.rental_postcode': req.body.rental_postcode || updatedPropertyUnit.rental_postcode,
            // Add more fields as needed
          },
        }
      );
  
      res.json({
        statusCode: 200,
        data: updatedPropertyUnit,
        message: "Property-Unit Data Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });
  
  
  router.get("/rentals_property/:rental_adress", async (req, res) => {
    try {
      const adress = req.params.rental_adress;
      var data = await PropertyUnit.find({ rental_adress: adress }).select(
        "rental_units"
      );
      if (data) {
        res.json({
          data: data,
          statusCode: 200,
          message: "Rental property details retrieved successfully",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "Rental property details not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  });
  
  // router.get("/propertyunit", async (req, res) => {
  //   try {
  //     var data = await PropertyUnit.find({})
  //     res.json({
  //       data: data,
  //       statusCode: 200,
  //       message: "Read All PropertyUnit",
  //     });
  //   } catch (error) {
  //     res.json({
  //       statusCode: 500,
  //       message: error.message,
  //     });
  //   }
  // });
  
  // router.get("/propertyunit/:rentalId", async (req, res) => {
  //   try {
  //     const rentalId = req.params.rentalId;
  
  //     if (!rentalId) {
  //       res.json({
  //         statusCode: 400,
  //         message: " Data not found",
  //       });
  //     }
  //     var data = await PropertyUnit.find({ rentalId });
  //     res.json({
  //       data: data,
  //       statusCode: 200,
  //       message: "Read All PropertyUnit",
  //     });
  //   } catch (error) {
  //     res.json({
  //       statusCode: 500,
  //       message: error.message,
  //     });
  //   }
  // });


// Teneant Name Get
router.get("/propertyunit/:rentalId", async (req, res) => {
  try {
    const rentalId = req.params.rentalId;
    console.log(rentalId, "rentalId");

    if (!rentalId) {
      res.json({
        statusCode: 400,
        message: "Data not found",
      });
    }

    // Find PropertyUnit data
    const propertyUnitData = await PropertyUnit.find({ rentalId });

    // Initialize an array to store the final response data
    const responseData = [];

    // Iterate through each property unit
    for (const propertyUnit of propertyUnitData) {
      // Find Tenant data for the current property unit
      const tenantData = await Tenants.findOne({
        "entries.rental_adress": propertyUnit.rental_adress,
        "entries.rental_units": propertyUnit.rental_units,
      });

      // Extract relevant information from Tenant data
      const tenantInfo =
        tenantData && tenantData.tenant_firstName && tenantData.tenant_lastName
          ? {
              tenant_firstName: tenantData.tenant_firstName,
              tenant_lastName: tenantData.tenant_lastName,
            }
          : {
              tenant_firstName: null,
              tenant_lastName: null,
            };

      // Add tenant information to PropertyUnit response only for the matched unit
      const unitDataWithTenantInfo = {
        ...propertyUnit.toObject(),
        ...(tenantInfo ? tenantInfo : {}), // Add tenant info only if it's available
      };

      // Push the combined data to the response array
      responseData.push(unitDataWithTenantInfo);
    }

    res.json({
      data: responseData,
      statusCode: 200,
      message: "Read All PropertyUnit",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});
  // Delete Property-Unit
  router.delete("/propertyunit/:id", async (req, res) => {
    try {
      const propertyUnitId = req.params.id;
  
      // Use findByIdAndDelete to find and delete the property unit by ID
      const deletedData = await PropertyUnit.findByIdAndDelete(propertyUnitId);
  
      if (!deletedData) {
        return res.status(404).json({
          statusCode: 404,
          message: "Property Unit not found",
        });
      }
  
      res.json({
        data: deletedData,
        statusCode: 200,
        message: "Property Unit Deleted Successfully",
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  });

module.exports = router;
