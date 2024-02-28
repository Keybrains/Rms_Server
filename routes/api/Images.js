const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const baseUrl = process.env.REACT_APP_IMAGE_URL;

//set currunt time to add before filename to identify
function getCurrentDateAndTime() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");
  return (formattedDateTime = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-`);
}

//defined storage path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationFolder = "../.././mern/Rms_client/files/";

    // Define the destination folder based on file type
    if (file.mimetype === "application/pdf") {
      destinationFolder += "pdf/";
    } else if (
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      destinationFolder += "docs/";
    } else if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "image/bmp"
    ) {
      destinationFolder += "images/";
    } else {
      // If file type is not supported, reject the file
      return cb(new Error("Unsupported file type"), null);
    }

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, getCurrentDateAndTime() + file.originalname.replace(/\s/g, ""));
  },
});

const upload = multer({ storage: storage });

//upload sinle and multiple files
router.post("/upload", upload.array("files", 12), async (req, res) => {
  try {
    const uploadedFiles = req.files.map((file, index) => {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/bmp"
      ) {
        const url = baseUrl + "/" + file.filename;
        return {
          fileType: file.mimetype.split("/")[1],
          index: index,
          filename: file.filename,
          url: url,
        };
      } else if (file.mimetype === "application/pdf") {
        const url = baseUrl + "/pdf/" + file.filename;
        return {
          fileType: file.mimetype.split("/")[1],
          index: index,
          filename: file.filename,
          url: url,
        };
      } else {
        const url = baseUrl + "/docs/" + file.filename;
        return {
          fileType: file.mimetype.split("/")[1],
          index: index,
          filename: file.filename,
          url: url,
        };
      }
    });
    return res.status(200).json({
      status: "ok",
      message: "Files uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error(error);
    let errorMessage = "Internal Server Error";
    if (error.message === "Unsupported file type") {
      errorMessage =
        "Unsupported file type. Please upload a PDF, DOC, JPEG, or PNG file.";
    }
    return res
      .status(500)
      .json({ status: "error", message: error.message || errorMessage });
  }
});

router.get("/get-file/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath1 = path.join(
      "../.././mern/Rms_client/files/images/",
      filename
    );
    const filePath2 = path.join(
      "../.././mern/Rms_client/files/docs/",
      filename
    );
    const filePath3 = path.join("../.././mern/Rms_client/files/pdf/", filename);

    if (fs.existsSync(filePath1)) {
      const fileBuffer = fs.readFileSync(filePath1);
      res.set("Content-Type", "image/jpeg");
      res.send(fileBuffer);
    } else if (fs.existsSync(filePath2)) {
      const fileBuffer = fs.readFileSync(filePath2);
      res.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          "application/msword"
      );
      res.send(fileBuffer);
    } else if (fs.existsSync(filePath3)) {
      const fileBuffer = fs.readFileSync(filePath3);
      res.set("Content-Type", "application/pdf");
      res.send(fileBuffer);
    } else {
      res.status(404).json({ status: "error", message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/upload/:filetype/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filetype = req.params.filetype;

    // Construct the file path
    const filePath = path.join(
      "../.././mern/Rms_client/files/",
      filetype,
      filename
    );

    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
      res
        .status(200)
        .json({ status: "success", message: "File deleted successfully!" });
    } else {
      res.status(404).json({ status: "error", message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.put(
  "/upload/:filetype/:filename",
  upload.single("files"),
  async (req, res) => {
    try {
      const filename = req.params.filename;
      const filetype = req.params.filetype;

      // Construct the file path
      const filePath = path.join(
        "../.././mern/Rms_client/files/",
        filetype,
        filename
      );

      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // Delete the file
        fs.unlinkSync(filePath);
        const uploadedFiles = req.file;
        let data;
        if (
          uploadedFiles.mimetype === "image/jpeg" ||
          uploadedFiles.mimetype === "image/jpg" ||
          uploadedFiles.mimetype === "image/png" ||
          uploadedFiles.mimetype === "image/gif" ||
          uploadedFiles.mimetype === "image/bmp"
        ) {
          const url = "/images/" + uploadedFiles.filename;
          data = {
            fileType: uploadedFiles.mimetype.split("/")[1],
            filename: uploadedFiles.filename,
            url: url,
          };
        } else if (uploadedFiles.mimetype === "application/pdf") {
          const url = "/pdf/" + uploadedFiles.filename;
          data = {
            fileType: uploadedFiles.mimetype.split("/")[1],
            filename: uploadedFiles.filename,
            url: url,
          };
        } else {
          const url = "/docs/" + uploadedFiles.filename;
          data = {
            fileType: uploadedFiles.mimetype.split("/")[1],
            filename: uploadedFiles.filename,
            url: url,
          };
        }
        return res.status(200).json({
          status: "ok",
          message: "Files Updated successfully!",
          files: data,
        });
      } else {
        res.status(404).json({ status: "error", message: "File not found" });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

module.exports = router;
