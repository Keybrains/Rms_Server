// var mongoose = require("mongoose");
// mongoose.Promise = global.Promise;

// mongoose
//   .connect(
//     "mongodb+srv://shivamshukla:shivamshukla123@shivamshukla.iozmxlc.mongodb.net/RMS"
//   )
//   .then(() => console.log("connection successful"))
//   .catch((err) => console.error("MongoDB Error", err));

// module.exports = mongoose.connection;


const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://shivamshukla:shivamshukla123@shivamshukla.iozmxlc.mongodb.net/RMS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connection successful");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

module.exports = mongoose.connection;
