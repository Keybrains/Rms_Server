var express = require("express");
var router = express.Router();
var Cronjobs = require("../../../modals/superadmin/Cronjobs");
var LateFee = require("../../../modals/payment/Latefee");
const Payment = require("../../../modals/payment/Payment");
const Charge = require("../../../modals/superadmin/Charge");
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
cron.schedule("49 17 * * *", async () => {
  const cronjobs = await Cronjobs.find();
  const lateFee = await LateFee.find({});
  const isCronjobRunning = cronjobs[0].isCronjobRunning;

  if (!lateFee) {
    console.error("LateFee data not found.");
    return;
  }
  // const lateFeeDuration = lateFee.duration;
  try {
    //const current = new Date();
    if (isCronjobRunning === false) {
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: true }
      );
      console.log("Cron hitt...!!!");
      const currentDate = new Date().toISOString().split("T")[0];
      const fetchedchargespayaments = await Charge.find();
      if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
        for (const payment of fetchedchargespayaments) {
          if (payment.entry && payment.entry.length > 0) {
            for (const charge of payment.entry) {
              console.log("==================Charge==============",charge)
                  if (
                    // charge.type === "Charge" &&
                    charge.charge_type === "Rent" &&
                    // charge.rent_cycle === "Monthly" &&
                    charge.is_paid === false &&
                    charge.is_lateFee === false
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
                    if (differenceInDays > 3) {
                      console.log("The late fee will be charged.");
                      const unitToUpdate = fetchedchargespayaments.find(
                        (payment) => {
                          const foundUnit = payment.entry.find(
                              (c) =>
                                c._id === charge._id &&
                                // c.type === "Charge" &&
                                c.charge_type === "Rent" &&
                                // c.rent_cycle === "Monthly" &&
                                c.is_paid === false &&
                                c.is_lateFee === false
                            )
                          
                          return !!foundUnit;
                        }
                      );
                      console.log("unit to update",unitToUpdate)
                      if (unitToUpdate) {
                        const foundUnitIndex = unitToUpdate.entry.findIndex(                    
                              (c) =>
                                c._id === charge._id &&
                                // c.type === "Charge" &&
                                c.charge_type === "Rent" &&
                                // c.rent_cycle === "Monthly" &&
                                c.is_paid === false &&
                                c.is_lateFee === false             
                        );
                          
                        // Push the late fee to the Charge collection as a new document
                        const lateFeeRecord = {
                          admin_id: payment.admin_id,
                          tenant_id: payment.tenant_id,
                          lease_id: payment.lease_id,
                          entry: [{
                            charge_type: "Rent Late Fee",
                            account: "Rent Late Fee",
                            amount: charge.amount * (10 / 100),
                            memo: "Late fee for Rent",
                            date: currentDate,
                            rent_cycle: "Monthly",
                            is_paid: false,
                            is_repeatable: false,
                          }],
                          total_amount : charge.amount * (10 / 100),
                          uploaded_file: [],
                          createdAt: currentDate,
                          updatedAt: currentDate,
                          is_delete: false
                        };
      
                        // Make POST request to /charge endpoint
                        await axios.post('https://saas.cloudrentalmanager.com/api/charge/charge', lateFeeRecord);
                        
                        console.log("Late fee added to the payment details.");
                        // Update the specific charge's islatefee to true in the fetched data
                        unitToUpdate.entry[foundUnitIndex].is_lateFee = true;
                        await Charge.updateOne(
                          { _id: unitToUpdate._id },
                          { entry: unitToUpdate.entry }
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

// cron.schedule("56 16 * * *", async () => {
//   const cronjobs = await Cronjobs.find();
//   const lateFee = await LateFee.find({});
//   const isCronjobRunning = cronjobs[0].isCronjobRunning;

//   if (!lateFee) {
//     console.error("LateFee data not found.");
//     return;
//   }

//   try {
//     if (isCronjobRunning === false) {
//       await Cronjobs.updateOne(
//         { _id: cronjobs[0]._id },
//         { isCronjobRunning: true }
//       );

//       console.log("Cron hitt...!!!");

//       const currentDate = new Date().toISOString().split("T")[0];
//       const fetchedchargespayaments = await Charge.find();

//       if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
//         for (const payment of fetchedchargespayaments) {
//           if (payment.entry && payment.entry.length > 0) {
//             for (const charge of payment.entry) {
//               if (
//                 charge.charge_type === "Rent" &&
//                 charge.is_paid === false &&
//                 charge.is_lateFee === false
//               ) {
//                 const chargeDate = new Date(charge.date);
//                 const differenceInTime = Math.abs(
//                   chargeDate - new Date(currentDate)
//                 );
//                 const differenceInDays = Math.ceil(
//                   differenceInTime / (1000 * 60 * 60 * 24)
//                 );

//                 if (differenceInDays > 3) {
//                   console.log("The late fee will be charged.");
                  
//                   // Create late fee record
//                   const lateFeeRecord = {
//                     admin_id: payment.admin_id,
//                     tenant_id: payment.tenant_id,
//                     lease_id: payment.lease_id,
//                     entry: [{
//                       charge_type: "Rent Late Fee",
//                       account: "Rent Late Fee",
//                       amount: charge.amount * (10 / 100),
//                       memo: "Late fee for Rent",
//                       date: currentDate,
//                       rent_cycle: "Monthly",
//                       is_paid: false,
//                       is_repeatable: false,
//                     }],
//                     total_amount : charge.amount * (10 / 100),
//                     uploaded_file: [],
//                     createdAt: currentDate,
//                     updatedAt: currentDate,
//                     is_delete: false
//                   };

//                   // Make POST request to /charge endpoint
//                   await axios.post('https://saas.cloudrentalmanager.com/api/charge/charge', lateFeeRecord);

//                     // Update the specific charge's islatefee to true in the fetched data
//                     payment.entry[foundUnitIndex].is_lateFee = true;
//                     await Charge.updateOne(
//                       { _id: payment._id },
//                       { entry: payment.entry }
//                     );
//                     console.log(
//                       "Updated islatefee to true for the charge."
//                     );
//                 }
//               }
//             }
//           }
//         }
//       }

//       await Cronjobs.updateOne(
//         { _id: cronjobs[0]._id },
//         { isCronjobRunning: false }
//       );
      
//       console.log("cronjob updated to false");
//     }

//     await logToDatabase("Success", `Rent Late Fee`);
//   } catch (error) {
//     await logToDatabase("Failure", `Rent Late Fee`, error.message);
//     console.error("Error:", error);
//     await Cronjobs.updateOne(
//       { _id: cronjobs[0]._id },
//       { isCronjobRunning: false }
//     );
//   }
// });

module.exports = router;