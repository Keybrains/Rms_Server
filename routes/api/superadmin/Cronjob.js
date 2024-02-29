var express = require("express");
var router = express.Router();
var Cronjobs = require("../../../modals/superadmin/Cronjobs");
const Payment = require("../../../modals/payment/Payment");
const cron = require("node-cron");
var axios = require("axios");
var moment = require("moment");

//shedule payment for nmi transaction
cron.schedule("10 17 * * *", async () => {
  const cronjobs = await Cronjobs.find();
  const isCronjobRunning = cronjobs[0].isCronjobRunning;
  try {
    if (isCronjobRunning === false) {
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: true }
      );
      console.log("Cron hitt...!!!");
      const currentDate = new Date().toISOString().split("T")[0];
      const fetchedchargespayaments = await Payment.find({
        response: "PENDING",
        payment_type: "Credit Card",
        "entry.date": currentDate,
      });
      if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
        for (const charge of fetchedchargespayaments) {
          if (
            charge.response === "PENDING" &&
            charge.payment_type === "Credit Card"
          ) {
            const chargeDate = new Date(charge.entry[0].date)
              .toISOString()
              .split("T")[0];

            if (chargeDate === currentDate) {
              let id = charge.payment_id;

              const nmiApiUrl = `https://propertymanager.cloudpress.host/api/nmipayment/update_sale/${id}`;

              try {
                const response = await axios.post(nmiApiUrl, {
                  paymentDetails: charge
                });

                console.log("NMI API Response:", response.data);
              } catch (error) {
                console.error("Error sending data to NMI API:", error);
              }
            } else {
              console.log("Charge object:", charge);
            }
          }
        }
      }
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: false }
      );
      console.log("cronjob updated to false");
    }
    // await logToDatabase("Success", `Rent Late Fee`);
  } catch (error) {
    // await logToDatabase("Failure", `Rent Late Fee`, error.message);
    console.error("Error:", error);
    await Cronjobs.updateOne(
      { _id: cronjobs[0]._id },
      { isCronjobRunning: false }
    );
  }
});

module.exports = router;