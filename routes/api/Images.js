const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// import '../../images'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destinationFolder = ".././../../../mern/Rms_client/";

        // Define the destination folder based on file type
        if (file.mimetype === "application/pdf") {
            destinationFolder += "pdf/";
        } else if (
            file.mimetype === "application/msword" ||
            file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            destinationFolder += "docs/";
        } else if (
            file.mimetype === "image/jpeg" ||
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
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files", 5), async (req, res) => {
    try {
        const uploadedFiles = req.files.map((file, index) => {
            return {
                fileType: file.mimetype.split("/")[1],
                index: index,
                filename: file.filename,
            };
        });
        return res.status(200).json({ status: 'ok', message: 'Files uploaded successfully!', files: uploadedFiles });

    } catch (error) {
        console.error(error);
        let errorMessage = 'Internal Server Error';
        if (error.message === 'Unsupported file type') {
            errorMessage = 'Unsupported file type. Please upload a PDF, DOC, JPEG, or PNG file.';
        }
        return res.status(500).json({ status: 'error', message: error.message || errorMessage });
    }
});

router.get("/get-image/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;

        // Assuming the images are stored in the 'images' directory
        const imagePath = path.join(__dirname, '.././../../../mern/Rms_client/images', filename);

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // Read the file and send it in the response
            const imageBuffer = fs.readFileSync(imagePath);
            res.set("Content-Type", "image/jpeg"); // Set the correct content type (adjust based on your actual image format)
            res.send(imageBuffer);
        } else {
            res.status(404).json({ status: "error", message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
router.get("/get-pdf/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;

        // Assuming the images are stored in the 'images' directory
        const imagePath = path.join(__dirname, '.././../../../mern/Rms_client/pdf', filename);

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // Read the file and send it in the response
            const imageBuffer = fs.readFileSync(imagePath);
            res.set("Content-Type", "image/jpeg"); // Set the correct content type (adjust based on your actual image format)
            res.send(imageBuffer);
        } else {
            res.status(404).json({ status: "error", message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
router.get("/get-docs/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;

        // Assuming the images are stored in the 'images' directory
        const imagePath = path.join(__dirname, '.././../../../mern/Rms_client/docs', filename);

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // Read the file and send it in the response
            const imageBuffer = fs.readFileSync(imagePath);
            res.set("Content-Type", "image/jpeg"); // Set the correct content type (adjust based on your actual image format)
            res.send(imageBuffer);
        } else {
            res.status(404).json({ status: "error", message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;
