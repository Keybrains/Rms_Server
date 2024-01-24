var express = require("express");
var router = express.Router();
var Applicant = require("../../modals/Applicants");
const nodemailer = require("nodemailer");
const { createTransport } = require("nodemailer");
const moment = require("moment")

//Add applicant
router.post("/applicant", async (req, res) => {
  try {
    const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const createdAt = moment().add(1, "seconds").format("YYYY-MM-DD HH:mm:ss");

    const existingTenant = await Applicant.findOne({
      tenant_mobileNumber: req.body.tenant_mobileNumber,
    });

    if (existingTenant) {
      return res.status(201).json({
        statusCode: 201,
        message: "Applicant with the same mobile number already exists",
      });
    }

    const { statusUpdatedBy, ...restOfReqBody } = req.body;

    const applicantData = {
      ...restOfReqBody,
      createAt: createdAt,
      applicant_status: [
        {
          statusUpdatedBy: statusUpdatedBy || "", // Use statusUpdatedBy from body or an empty string if not provided
          status: "New",
          updateAt: updatedAt,
        },
      ],
    };

    const data = await Applicant.create(applicantData);

    res.json({
      statusCode: 200,
      data: data,
      message: "Add Applicant Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// get  applicant
router.get("/applicant", async (req, res) => {
  try {
    var data = await Applicant.find();
    data.reverse();
    // Reverse the applicant_status array for each applicant
    data.forEach(applicant => {
      if (applicant.applicant_status) {
        applicant.applicant_status.reverse();
      }
    });

    res.json({
      data: data,
      statusCode: 200,
      message: "Read All applicant",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//appicants data get mobile number wise and stutus wise  like  approved

// router.get("/applicant_get", async (req, res) => {
//   try {
//     // Extract tenant_mobileNumber and status from query parameters
//     const { tenant_mobileNumber, status } = req.query;

//     // Build a filter object based on provided parameters
//     const filter = {};
//     if (tenant_mobileNumber) {
//       filter.tenant_mobileNumber = tenant_mobileNumber;
//     }

//     // If status is provided, search inside the applicant_status array
//     if (status) {
//       filter['applicant_status.status'] = status;
//     }

//     // Use the filter object in the MongoDB query
//     var data = await Applicant.find(filter);
//     console.log(data[0].applicant_status, "data")

//     res.json({
//       data: data,
//       statusCode: 200,
//       message: "Read All applicants",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.delete("/applicant/note_attachment/:applicantId/:noteAndFileId", async (req, res) => {
  try {
    const { applicantId, noteAndFileId } = req.params;

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      applicantId,
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

    // Update the status of the specified applicant
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      applicantId,
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

    if (newStatus === 'Approved') {
      const { rental_adress, rental_units } = updatedApplicant;
    
      await Applicant.updateMany(
        {
          rental_adress,
          rental_units,
          _id: { $ne: applicantId }, 
          'applicant_status.status': { $ne: 'Approved' }, 
        },
        {
          $push: {
            applicant_status: {
              statusUpdatedBy: 'Admin',
              status: 'Rejected',
              updateAt: updatedAt,
            },
          },
        }
      );
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
    const { tenant_mobileNumber, status } = req.query;

    // Build a filter object based on provided parameters
    const filter = {};
    if (tenant_mobileNumber) {
      filter.tenant_mobileNumber = tenant_mobileNumber;
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
      if (document.applicant_status.length > 0 && document.applicant_status[0].status === status) {
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

// delete Applicant
router.delete("/applicant", async (req, res) => {
  try {
    let result = await Applicant.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "applicant Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//edit rentals
router.put("/applicant/:id", async (req, res) => {
  try {
    req.body["updateAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    let result = await Applicant.findByIdAndUpdate(req.params.id, req.body);
  
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

//movein api
router.put("/applicant/:id/movein", async (req, res) => {
  try {
    let result = await Applicant.findByIdAndUpdate(
      req.params.id,
      { isMovedin: true },
      { new: true } 
    );

    if (!result) {
      return res.status(404).json({
        statusCode: 404,
        message: "Applicant not found",
      });
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "isMovedin field updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});


//get applicant summary
router.get("/applicant_summary/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    var data = await Applicant.findById(userId);
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: "Summary get Successfully",
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

router.put("/applicant/:id/checklist", async (req, res) => {
  try {
    const applicantId = req.params.id;
    const checklist = req.body.applicant_checklist;

    if (!applicantId || !checklist) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid request. Please provide 'applicant_checklist'.",
      });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
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

router.put("/applicant/:id/checked-checklist", async (req, res) => {
  try {
    const applicantId = req.params.id;
    const checkedChecklist = req.body.applicant_checkedChecklist;

    if (!applicantId || !checkedChecklist) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid request. Please provide 'applicant_checkedChecklist'.",
      });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
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

router.put("/applicant/note_attachment/:id", async (req, res) => {
  try {
    const applicantId = req.params.id;

    const { applicant_notes, applicant_file } = req.body;

    if (!applicant_notes && !applicant_file) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid request. Please provide 'applicant_notes' and/or 'applicant_file'.",
      });
    }

    const updateFields = {};
    if (applicant_notes || applicant_file) {
      const newNoteAndFile = { applicant_notes, applicant_file };
      updateFields.$push = { applicant_NotesAndFile: newNoteAndFile };
    }
    
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      applicantId,
      updateFields,
      { new: true }
    );    

    if (!updatedApplicant) {
      return res.status(404).json({
        statusCode: 404,
        message: "Applicant not found.",
      });
    }

    // Log the state before and after the update
    console.log("Before Update - applicant_NotesAndFile:", updatedApplicant.applicant_NotesAndFile);
    console.log("Updated Applicant:", updatedApplicant);
    console.log("After Update - applicant_NotesAndFile:", updatedApplicant.applicant_NotesAndFile);

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

// router.get("/applicant/notes/:id", async (req, res) => {
//   try {
//     const applicantId = req.params.id;

//     // Find the applicant by ID
//     const applicant = await Applicant.findById(applicantId);

//     if (!applicant) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: "Applicant not found.",
//       });
//     }

//     // Retrieve the applicant_NotesAndFile array
//     const notesAndFiles = applicant.applicant_NotesAndFile || [];

//     res.json({
//       statusCode: 200,
//       data: notesAndFiles,
//       message: "Applicant Notes and Files Retrieved Successfully",
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

router.get("/applicant_summary/rental/:rental_adress", async (req, res) => {
  try {
    const rental = req.params.rental_adress; // Retrieve the rental address from the request parameters
    const data = await Applicant.find({ rental_adress: rental });

    if (data && data.length > 0) {
      res.json({
        data: data,
        statusCode: 200,
        message: "Get all data successfully for the specified rental address",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Data not found for the specified rental address",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Duplicate Applicant not show (Get Applicant using tenant_mobileNumber and if same so show only First Record)
router.get("/existing/applicant", async (req, res) => {
  try {
    // Group records by tenant_mobileNumber and select one record for each group
    const uniqueRecords = await Applicant.aggregate([
      {
        $group: {
          _id: "$tenant_mobileNumber",
          record: { $first: "$$ROOT" }, // Select the first record in each group
        },
      },
      {
        $replaceRoot: { newRoot: "$record" }, // Replace the root with the selected record
      },
    ]);

    res.json({
      data: uniqueRecords,
      statusCode: 200,
      message: "Read All Applicant",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.socketlabs.com",
  port: 587,
  secure: false,
  auth: {
    user: "server39897",  
    pass: "c9J3Wwm5N4Bj",
  },
});

router.get("/applicant/mail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch data from the Applicant database using the provided id
    const applicantData = await Applicant.findById(id);

    if (!applicantData) {
      return res.json({
        statusCode: 404,
        message: "Applicant not found",
      });
    }

    // Destructure the needed data
    const { tenant_email, tenant_firstName, tenant_lastName, rental_adress, rental_units } = applicantData;

    // Update the document with the current date
    applicantData.applicant_emailsend_date = moment()
    .add(1, "seconds")
    .format("YYYY-MM-DD HH:mm:ss");;
    await applicantData.save();

    // const applicationURL = `http://localhost:3000/admin/Applicants/${id}`;
    const applicationURL = `https://propertymanager.cloudpress.host/admin/Applicants/${id}`;

    const htmlContent = `
      <p>You're invited to apply!</p>
      <p>Hi ${tenant_firstName} ${tenant_lastName},</p>
      <p>Thanks for your interest in Garden Row (multi-building complex) - 2D! Click below to get started.</p>
      <a href="${applicationURL}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Start Application</a>
    `;

    // Send mail using Nodemailer
    const info = await transporter.sendMail({
      from: '"donotreply" <mailto:info@cloudpress.host>',
      to: tenant_email,
      subject: `${rental_adress} - ${rental_units}`,
      html: htmlContent,
    });

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

router.put("/application/:id", async (req, res) => {
  try {
    let result = await Applicant.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Application Added Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/applicant/note_attachment/:applicantId/:noteAndFileId", async (req, res) => {
  try {
    const { applicantId, noteAndFileId } = req.params;

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      applicantId,
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
});

module.exports = router;
