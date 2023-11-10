var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const fs = require('fs');

// // Create a storage engine for multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Set the destination directory for uploaded files
//     const dir = 'Uploadfile/';
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     // Set the file name for uploaded files
//     cb(null, file.originalname);
//   },
// });

// // Create an instance of multer with the storage engine
// const upload = multer({ storage: storage });

// /* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// // Handle file upload
// router.post('/uploadfile', upload.single('file'), function (req, res, next) {
//   // The 'file' in `upload.single('file')` should match the name attribute of your file input in the form.
  
//   if (req.file) {
//     console.log(`File ${req.file.originalname} uploaded successfully`);
//     res.send('File uploaded successfully'); // Send a simple success message
//   } else {
//     res.status(400).send('File upload failed');
//   }
// });     



// module.exports = router;
