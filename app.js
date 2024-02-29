var createError = require("http-errors");
var express = require("express");
require("dotenv").config();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var dbCollation = require("./db");
// var webhookRoutes = require("./routes/api/webhook");
var indexRouter = require("./routes/api/index");
// var usersRouter = require("./routes/api/users");
// // var RegisterRouter = require("./routes/api/Register");
// // var RentalsRouter = require("./routes/api/Rentals");
// var NewPropartyRouter = require("./routes/api/NewPropaty");
// // var TenantsRouter = require("./routes/api/Tenants");
// var AddStaffMember = require("./routes/api/AddStaffMember");
// var RentalOwners = require("./routes/api/RentalOwners");
// var AgentRouter = require("./routes/api/Addagent");
// // var VendorRouter = require("./routes/api/Vendor");
// var WorkorderRouter = require("./routes/api/Workorder");
// var AccountRouter = require("./routes/api/AddAccount");
// var LedgerRouter = require("./routes/api/Ledger");
// var NotificationRouter = require("./routes/api/Notification");
// var AddRicuringAcc = require("./routes/api/AddRecuringAcc");
// var OneTimeChargeAcc = require("./routes/api/OneTimeAcc");
// var PaymentRouter = require("./routes/api/Payment");
// // var UploadFile = require ("./routes/UploadFile");
// var PropertyUnitRouter = require("./routes/api/PropertyUnit");
// var AddChargeAndPaymentRouter = require("./routes/api/AddChargeAndPayment");
// var NmiPaymentRouter = require("./routes/api/NmiPayment");
// var webhookRoutes = require("./routes/api/webhook");
var imagesRouter = require("./routes/api/Images");

// =================  Super Admin  =======================================
var PlansRouter = require("./routes/api/superadmin/Plans.js");
var PropertyTypeRouter = require("./routes/api/superadmin/PropertyType.js");
var AdminRegisterRouter = require("./routes/api/superadmin/Admin_Register.js");
var StaffMemberRouter = require("./routes/api/superadmin/StaffMember.js");
var RentalsRouter = require("./routes/api/superadmin/Rentals.js");
var UnitRouter = require("./routes/api/superadmin/Unit.js");
var ApplienceRouter = require("./routes/api/superadmin/Applience.js");
var LeaseRouter = require("./routes/api/superadmin/Lease.js");
var AccountsRouter = require("./routes/api/superadmin/Account.js");
var TenantsRouter = require("./routes/api/superadmin/Tenants.js");
var Plans_PurchasedRouter = require("./routes/api/superadmin/Plans_Purchased.js");
var VendorAdmindRouter = require("./routes/api/superadmin/Vendor.js");
var ApplicantAdmindRouter = require("./routes/api/superadmin/Applicant.js");
var WorkOrderRouter = require("./routes/api/superadmin/WorkOrder.js");
var RentalOwnerRouter = require("./routes/api/superadmin/RentalOwner.js");
var ChargesRouter = require("./routes/api/superadmin/Charges.js");
var NotificationRouter = require("./routes/api/superadmin/Notification.js");
var CronjobRoutes = require("./routes/api/superadmin/Cronjob.js")

// Payments
var PaymentRouter = require("./routes/api/payments/Payment.js");
var SurchargeRouter = require("./routes/api/payments/Surcharge.js");
var NmiPaymentRouter = require("./routes/api/payments/NMI-response.js");
var CreditCardRouter = require("./routes/api/payments/CreditCard.js");

// Email Comfigration
var EmailConfigrationRouter = require("./routes/api/Email/Email.js")

var app = express();

// view engine setups
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/api/images", imagesRouter);

// ===============  Super Admin  ====================================
app.use("/api/plans", PlansRouter);
app.use("/api/propertytype", PropertyTypeRouter);
app.use("/api/admin", AdminRegisterRouter);
app.use("/api/staffmember", StaffMemberRouter);
app.use("/api/rentals", RentalsRouter);
app.use("/api/unit", UnitRouter);
app.use("/api/appliance", ApplienceRouter);
app.use("/api/leases", LeaseRouter);
app.use("/api/accounts", AccountsRouter);
app.use("/api/tenants", TenantsRouter);
app.use("/api/purchase", Plans_PurchasedRouter);
app.use("/api/vendor", VendorAdmindRouter);
app.use("/api/applicant", ApplicantAdmindRouter);
app.use("/api/work-order", WorkOrderRouter);
app.use("/api/rental_owner", RentalOwnerRouter);
app.use("/api/charge", ChargesRouter);
app.use("/api/notification", NotificationRouter);
app.use('/api/cronjob', CronjobRoutes)

// Payment
app.use("/api/payment", PaymentRouter);
app.use("/api/surcharge", SurchargeRouter);
app.use("/api/nmipayment", NmiPaymentRouter);
app.use("/api/creditcard", CreditCardRouter);

// Email configration
app.use("/api/email_configration", EmailConfigrationRouter);

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
