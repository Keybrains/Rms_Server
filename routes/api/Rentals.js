var express = require("express");
var router = express.Router();
var Rentals = require("../../modals/Rentals");
var Tenants = require("../../modals/Tenants");
var PropertyUnit = require("../../modals/PropertyUnit");
var moment = require("moment");
// var {verifyToken} = require("../authentication");

// Post api working
// router.post("/rentals", async (req, res) => {
//   try {

//     var data = await Rentals.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Rentals Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

//updated for exixting rental owener and store in array
// router.post("/rentals", async (req, res) => {
//   try {
//     // Generate a unique rental_id
//     var count = await Rentals.countDocuments();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["rental_id"] = pad(count + 1);

//     const {
//       rentalOwner_firstName,
//       rentalOwner_lastName,
//       rentalOwner_primaryEmail,
//       rentalOwner_companyName,
//       rentalOwner_homeNumber,
//       rentalOwner_phoneNumber,
//       rentalOwner_businessNumber,
//       entries,
//     } = req.body;

//     entries.forEach((entry, index) => {
//       entry.entryIndex = (index + 1).toString().padStart(2, "0");
//     });

//     // Create the rental entry
//     const data = await Rentals.create({
//       rentalOwner_firstName,
//       rentalOwner_lastName,
//       rentalOwner_primaryEmail,
//       rentalOwner_companyName,
//       rentalOwner_homeNumber,
//       rentalOwner_phoneNumber,
//       rentalOwner_businessNumber,
//       entries,
//     });

//     data.entries = entries;

//     // Remove the _id fields from the entries
//     const responseData = { ...data.toObject() };
//     responseData.entries = responseData.entries.map((entryItem) => {
//       delete entryItem._id;
//       return entryItem;
//     });

//     res.json({
//       statusCode: 200,
//       data: responseData,
//       message: "Add Rentals Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

