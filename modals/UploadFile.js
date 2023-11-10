
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;// upload.js

// const fs = require("fs");
// const multer = require("multer");

// // Create a folder for file uploads if it doesn't exist
// const uploadFolder = "./uploads";
// if (!fs.existsSync(uploadFolder)) {
//   fs.mkdirSync(uploadFolder);
// }

// // Set up Multer for handling file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadFolder);
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// // Define a model function to handle file uploads
// const uploadFile = (req, res) => {
//   upload.single("b_video")(req, res, (err) => {
//     if (err) {
//       return res.status(500).json({ error: "Error uploading file" });
//     }
//     const imagePath = `/CDN/${req.file.filename}`;
//     res.json({ imagePath });
//   });
// };

// module.exports = {
//   uploadFile,
// };
