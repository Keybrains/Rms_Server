const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// import '.././../../../mern/Rms_client/'

// const imageUrl = ".././../../../mern/Rms_client/";
const baseUrl = process.env.REACT_APP_BASE_URL;
const getUrl = "http://localhost:4000/api/images/upload";
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
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files", 5), async (req, res) => {
    console.log(req.files)
    try {
        const uploadedFiles = req.files.map((file, index) => {
            if (file.mimetype === "image/jpeg" ||
                file.mimetype === "image/jpg" ||
                file.mimetype === "image/png" ||
                file.mimetype === "image/gif" ||
                file.mimetype === "image/bmp") {
                const url = baseUrl + "/images/" + file.filename;
                return {
                    fileType: file.mimetype.split("/")[1],
                    index: index,
                    filename: file.filename,sky
                    
                    url: url
                };
            } else if (file.mimetype === "application/pdf") {
                const url = baseUrl + "/pdf/" + file.filename;
                return {
                    fileType: file.mimetype.split("/")[1],
                    index: index,
                    filename: file.filename,
                    url: url
                };
            } else {
                const url = baseUrl + "/docs/" + file.filename;
                return {
                    fileType: file.mimetype.split("/")[1],
                    index: index,
                    filename: file.filename,
                    url: url
                };
            }
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

router.get("/upload/:filetype/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;
        const filetype = req.params.filetype;

        // Assuming the images are stored in the 'images' directory


        // Check if the file exists
        if (filetype === "images") {
            const filePath = path.join(__dirname, ".././../../../mern/Rms_client/", filetype, filename);
            if (fs.existsSync(filePath)) {
                // Read the file and send it in the response
                const fileBuffer = fs.readFileSync(filePath);
                res.set("Content-Type", "image/jpeg"); // Set the correct content type (adjust based on your actual image format)
                res.send(fileBuffer);
            } else {
                res.status(404).json({ status: "error", message: "Image not found" });
            }
        }
        else if (filetype === "pdf") {
            const filePath = path.join(__dirname, ".././../../../mern/Rms_client/", filetype, filename);
            if (fs.existsSync(filePath)) {
                // Read the file and send it in the response
                const fileBuffer = fs.readFileSync(filePath);
                res.set("Content-Type", "application/pdf"); // Set the correct content type (adjust based on your actual image format)
                res.send(fileBuffer);
            } else {
                res.status(404).json({ status: "error", message: "Pdf not found" });
            }
        }
        else {
            const filePath = path.join(__dirname, ".././../../../mern/Rms_client/", filetype, filename);
            if (fs.existsSync(filePath)) {
                // Read the file and send it in the response
                const fileBuffer = fs.readFileSync(filePath);
                res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || "application/msword"); // Set the correct content type (adjust based on your actual image format)
                res.send(fileBuffer);
            } else {
                res.status(404).json({ status: "error", message: "Document not found" });
            }
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;
