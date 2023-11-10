var express = require("express");
var router = express.Router();
var Applicant = require("../../modals/Applicants");

  //   Add  applicant
router.post("/applicant", async (req, res) => {
    try {
  
      var data = await Applicant.create(req.body);
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


  // Add a new route to update the applicant checklist
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

      const updatedApplicant = await Applicant.findByIdAndUpdate(
        applicantId,
        { applicant_checklist: checklist },
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
        message: "Applicant Checklist Updated Successfully",
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  });


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


// router.get("/rentals_summary/:rental_adress", async (req, res) => {
//   try {
//     const address = req.params.rental_adress; // Get the user ID from the URL parameter
//     var data = await Rentals.find(address);
//     if (data) {
//       res.json({
//         data: data,
//         statusCode: 200,
//         message: "summaryGet Successfully",
//       });
//     } else {
//       res.status(404).json({
//         statusCode: 404,
//         message: "summary not found",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

module.exports = router;