//updated by mansi with unique rental_adress condition
router.post("/rentals", async (req, res) => {
  try {
    const {
      rentalOwner_firstName,
      rentalOwner_lastName,
      rentalOwner_companyName,
      rentalOwner_primaryEmail,
      rentalOwner_phoneNumber,
      rentalOwner_homeNumber,
      rentalOwner_businessNumber,
      entries,
    } = req.body;

    // Try to find the existing rental record
    let existingRental = await Rentals.findOne({
      rentalOwner_firstName,
      rentalOwner_lastName,
      rentalOwner_companyName,
      rentalOwner_primaryEmail,
      rentalOwner_phoneNumber,
      rentalOwner_homeNumber,
      rentalOwner_businessNumber,
    });

    if (!existingRental) {
      // If the record is not found, create a new one
      existingRental = await Rentals.create({
        rentalOwner_firstName,
        rentalOwner_lastName,
        rentalOwner_companyName,
        rentalOwner_primaryEmail,
        rentalOwner_phoneNumber,
        rentalOwner_homeNumber,
        rentalOwner_businessNumber,
        entries: [],
      });
    }

    // Process entries and check for unique rental_adress within the same rental
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const entry = entries[entryIndex];
      const {
        property_type,
        rental_adress,
        isrenton,
        rental_city,
        rental_country,
        rental_state,
        rental_postcode,
        staffMember,
        commercial,
        residential,
        type,
      } = entry;

      // Check if the rental_adress already exists within the same rental
      // const existingAddressInRental = existingRental.entries.find(
      //   e => e.rental_adress === rental_adress
      // );

      // console.log(existingAddressInRental, "----------");

      // if (existingAddressInRental) {
      //   return res.status(400).json({
      //     statusCode: 400,
      //     message: `Entry with rental_adress '${rental_adress}' already exists within the same rental.`
      //   });
      // }

      let existingRentals = await Rentals.findOne({
        "entries.rental_adress": rental_adress,
      });

      // Check if the rental_adress already exists in any rental
      if (existingRentals) {
        return res.status(201).json({
          statusCode: 201,
          message: `Entry with rental_adress '${rental_adress}' already exists in the system.`,
        });
      }

      // If the address does not exist, push the new entry
      const newEntry = {
        property_type,
        rental_adress,
        isrenton,
        rental_city,
        rental_country,
        rental_state,
        rental_postcode,
        staffMember,
        type,
        entryIndex: (existingRental.entries.length + 1)
          .toString()
          .padStart(2, "0"),
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      existingRental.entries.push(newEntry);

      // Save the updated or newly created rental to get the _id of the new entry
      await existingRental.save();

      // Get the _id of the new entry
      const newEntryId =
        existingRental.entries[existingRental.entries.length - 1]._id;

      // Process commercial or residential entries and create PropertyUnits
      const unitDataArray = commercial || residential || [];

      if (Array.isArray(unitDataArray)) {
        for (const unitData of unitDataArray) {
          const propertyUnitData = {
            rental_adress,
            rental_city,
            rental_country,
            rental_state,
            rental_postcode,
            rentalId: existingRental._id,
            description: "",
            type,
            market_rent: isrenton ? unitData.rental_soft : entry.rentalcom_soft,
            rental_bed: unitData.rental_bed,
            rental_bath: unitData.rental_bath,
            propertyres_image: unitData.propertyres_image,
            rental_sqft: unitData.rental_sqft || unitData.rentalcom_sqft,
            rental_units: unitData.rental_units || unitData.rentalcom_units,
            rental_unitsAdress:
              unitData.rental_unitsAdress || unitData.rentalcom_unitsAdress,
            property_image: unitData.property_image,
            propertyId: newEntryId, // Assigning the _id of the new entry to propertyId
          };

          const propertyUnit = await PropertyUnit.create(propertyUnitData);
        }
      }
    }

    res.status(200).json({
      statusCode: 200,
      data: {
        rental_id: existingRental._id.toString(),
      },
      message: "Add Rentals Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/rentals", async (req, res) => {
  try {
    var data = await Rentals.find();
    data.reverse();
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/existing/rentals", async (req, res) => {
  try {
    const uniqueRecords = await Rentals.aggregate([
      {
        $group: {
          _id: {
            firstName: "$rentalOwner_firstName",
            lastName: "$rentalOwner_lastName",
            phoneNumber: "$rentalOwner_phoneNumber",
          },
          record: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$record" },
      },
    ]);

    res.json({
      data: uniqueRecords,
      statusCode: 200,
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/rental", async (req, res) => {
  try {
    var rentalsWithData = await Rentals.find({
      entries: { $not: { $size: 0 } },
    });

    const data = rentalsWithData
      .map((tenant) => {
        return tenant.entries.map((entry) => {
          return {
            _id: tenant._id,
            rentalOwner_firstName: tenant.rentalOwner_firstName,
            rentalOwner_lastName: tenant.rentalOwner_lastName,
            rentalOwner_companyName: tenant.rentalOwner_companyName,
            rentalOwner_primaryEmail: tenant.rentalOwner_primaryEmail,
            rentalOwner_phoneNumber: tenant.rentalOwner_phoneNumber,
            rentalOwner_homeNumber: tenant.rentalOwner_homeNumber,
            rentalOwner_businessNumber: tenant.rentalOwner_businessNumber,

            entries: {
              entryIndex: entry.entryIndex,
              rental_adress: entry.rental_adress,
              property_type: entry.property_type,
              type: entry.type,
              isrenton: entry.isrenton,
              rental_city: entry.rental_city,
              rental_country: entry.rental_country,
              rental_postcode: entry.rental_postcode,
              rentalOwner_operatingAccount: entry.rentalOwner_operatingAccount,
              rentalOwner_propertyReserve: entry.rentalOwner_propertyReserve,
              staffMember: entry.staffMember,
              rental_bed: entry.rental_bed,
              rental_bath: entry.rental_bath,
              propertyres_image: entry.propertyres_image,
              rental_soft: entry.rental_soft,
              rental_units: entry.rental_units,
              rental_unitsAdress: entry.rental_unitsAdress,
              rentalcom_soft: entry.rentalcom_soft,
              rentalcom_units: entry.rentalcom_units,
              rentalcom_unitsAdress: entry.rentalcom_unitsAdress,
              property_image: entry.property_image,
              entry_id: entry._id,
              createdAt: entry.createdAt,
              updateAt: entry.updateAt,
            },
          };
        });
      })
      .flat();

    data.reverse();
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/rentals", async (req, res) => {
  try {
    const propIdsToDelete = req.body;

    console.log("propIdsToDelete from body", propIdsToDelete);

    // Get the names of the staff members to be deleted
    const propertyToDelete = await Rentals.find({
      _id: { $in: propIdsToDelete },
    }).select("rental_adress");
    console.log("propertyToDelete after variable", propertyToDelete);

    const propNamesToDelete = propertyToDelete.map(
      (staff) => staff.rental_adress
    );

    const assignedProperty = await Tenants.find({
      rental_adress: { $in: propNamesToDelete },
    });

    if (assignedProperty.length > 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "Property is already assigned. Deletion not allowed.",
      });
    }

    const result = await Rentals.deleteMany({
      _id: { $in: propIdsToDelete },
    });

    res.json({
      statusCode: 200,
      data: result,
      message: "Rentals Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// delete recored entry wise new updated
router.delete("/rental/:rentalId/entry/:entryIndex", async (req, res) => {
  try {
    const rentalId = req.params.rentalId;
    const entryIndex = req.params.entryIndex;

    console.log("Received request to delete entry:", rentalId, entryIndex);

    const rentals = await Rentals.find();
    const rental = rentals.find((t) => t._id.toString() === rentalId);

    if (!rental || !rental.entries) {
      return res.status(404).json({
        statusCode: 404,
        message: "Rental not found or has no entries",
      });
    }

    const entryIndexToDelete = rental.entries.findIndex(
      (e) => e.entryIndex === entryIndex
    );

    if (entryIndexToDelete === -1) {
      res.status(404).json({
        statusCode: 404,
        message: "Entry not found",
      });
      return;
    }

    const propNamesToDelete = rental.entries[entryIndexToDelete].rental_adress;

    console.log("propNamesToDelete:", propNamesToDelete);

    const assignedProperty = await Tenants.find({
      "entries.rental_adress": { $in: propNamesToDelete },
    });
    console.log(assignedProperty, "xyz");

    if (assignedProperty.length > 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "Property Type is already assigned. Deletion not allowed.",
      });
    }

    // Remove the entry from the entries array
    rental.entries.splice(entryIndexToDelete, 1);

    // Save the updated rental data
    await rental.save();

    res.status(200).json({
      statusCode: 200,
      message: "Entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//edit rentals
router.put("/rentals/:id", async (req, res) => {
  try {
    let result = await Rentals.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Rentals Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//put api add new entry in existing rentalowner
router.put("/rental/:id", async (req, res) => {
  try {
    const rentalId = req.params.id;
    const updateData = req.body;
    const rentals = await Rentals.findById(rentalId);

    if (!rentals) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Rental not found" });
    }

    if (updateData.entries && Array.isArray(updateData.entries)) {
      // Find the last entry in the existing entries
      const lastEntry =
        rentals.entries.length > 0
          ? rentals.entries[rentals.entries.length - 1]
          : null;
      let nextEntryIndex = lastEntry
        ? (parseInt(lastEntry.entryIndex) + 1).toString().padStart(2, "0")
        : "01";

      // Loop through the entries and set entryIndex
      updateData.entries.forEach((entry) => {
        entry.entryIndex = nextEntryIndex;
        nextEntryIndex = (parseInt(nextEntryIndex) + 1)
          .toString()
          .padStart(2, "0");
      });

      rentals.entries.push(...updateData.entries);
    }

    // Update the main rentals data and entries array
    const result = await rentals.save();

    res.json({
      statusCode: 200,
      data: result,
      message: "Rental Data Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//get listings
router.get("/listings", async (req, res) => {
  try {
    var data = await Rentals.find();
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All listings",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get rentalproperty and rental owners
router.get("/rentalproperty", async (req, res) => {
  try {
    // Use the .find() method to retrieve data and select specific fields
    const propertyData = await Rentals.find({}, "rental_adress");
    const ownerData = await Rentals.find(
      {},
      "rentalOwner_firstName rentalOwner_lastName"
    );

    res.json({
      statusCode: 200,
      data: {
        "Rental property": propertyData,
        "Rental owners": ownerData,
      },
      message: "Read Rental Address and Rental Owner Names",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get rentals table  summary data id wis
router.get("/rentals_summary/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL parameter
    var data = await Rentals.findById(userId);
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: "summaryGet Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "summary not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//fillter api property_type wise
router.post("/filterproperty_type", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.rental_adress) {
      // Corrected from req.body.rentals
      pipeline.push({
        $match: { rental_adress: req.body.rental_adress },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await Rentals.aggregate(pipeline);
    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };
    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//fillter api  rentalproperty and rental owners
router.post("/filterproperty/owners", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.rental_adress) {
      // Corrected from req.body.rentals
      pipeline.push({
        $match: { rental_adress: req.body.rental_adress },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await Rentals.aggregate(pipeline);
    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };
    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/property", async (req, res) => {
  try {
    const data = await Rentals.find(
      { "entries.isrenton": false },
      "entries.rental_adress"
    );

    if (data.length > 0) {
      const rentalAddresses = data.map(
        (entry) => entry.entries[0].rental_adress
      );
      res.json({
        statusCode: 200,
        data: rentalAddresses,
        message: "Read all rental addresses",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "No rental addresses found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//find rental_address(proparty in lease form)
router.get("/property_onrent", async (req, res) => {
  try {
    const data = await Rentals.find(
      { "entries.isrenton": true },
      "entries.rental_adress"
    );

    if (data.length > 0) {
      const rentalAddresses = data.map(
        (entry) => entry.entries[0].rental_adress
      );
      res.json({
        statusCode: 200,
        data: rentalAddresses,
        message: "Read all rental addresses",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "No rental addresses found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// find all rental_address
router.get("/rental_allproperty", async (req, res) => {
  try {
    var data = await Rentals.find().select("rental_adress");

    res.json({
      statusCode: 200,
      data: data,
      message: "read all property",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/allproperty", async (req, res) => {
  try {
    const data = await Rentals.find(
      {},
      "entries.rental_adress rentalOwner_firstName rentalOwner_lastName rentalOwner_companyName rentalOwner_primaryEmail rentalOwner_phoneNumber rentalOwner_homeNumber rentalOwner_businessNumber"
    );
    // console.log(data, "data");

    const rentalAddresses = data.reduce((addresses, rental) => {
      if (rental.entries && rental.entries.length > 0) {
        rental.entries.forEach((entry) => {
          if (entry.rental_adress) {
            addresses.push({
              _id: rental._id,
              rental_adress: entry.rental_adress,
              rentalOwner_firstName: rental.rentalOwner_firstName,
              rentalOwner_lastName: rental.rentalOwner_lastName,
              rentalOwner_companyName: rental.rentalOwner_companyName,
              rentalOwner_primaryEmail: rental.rentalOwner_primaryEmail,
              rentalOwner_phoneNumber: rental.rentalOwner_phoneNumber,
              rentalOwner_homeNumber: rental.rentalOwner_homeNumber,
              rentalOwner_businessNumber: rental.rentalOwner_businessNumber,
            });
          }
        });
      }
      return addresses;
    }, []);

    res.json({
      statusCode: 200,
      data: rentalAddresses,
      message: "Read all rental addresses",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//fillter api rentel_address wise in outstanding balance in lease
router.post("/filter_lease", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.rental_adress) {
      // Corrected from req.body.rentals
      pipeline.push({
        $match: { rental_adress: req.body.rental_adress },
      });
    }
    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });
    let result = await Rentals.aggregate(pipeline);
    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };
    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//search properties table data like rental_address etc
router.post("/search_Properties", async (req, res) => {
  try {
    let newArray = [];
    newArray.push(
      {
        rental_adress: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        rentalOwner_firstName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        rentalOwner_lastName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        rentalOwner_companyName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        property_type: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      }
    );
    var data = await Rentals.find({
      $or: newArray,
    });

    // Calculate the count of the searched data
    const dataCount = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: dataCount, // Include the count in the response
      message: "Read All Rentals",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/rental/:id/entry/:entryIndex", async (req, res) => {
  try {
    const id = req.params.id;
    const entryIndex = req.params.entryIndex;
    const updatedEntryData = req.body.entries[0];
    const updatedData = {
      rentalOwner_firstName: req.body.rentalOwner_firstName,
      rentalOwner_lastName: req.body.rentalOwner_lastName,
      rentalOwner_companyName: req.body.rentalOwner_companyName,
      rentalOwner_primaryEmail: req.body.rentalOwner_primaryEmail,
      rentalOwner_phoneNumber: req.body.rentalOwner_phoneNumber,
      rentalOwner_homeNumber: req.body.rentalOwner_homeNumber,
      rentalOwner_businessNumber: req.body.rentalOwner_businessNumber,
    };

    // Find the rental by ID
    const rental = await Rentals.findById(id);

    if (!rental) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Rental not found" });
    }

    const entryToUpdate = rental.entries.find(
      (entry) => entry.entryIndex === entryIndex
    );

    if (!entryToUpdate) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Entry not found" });
    }
    updatedEntryData["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    rental.set(updatedData);
    Object.assign(entryToUpdate, updatedEntryData);

    const result = await rental.save();

    res.json({
      statusCode: 200,
      data: result,
      message: "Entry Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/Rentals_summary/tenant/:rental_address", async (req, res) => {
  try {
    const address = req.params.rental_address;
    const data = await Rentals.find({ "entries.rental_adress": address });

    if (data && data.length > 0) {
      res.json({
        data: data,
        statusCode: 200,
        message: "Summary data retrieved successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Summary data not found for the provided address",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/proparty_image/:id/:entryId", async (req, res) => {
  try {
    const { id: mainId, entryId } = req.params;
    console.log(req.params, "=========================");
    const { prop_image } = req.body;

    // Update only the prop_image field in the specified entry
    let result = await Rentals.updateOne(
      { _id: mainId, "entries._id": entryId },
      { $set: { "entries.$.prop_image": prop_image } }
    );

    console.log(result); // Log the result to inspect the response

    if (result.modifiedCount === 1) {
      res.json({
        statusCode: 200,
        data: result,
        message: "Property Image Added Successfully",
      });
    } else {
      res.json({
        statusCode: 404,
        message: "No document or entry matched the update criteria.",
      });
    }
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
