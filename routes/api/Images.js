const express = require("express");
const router = express.Router();
const multer = require('multer');
// import '.././../../../rms-y/Rms_client/src/assets/images'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '.././../../../rms-y/Rms_client/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/upload-image", async (req, res) => {
    try {
        // Wrap the multer middleware in a promise to catch any errors
        await new Promise((resolve, reject) => {
            upload.single("image")(req, res, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log(req.body);
        console.log(req.file);

        const imageName = req.file.filename;
        res.json({ status: "ok", image: imageName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: error.message || "Internal Server Error" });
    }
});

module.exports = router;
