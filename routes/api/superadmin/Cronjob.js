var express = require("express");
var router = express.Router();
var Cronjobs = require("../../../modals/superadmin/Cronjobs");
const Payment = require("../../../modals/payment/Payment");
const cron = require("node-cron");
var axios = require("axios");
var moment = require("moment");

//shedule payment for nmi transaction
cron.schedule("10 05 * * *", async () => {
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

              const nmiApiUrl = `https://saas.cloudrentalmanager.com/api/nmipayment/update_sale/${id}`;

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

//cron job for the late fee for unpaid rent charge
cron.schedule("10 19 * * *", async () => {
  const cronjobs = await Cronjobs.find();
  const lateFee = await LateFee.findOne({ admin: "302property" });
  const isCronjobRunning = cronjobs[0].isCronjobRunning;

  if (!lateFee) {
    console.error("LateFee data not found.");
    return;
  }

  const lateFeeDuration = lateFee.duration;
  try {
    //const current = new Date();
    if (isCronjobRunning === false) {
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: true }
      );
      console.log("Cron hitt...!!!");
      const currentDate = new Date().toISOString().split("T")[0];
      const fetchedchargespayaments = await Payment.find();
      if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
        for (const payment of fetchedchargespayaments) {
          if (payment.unit && payment.unit.length > 0) {
            for (const unit of payment.unit) {
              if (unit.paymentAndCharges && unit.paymentAndCharges.length > 0) {
                for (const charge of unit.paymentAndCharges) {
                  if (
                    charge.type === "Charge" &&
                    charge.charge_type === "Last Month's Rent" &&
                    charge.rent_cycle === "Monthly" &&
                    charge.isPaid === false &&
                    charge.islatefee === false
                  ) {
                    const chargeDate = new Date(charge.date);
                    const differenceInTime = Math.abs(
                      chargeDate - new Date(currentDate)
                    );
                    const differenceInDays = Math.ceil(
                      differenceInTime / (1000 * 60 * 60 * 24)
                    );
                    console.log("chargeDate", chargeDate);
                    console.log("differenceInTime", differenceInTime);
                    console.log("differenceInDays", differenceInDays);
                    if (differenceInDays > lateFeeDuration) {
                      console.log("The late fee will be charged.");
                      const unitToUpdate = fetchedchargespayaments.find(
                        (payment) => {
                          const foundUnit = payment.unit.find((u) =>
                            u.paymentAndCharges.some(
                              (c) =>
                                c._id === charge._id &&
                                c.type === "Charge" &&
                                c.charge_type === "Last Month's Rent" &&
                                c.rent_cycle === "Monthly" &&
                                c.isPaid === false &&
                                c.islatefee === false
                            )
                          );
                          return !!foundUnit;
                        }
                      );
                      if (unitToUpdate) {
                        const foundUnitIndex = unitToUpdate.unit.findIndex(
                          (u) =>
                            u.paymentAndCharges.some(
                              (c) =>
                                c._id === charge._id &&
                                c.type === "Charge" &&
                                c.charge_type === "Last Month's Rent" &&
                                c.rent_cycle === "Monthly" &&
                                c.isPaid === false &&
                                c.islatefee === false
                            )
                        );
                        const foundChargeIndex = unitToUpdate.unit[
                          foundUnitIndex
                        ].paymentAndCharges.findIndex(
                          (c) =>
                            c._id === charge._id &&
                            c.type === "Charge" &&
                            c.charge_type === "Last Month's Rent" &&
                            c.rent_cycle === "Monthly" &&
                            c.isPaid === false &&
                            c.islatefee === false
                        );
                        // Push the late fee to the specific unit's paymentAndCharges array
                        unitToUpdate.unit[
                          foundUnitIndex
                        ].paymentAndCharges.push({
                          type: "Charge",
                          charge_type: "Rent Late Fee",
                          account: "Rent Late Fee",
                          amount: charge.amount * (10 / 100),
                          rental_adress: charge.rental_adress,
                          tenant_firstName: `${charge.tenant_firstName}`,
                          tenant_id: charge.tenant_id,
                          memo: "Late fee for Rent",
                          date: currentDate,
                          rent_cycle: "Monthly", 
                        });
                        console.log("Late fee added to the payment details.");
                        // Update the specific charge's islatefee to true in the fetched data
                        unitToUpdate.unit[foundUnitIndex].paymentAndCharges[
                          foundChargeIndex
                        ].islatefee = true;
                        await PaymentCharges.updateOne(
                          { _id: unitToUpdate._id },
                          { unit: unitToUpdate.unit }
                        );
                        console.log(
                          "Updated islatefee to true for the charge."
                        );
                      }
                    } else {
                      console.log("Charge object:", charge);
                    }
                  }
                }
              }
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
    await logToDatabase("Success", `Rent Late Fee`);
  } catch (error) {
    await logToDatabase("Failure", `Rent Late Fee`, error.message);
    console.error("Error:", error);
    await Cronjobs.updateOne(
      { _id: cronjobs[0]._id },
      { isCronjobRunning: false }
    );
  }
});

module.exports = router;