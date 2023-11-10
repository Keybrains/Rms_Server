var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var dbCollation = require("./db");
var indexRouter = require("./routes/api/index");
var usersRouter = require("./routes/api/users");
var RegisterRouter = require("./routes/api/Register");
var RentalsRouter = require("./routes/api/Rentals");
var NewPropartyRouter = require("./routes/api/NewPropaty");
var TenantsRouter = require("./routes/api/Tenants");
var AddStaffMember = require ("./routes/api/AddStaffMember");
var RentalOwners = require ("./routes/api/RentalOwners");
var ApplicantRouter = require ("./routes/api/Applicants");
var AgentRouter = require ("./routes/api/Addagent")
var VendorRouter = require ("./routes/api/Vendor");
var WorkorderRouter = require ("./routes/api/Workorder");
var AccountRouter = require ("./routes/api/AddAccount");
var LedgerRouter = require ("./routes/api/Ledger");
var NotificationRouter = require ("./routes/api/Notification");
var AddRicuringAcc = require ("./routes/api/AddRecuringAcc");
var OneTimeChargeAcc = require ("./routes/api/OneTimeAcc");
var PaymentRouter = require ("./routes/api/Payment");
// var UploadFile = require ("./routes/UploadFile");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/api/users", usersRouter); 
app.use("/api/register", RegisterRouter);
app.use("/api/rentals", RentalsRouter);
app.use("/api/newproparty", NewPropartyRouter);
app.use("/api/tenant", TenantsRouter);
app.use("/api/addstaffmember",AddStaffMember);
app.use("/api/rentalowner",RentalOwners);
app.use("/api/applicant",ApplicantRouter);
app.use("/api/addagent",AgentRouter);
app.use("/api/addaccount",AccountRouter);
app.use("/api/vendor",VendorRouter);
app.use("/api/workorder",WorkorderRouter);
app.use("/api/ledger",LedgerRouter);
app.use("/api/notification",NotificationRouter);
// app.use("/uploadfile",UploadFile);
app.use("/api/recurringAcc",AddRicuringAcc);
app.use("/api/onetimecharge",OneTimeChargeAcc);
app.use("/api/payment",PaymentRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page  
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
