var express = require("express");
var router = express.Router();
var Applicant = require("../../../modals/superadmin/Applicant");
var Leasing = require("../../../modals/superadmin/Applicant_property");
var Unit = require("../../../modals/superadmin/Unit");
var Admin = require("../../../modals/superadmin/Admin_Register");
var moment = require("moment");
const Rentals = require("../../../modals/superadmin/Rentals");
var emailService = require("./emailService");
const ApplicantDetails = require("../../../modals/superadmin/ApplicantDetails");

router.post("/applicant", async (req, res) => {
  try {
    const existingApplicant = await Applicant.findOne({
      admin_id: req.body.applicant.admin_id,
      applicant_id: req.body.applicant.applicant_id,
    });
    if (!existingApplicant) {
      let findPlanName = await Applicant.findOne({
        admin_id: req.body.applicant.admin_id,
        applicant_phoneNumber: req.body.applicant.applicant_phoneNumber,
      });
      if (!findPlanName) {
        const timestamp = Date.now();
        const uniqueId = `${timestamp}`;
        req.body.applicant["applicant_id"] = uniqueId;

        req.body.applicant["createdAt"] = moment().format(
          "YYYY-MM-DD HH:mm:ss"
        );
        req.body.applicant["updatedAt"] = moment().format(
          "YYYY-MM-DD HH:mm:ss"
        );
        var data = await Applicant.create(req.body.applicant);

        const leasetimestamp = Date.now();
        const uniqueIdForLease = `${leasetimestamp}`;
        req.body.lease["lease_id"] = uniqueIdForLease;
        req.body.lease["applicant_id"] = data.applicant_id;
        req.body.lease["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
        req.body.lease["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

        var leaseData = await Leasing.create(req.body.lease);

        res.json({
          statusCode: 200,
          data: { data, leaseData },
          message: "Add Applicant Successfully",
        });
      } else {
        res.json({
          statusCode: 500,
          message: `${req.body.applicant.applicant_phoneNumber} Number Already Added`,
        });
      }
    } else {
      var data = existingApplicant;
      const leasetimestamp = Date.now();
      const uniqueIdForLease = `${leasetimestamp}`;
      req.body.lease["lease_id"] = uniqueIdForLease;
      req.body.lease["applicant_id"] = data.applicant_id;
      req.body.lease["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
      req.body.lease["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

      var leaseData = await Leasing.create(req.body.lease);

      res.json({
        statusCode: 200,
        data: { data, leaseData },
        message: "Add Applicant Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/applicant/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Applicant.aggregate([
      {
        $match: { admin_id: admin_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/applicant_lease/:admin_id", async (req, res) => {
  try {
    const admin_id = req.params.admin_id;

    var data = await Applicant.aggregate([
      {
        $match: { admin_id: admin_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    console.log(data);
    //   // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const applicant_id = data[i].applicant_id;

      // Fetch property information
      console.log(applicant_id);
      const lease_data = await Leasing.findOne({ applicant_id: applicant_id });
      console.log(lease_data);
      const rental_data = await Rentals.findOne({
        rental_id: lease_data.rental_id,
      });
      const unit_data = await Unit.findOne({ unit_id: lease_data.unit_id });

      // Attach client and property information to the data item
      data[i].lease_data = lease_data;
      data[i].rental_data = rental_data;
      data[i].unit_data = unit_data;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/applicant/:id", async (req, res) => {
  try {
    req.body["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    let result = await Applicant.findOneAndUpdate(
      { applicant_id: req.params.id },
      req.body
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "applicant Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/applicant_summary/:applicant_id", async (req, res) => {
  try {
    const applicant_id = req.params.applicant_id;

    var data = await Applicant.aggregate([
      {
        $match: { applicant_id: applicant_id },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Fetch client and property information for each item in data
    for (let i = 0; i < data.length; i++) {
      const applicant_id = data[i].applicant_id;

      // Fetch property information
      const lease_data = await Leasing.findOne({ applicant_id: applicant_id });

      const rental_adress_data = await Rentals.findOne({
        rental_id: lease_data.rental_id,
      });

      const rental_unit_data = await Unit.findOne({
        unit_id: lease_data.unit_id,
      });

      // Flatten lease_data structure
      const flattenedLeaseData = {
        ...lease_data.toObject(), // Convert Mongoose document to plain JavaScript object
        rental_adress: rental_adress_data.rental_adress,
        rental_unit: rental_unit_data.rental_unit,
      };

      // Attach client and property information to the data item
      data[i].lease_data = flattenedLeaseData;
    }

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/applicant/:id/status", async (req, res) => {
  try {
    const applicantId = req.params.id;
    const newStatus = req.body.status;
    const statusUpdatedBy = req.body.statusUpdatedBy;

    if (!applicantId || !newStatus) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid request. Please provide 'status'.",
      });
    }

    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const updatedApplicant = await Applicant.findOneAndUpdate(
      { applicant_id: applicantId },
      {
        $push: {
          applicant_status: {
            statusUpdatedBy: statusUpdatedBy,
            status: newStatus,
            updateAt: updatedAt,
          },
        },
      },
      { new: true }
    );

    if (!updatedApplicant) {
      return res.status(404).json({
        statusCode: 404,
        message: "Applicant not found.",
      });
    }

    if (newStatus === "Approved") {
      const { rental_id, unit_id } = req.body;
      const leases = await Leasing.find({ rental_id, unit_id });

      for (const lease of leases) {
        const lease_id = lease.lease_id;
        await Applicant.updateOne(
          {
            lease_id,
            applicant_id: { $ne: applicantId },
            "applicant_status.status": { $ne: "Approved" },
          },
          {
            $push: {
              applicant_status: {
                statusUpdatedBy: "Admin",
                status: "Rejected",
                updateAt: updatedAt,
              },
            },
          }
        );
      }
    }

    res.json({
      statusCode: 200,
      data: updatedApplicant,
      message: "Applicant Status Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/applicant_get", async (req, res) => {
  try {
    // Extract tenant_mobileNumber and status from query parameters
    const { applicant_phoneNumber, status } = req.query;

    // Build a filter object based on provided parameters
    const filter = {};
    if (applicant_phoneNumber) {
      filter.applicant_phoneNumber = applicant_phoneNumber;
    }

    // If status is provided, use aggregation to filter array elements
    if (status) {
      filter.applicant_status = {
        $elemMatch: {
          status: status,
        },
      };
    }

    // Use the filter object in the MongoDB query
    var data = await Applicant.find(filter);

    // Process the data to include only matching elements in the response
    const filteredData = data.map((document) => {
      // Reverse the order of the applicant_status array for each document
      document.applicant_status.reverse();

      // Check if the status of the first object matches the provided status
      if (
        document.applicant_status.length > 0 &&
        document.applicant_status[0].status === status
      ) {
        return {
          ...document.toObject(), // Convert Mongoose document to plain object
          applicant_status: document.applicant_status,
        };
      } else {
        return null; // Exclude documents without matching status
      }
    });

    // Remove null entries from the filteredData array
    const finalData = filteredData.filter((entry) => entry !== null);

    res.json({
      data: finalData,
      statusCode: 200,
      message: "Read All applicants",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/applicant/:applicant_id/checklist", async (req, res) => {
  try {
    const applicant_id = req.params.applicant_id;
    const checklist = req.body.applicant_checklist;

    if (!applicant_id || !checklist || !Array.isArray(checklist)) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Invalid request. Please provide a valid 'applicant_checklist' array.",
      });
    }

    const applicant = await Applicant.findOneAndUpdate(
      { applicant_id: applicant_id }, // Ensure you search by _id field
      { applicant_checklist: checklist },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({
        statusCode: 404,
        message: "Applicant not found.",
      });
    }

    res.json({
      updatedApplicant: applicant,
      statusCode: 200,
      message: "Applicant checklist updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/applicant/:applicant_id/checked-checklist", async (req, res) => {
  try {
    const applicant_id = req.params.applicant_id;
    const checkedChecklist = req.body.applicant_checkedChecklist;

    if (!applicant_id || !checkedChecklist) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Invalid request. Please provide 'applicant_checkedChecklist'.",
      });
    }

    const applicant = await Applicant.findOneAndUpdate(
      applicant_id,
      { applicant_checkedChecklist: checkedChecklist },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({
        statusCode: 404,
        message: "Applicant not found.",
      });
    }

    res.json({
      updatedApplicant: applicant,
      statusCode: 200,
      message: "Checked checklist updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/applicant/note_attachment/:applicant_id", async (req, res) => {
  try {
    const applicantId = req.params.applicant_id;

    const { applicant_notes, applicant_file } = req.body;

    if (!applicant_notes && !applicant_file) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Invalid request. Please provide 'applicant_notes' and/or 'applicant_file'.",
      });
    }

    const updateFields = {};
    if (applicant_notes || applicant_file) {
      const newNoteAndFile = { applicant_notes, applicant_file };
      updateFields.$push = { applicant_NotesAndFile: newNoteAndFile };
    }

    const updatedApplicant = await Applicant.findOneAndUpdate(
      { applicant_id: applicantId }, // Corrected: Wrapping applicantId in filter object
      updateFields,
      { new: true }
    );

    if (!updatedApplicant) {
      return res.status(404).json({
        statusCode: 404,
        message: "Applicant not found.",
      });
    }

    res.json({
      statusCode: 200,
      data: updatedApplicant,
      message: "Applicant Notes and/or Attachment Updated Successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete(
  "/applicant/note_attachment/:applicant_id/:noteAndFileId",
  async (req, res) => {
    try {
      const { applicant_id, noteAndFileId } = req.params;

      const updatedApplicant = await Applicant.findOneAndUpdate(
        { applicant_id: applicant_id },
        { $pull: { applicant_NotesAndFile: { _id: noteAndFileId } } },
        { new: true }
      );

      if (!updatedApplicant) {
        return res.status(404).json({
          statusCode: 404,
          message: "Applicant not found.",
        });
      }

      res.json({
        statusCode: 200,
        data: updatedApplicant,
        message: "Note and File Deleted Successfully",
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }
);

router.get("/applicant/mail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch data from the Applicant database using the provided id
    const applicantData = await Applicant.findOne({ applicant_id: id });
    if (!applicantData) {
      return res.json({
        statusCode: 404,
        message: "Applicant not found",
      });
    }

    const admin = await Admin.findOne({ admin_id: applicantData.admin_id });
    const lease = await Leasing.findOne({ applicant_id: id });
    const rental = await Rentals.findOne({ rental_id: lease.rental_id });
    const unit = await Unit.findOne({ unit_id: lease.unit_id });
    const { applicant_email, applicant_firstName, applicant_lastName } =
      applicantData;

    // Update the document with the current date
    applicantData.applicant_emailsend_date = moment()
      .add(1, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    await applicantData.save();

    const applicationURL = `https://propertymanager.cloudpress.host/KeyBrainTech/applicant-form/1709220636248`;

    const htmlContent = `
      <p>You're invited to apply!</p>
      <p>Hi ${applicant_firstName} ${applicant_lastName},</p>
      <p>Thanks for your interest in Garden Row (multi-building complex) - 2D! Click below to get started.</p>
      <a href="${applicationURL}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Start Application</a>
    `;

    const info = await emailService.sendWelcomeEmail(
      applicant_email,
      `${rental.rental_adress} - ${unit.rental_unit}`,
      htmlContent
    );

    res.json({
      statusCode: 200,
      data: applicantData,
      message: "Mail Sent Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/status_data/:id/:status", async (req, res) => {
  try {
    const { id, status } = req.params;

    const applicantData = await Applicant.aggregate([
      {
        $match: {
          applicant_id: id,
        },
      },
      {
        $project: {
          applicant_id: 1,
          lastStatus: { $arrayElemAt: ["$applicant_status", -1] },
        },
      },
      {
        $match: {
          "lastStatus.status": { $ne: "Approved" },
          "lastStatus.status": status,
        },
      },
    ]);

    const lease_data = [];
    for (const data of applicantData) {
      const applicant_id = data.applicant_id;
      const lease = await Leasing.findOne({ applicant_id });
      const rental = await Rentals.findOne({ rental_id: lease.rental_id });
      const unit = await Unit.findOne({ unit_id: lease.unit_id });
      lease_data.push({
        ...lease.toObject(),
        rental_adress: rental.rental_adress,
        rental_unit: unit.rental_unit,
      });
    }
    console.log(lease_data);
    res.json({
      statusCode: 200,
      data: lease_data,
      message: "Mail Sent Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/applicant_details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const applicantDetails = await ApplicantDetails.findOne({
      applicant_id: id,
    });

    const applicantData = await Applicant.findOne({
      applicant_id: id,
    });

    const data = {
      ...applicantDetails.toObject(),
      applicant_firstName: applicantData.applicant_firstName,
      applicant_lastName: applicantData.applicant_lastName,
      applicant_email: applicantData.applicant_email,
      applicant_phoneNumber: applicantData.applicant_phoneNumber,
    };

    res.json({
      statusCode: 200,
      data: data[0],
      message: "Mail Sent Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Applicant.findOne({ applicant_id: id });
    if (!applicant) {
      res.json({
        statusCode: 201,
        message: "Applicant not found",
      });
    }
    const applicantDetails = await ApplicantDetails.create(req.body);

    console.log(applicantDetails);
    res.json({
      statusCode: 200,
      data: applicantDetails,
      message: "Add Applicant Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
