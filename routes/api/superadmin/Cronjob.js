var express = require("express");
var router = express.Router();
var Cronjobs = require("../../../modals/superadmin/Cronjobs");
var LateFee = require("../../../modals/payment/Latefee");
const Payment = require("../../../modals/payment/Payment");
const Charge = require("../../../modals/superadmin/Charge");
const cron = require("node-cron");
var axios = require("axios");
var moment = require("moment");
const Latefee = require("../../../modals/payment/Latefee");
const Leasing = require("../../../modals/superadmin/Leasing");

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

async function getLateFeeDuration(adminId) {
  try {
    // Assuming you have a model named 'InCharge' representing the admin in charge
    const adminData = await Latefee.findOne({ admin_id: adminId });
    
    if (adminData) {
      // Assuming 'lateFeeDuration' is the field containing the late fee duration
      console.log(adminData,"admindata");
      return adminData;
    } else {
      // Return a default value or handle the case when admin data is not found
      console.error(`Admin with ID ${adminId} not found.`);
      return 0; // You can define DEFAULT_LATE_FEE_DURATION as per your requirements
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching late fee duration:", error);
    return 0; // Return a default value in case of error
  }
}

//cron job for the late fee for unpaid rent charge
cron.schedule("30 12 * * *", async () => {
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
              // console.log("==================Charge==============",payment)
                  if (
                    // charge.type === "Charge" &&
                    charge.charge_type === "Rent" &&
                    // charge.rent_cycle === "Monthly" &&
                    charge.is_paid === false &&
                    charge.is_lateFee === false
                  ) {
                    const adminId = payment.admin_id;
                    const adminLateFee = await getLateFeeDuration(adminId);
                    console.log("mansi------------------", adminLateFee)
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
                    if (differenceInDays > adminLateFee.duration) {
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
                            amount: charge.amount * (adminLateFee.late_fee / 100),
                            memo: "Late fee for Rent",
                            date: currentDate,
                            rent_cycle: "Monthly",
                            is_paid: false,
                            is_repeatable: false,
                          }],
                          total_amount : charge.amount * (adminLateFee.late_fee / 100),
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

//rent cron job

// cron.schedule("07 11 * * *", async () => {
//   const cronjobs = await Cronjobs.find();
//   const isCronjobRunning = cronjobs[0].isCronjobRunning;
//   try {
//     if (isCronjobRunning === false) {
//       await Cronjobs.updateOne(
//         { _id: cronjobs[0]._id },
//         { isCronjobRunning: true }
//       );

//       console.log("Cron hitt...!!!");
//       const currentDate = new Date().toISOString().split("T")[0];
//       const tenants = await Leasing.find();
// console.log(tenants,"mmmm")
//       tenants.forEach(async (entry) => {
//           const startDate = entry.start_date
//             ? new Date(entry.start_date).toISOString().split("T")[0]
//             : null;
//           const endDate = entry.end_date
//             ? new Date(entry.end_date).toISOString().split("T")[0]
//             : null;
//           const nextDueDate = entry.entry[0].date
//             ? new Date(entry.entry[0].date).toISOString().split("T")[0]
//             : null;
//           const rentCycle = entry.entry[0].rent_cycle;
//           // const paymentMethod = entry.paymentMethod;
//           console.log(
//             "start-end-due",
//             startDate + " " + endDate + " " + nextDueDate + " " + rentCycle
//           );
//           // console.log("currentDate", currentDate);
//           // console.log("rentCycle", rentCycle);
//           // console.log(" Cron middle hitt ...!!!");

//           // Monthly cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate && // Ensure these dates exist
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Monthly"
//             //paymentMethod === "Manually"
//           ) {
//             // Update the nextDue_date to current date + 1 month
//             const nextDueDatePlusOneMonth = new Date(currentDate);
//             nextDueDatePlusOneMonth.setMonth(
//               nextDueDatePlusOneMonth.getMonth() + 1
//             );
//             console.log("--------------------------",nextDueDatePlusOneMonth)

//             entry.entry.date = nextDueDatePlusOneMonth
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date

//             console.log("Monthly Cron end...!!!");
//             // Save the changes to the database
//             await entry.save();

//             //post data static after cron run for the monthly ----------------------------------------
//             // const rentalAdress = tenant.entries[0].rental_adress;
//             // const propertyId = tenant.entries[0].property_id;
//             // const unit = tenant.entries[0].rental_units;
//             // const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await Charge.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Rent",
//                 account: "Last Month's Rent",
//                 amount: entry.entry[0].amount,
//                 // rental_adress: rentalAdress,
//                 // tenant_firstName: `${entry.tenant_firstName} ${entry.tenant_lastName}`,
//                 tenant_id: entry._id,
//                 // memo: "Last Month's Rent",
//                 date: currentDate,
//                 // month_year: `${currentDate.split("-")[1]}-${
//                 //   currentDate.split("-")[0]
//                 // }`,
//                 rent_cycle: "Monthly",
//                 islatefee: false, 
//               });

//               try {
//                 await existingEntry.save();
//                 await logToDatabase("Success", `Rent Monthly`);
//               } catch (error) {
//                 await logToDatabase("Failure", `Rent Monthly`);
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "test",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Monthly", // Change this accordingly
//                         islatefee: false, // Change this accordingly
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 console.log("Data saved to payment-charges collection.");
//                 await logToDatabase("Success", `Rent Monthly`);
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//                 await logToDatabase("Failure", `Rent Monthly`);
//               }
//             }
//           }
//           //**************************************************************************************************************************************************************************************************************** */
//           // Weekly cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate && // Ensure these dates exist
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Weekly"
//           ) {
//             console.log("Weekly Cron hitt...!!!");

//             // Update the nextDue_date to current date + 1 week
//             const nextDueDatePlusOneWeek = new Date(currentDate);
//             nextDueDatePlusOneWeek.setDate(
//               nextDueDatePlusOneWeek.getDate() + 7
//             );

//             entry.nextDue_date = nextDueDatePlusOneWeek
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date
//             console.log("Weekly Cron hitt...!!!");
//             // Save the changes to the database
//             await tenant.save();

//             //Data Post Logic Here for Weekly
//             //post data static after cron run for the Weekly ----------------------------------------
//             const rentalAdress = tenant.entries[0].rental_adress;
//             const propertyId = tenant.entries[0].property_id;
//             const unit = tenant.entries[0].rental_units;
//             const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await PaymentCharges.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Last Month's Rent",
//                 account: "Last Month's Rent",
//                 amount: tenant.entries[0].amount,
//                 rental_adress: rentalAdress,
//                 tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                 tenant_id: tenant._id,
//                 memo: "Last Month's Rent",
//                 date: currentDate,
//                 month_year: `${currentDate.split("-")[1]}-${
//                   currentDate.split("-")[0]
//                 }`,
//                 rent_cycle: "Weekly",
//               });

//               try {
//                 await existingEntry.save();
//                 await logToDatabase("Success", `Rent Weekly`);
//                 console.log(
//                   "Data appended to an existing entry in payment-charges collection."
//                 );
//               } catch (error) {
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "Last Month's Rent",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Weekly", // Change this accordingly
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 console.log("Data saved to payment-charges collection.");
//                 await logToDatabase("Success", `Rent Weekly`);
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//               }
//             }
//           }

//           // Daily cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate && // Ensure these dates exist
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Daily"
//           ) {
//             console.log("Daily Cron hitt...!!!");

//             // Update the nextDue_date to current date + 1 day
//             const nextDueDatePlusOneDay = new Date(currentDate);
//             nextDueDatePlusOneDay.setDate(nextDueDatePlusOneDay.getDate() + 1);

//             entry.nextDue_date = nextDueDatePlusOneDay
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date

//             console.log("Daily Cron end...!!!");
//             // Save the changes to the database
//             await tenant.save();

//             //post data static after cron run for the Daily ----------------------------------------
//             const rentalAdress = tenant.entries[0].rental_adress;
//             const propertyId = tenant.entries[0].property_id;
//             const unit = tenant.entries[0].rental_units;
//             const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await PaymentCharges.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Last Month's Rent",
//                 account: "Last Month's Rent",
//                 amount: tenant.entries[0].amount,
//                 rental_adress: rentalAdress,
//                 tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                 tenant_id: tenant._id,
//                 memo: "Last Month's Rent",
//                 date: currentDate,
//                 month_year: `${currentDate.split("-")[1]}-${
//                   currentDate.split("-")[0]
//                 }`,
//                 rent_cycle: "Daily", // Change this accordingly
//               });

//               try {
//                 await existingEntry.save();
//                 await logToDatabase("Success", `Rent Daily`);
//                 console.log(
//                   "Data appended to an existing entry in payment-charges collection."
//                 );
//               } catch (error) {
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "Last Month's Rent",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Daily", // Change this accordingly
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 console.log("Data saved to payment-charges collection.");
//                 await logToDatabase("Success", `Rent Daily`);
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//               }
//             }
//             //post data static after cron run for the Daily end----------------------------------------
//           }

//           // Every Two months cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate && // Ensure these dates exist
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Every two months"
//           ) {
//             console.log("Every two months Cron hitt...!!!");

//             // Update the nextDue_date to current date + 2 months
//             const nextDueDatePlusTwoMonths = new Date(currentDate);
//             nextDueDatePlusTwoMonths.setMonth(
//               nextDueDatePlusTwoMonths.getMonth() + 2
//             );

//             entry.nextDue_date = nextDueDatePlusTwoMonths
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date
//             console.log("Every two months Cron end...!!!");
//             // Save the changes to the database
//             await tenant.save();

//             //post data static after cron run for the Every two months ----------------------------------------
//             const rentalAdress = tenant.entries[0].rental_adress;
//             const propertyId = tenant.entries[0].property_id;
//             const unit = tenant.entries[0].rental_units;
//             const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await PaymentCharges.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Last Month's Rent",
//                 account: "Last Month's Rent",
//                 amount: tenant.entries[0].amount,
//                 rental_adress: rentalAdress,
//                 tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                 tenant_id: tenant._id,
//                 memo: "Last Month's Rent",
//                 date: currentDate,
//                 month_year: `${currentDate.split("-")[1]}-${
//                   currentDate.split("-")[0]
//                 }`,
//                 rent_cycle: "Every two months", // Change this accordingly
//               });

//               try {
//                 await existingEntry.save(); // Save the updated entry
//                 console.log(
//                   "Data appended to an existing entry in payment-charges collection."
//                 );
//                 await logToDatabase("Success", `Rent Every two months`);
//               } catch (error) {
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "Last Month's Rent",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Every two months", // Change this accordingly
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 console.log("Data saved to payment-charges collection.");
//                 await logToDatabase("Success", `Rent Every two months`);
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//               }
//             }
//             //post data static after cron run for the Every two months end----------------------------------------
//           }

//           // Every Two Week cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate && // Ensure these dates exist
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Every two weeks"
//           ) {
//             console.log("Every two weeks Cron hitt...!!!");

//             // Update the nextDue_date to current date + 2 weeks
//             const nextDueDatePlusTwoWeeks = new Date(currentDate);
//             nextDueDatePlusTwoWeeks.setDate(
//               nextDueDatePlusTwoWeeks.getDate() + 14
//             );

//             entry.nextDue_date = nextDueDatePlusTwoWeeks
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date
//             console.log("Every two weeks Cron end...!!!");
//             // Save the changes to the database
//             await tenant.save();

//             //post data static after cron run for the Every two weeks ----------------------------------------
//             const rentalAdress = tenant.entries[0].rental_adress;
//             const propertyId = tenant.entries[0].property_id;
//             const unit = tenant.entries[0].rental_units;
//             const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await PaymentCharges.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Last Month's Rent",
//                 account: "Last Month's Rent",
//                 amount: tenant.entries[0].amount,
//                 rental_adress: rentalAdress,
//                 tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                 tenant_id: tenant._id,
//                 memo: "Last Month's Rent",
//                 date: currentDate,
//                 month_year: `${currentDate.split("-")[1]}-${
//                   currentDate.split("-")[0]
//                 }`,
//                 rent_cycle: "Every two weeks", // Change this accordingly
//               });

//               try {
//                 await existingEntry.save(); // Save the updated entry
//                 await logToDatabase("Success", `Rent Every two months`);
//                 console.log(
//                   "Data appended to an existing entry in payment-charges collection."
//                 );
//               } catch (error) {
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "Last Month's Rent",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Every two weeks", // Change this accordingly
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 await logToDatabase("Success", `Rent Every two months`);
//                 console.log("Data saved to payment-charges collection.");
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//               }
//             }
//             //post data static after cron run for the Every two weeks end----------------------------------------
//           }

//           // quarterly cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate && // Ensure these dates exist
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Quarterly"
//           ) {
//             console.log("Quarterly Cron hitt...!!!");

//             // Update the nextDue_date to current date + 3 months
//             const nextDueDatePlusThreeMonths = new Date(currentDate);
//             nextDueDatePlusThreeMonths.setMonth(
//               nextDueDatePlusThreeMonths.getMonth() + 3
//             );

//             entry.nextDue_date = nextDueDatePlusThreeMonths
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date

//             console.log("Quarterly Cron end...!!!");
//             // Save the changes to the database
//             await tenant.save();

//             //post data static after cron run for the monthly ----------------------------------------
//             const rentalAdress = tenant.entries[0].rental_adress;
//             const propertyId = tenant.entries[0].property_id;
//             const unit = tenant.entries[0].rental_units;
//             const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await PaymentCharges.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Last Month's Rent",
//                 account: "Last Month's Rent",
//                 amount: tenant.entries[0].amount,
//                 rental_adress: rentalAdress,
//                 tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                 tenant_id: tenant._id,
//                 memo: "Last Month's Rent",
//                 date: currentDate,
//                 month_year: `${currentDate.split("-")[1]}-${
//                   currentDate.split("-")[0]
//                 }`,
//                 rent_cycle: "Quarterly", // Change this accordingly
//               });

//               try {
//                 await existingEntry.save(); // Save the updated entry
//                 await logToDatabase("Success", `Rent Quarterly`);
//                 console.log(
//                   "Data appended to an existing entry in payment-charges collection."
//                 );
//               } catch (error) {
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "Last Month's Rent",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Quarterly", // Change this accordingly
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 await logToDatabase("Success", `Rent Quarterly`);
//                 console.log("Data saved to payment-charges collection.");
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//               }
//             }
//             //post data static after cron run for the monthly end----------------------------------------
//           }

//           // Yearly cronjob condition
//           if (
//             startDate &&
//             endDate &&
//             nextDueDate &&
//             currentDate >= startDate &&
//             currentDate <= endDate &&
//             currentDate === nextDueDate &&
//             rentCycle === "Yearly"
//           ) {
//             console.log("Yearly Cron hitt...!!!");

//             // Update the nextDue_date to current date + 1 year
//             const nextDueDatePlusOneYear = new Date(currentDate);
//             nextDueDatePlusOneYear.setFullYear(
//               nextDueDatePlusOneYear.getFullYear() + 1
//             );

//             entry.nextDue_date = nextDueDatePlusOneYear
//               .toISOString()
//               .split("T")[0]; // Update nextDue_date

//             console.log("Yearly Cron end...!!!");
//             // Save the changes to the database
//             await tenant.save();

//             //post data static after cron run for the Weekly ----------------------------------------
//             const rentalAdress = tenant.entries[0].rental_adress;
//             const propertyId = tenant.entries[0].property_id;
//             const unit = tenant.entries[0].rental_units;
//             const unitId = tenant.entries[0].unit_id;

//             const existingEntry = await PaymentCharges.findOne({
//               "properties.rental_adress": rentalAdress,
//               "properties.property_id": propertyId,
//               "unit.unit": unit,
//               "unit.unit_id": unitId,
//             });

//             if (existingEntry) {
//               // Entry exists, add payment information to existing entry
//               existingEntry.unit[0].paymentAndCharges.push({
//                 type: "Charge",
//                 charge_type: "Last Month's Rent",
//                 account: "Last Month's Rent",
//                 amount: tenant.entries[0].amount,
//                 rental_adress: rentalAdress,
//                 tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                 tenant_id: tenant._id,
//                 memo: "Last Month's Rent",
//                 date: currentDate,
//                 month_year: `${currentDate.split("-")[1]}-${
//                   currentDate.split("-")[0]
//                 }`,
//                 rent_cycle: "Yearly", // Change this accordingly
//               });

//               try {
//                 await existingEntry.save(); // Save the updated entry
//                 await logToDatabase("Success", `Rent Yearly`);
//                 console.log(
//                   "Data appended to an existing entry in payment-charges collection."
//                 );
//               } catch (error) {
//                 await logToDatabase("Success", `Rent Yearly`);
//                 console.error(
//                   "Error appending data to an existing entry:",
//                   error
//                 );
//               }
//             } else {
//               // Entry doesn't exist, create a new entry
//               const postData = {
//                 properties: {
//                   rental_adress: rentalAdress,
//                   property_id: propertyId,
//                 },
//                 unit: [
//                   {
//                     unit: unit,
//                     unit_id: unitId,
//                     paymentAndCharges: [
//                       {
//                         type: "Charge",
//                         charge_type: "Last Month's Rent",
//                         account: "Last Month's Rent",
//                         amount: tenant.entries[0].amount,
//                         rental_adress: rentalAdress,
//                         tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
//                         tenant_id: tenant._id,
//                         memo: "Last Month's Rent",
//                         date: currentDate,
//                         month_year: `${currentDate.split("-")[1]}-${
//                           currentDate.split("-")[0]
//                         }`,
//                         rent_cycle: "Yearly",
//                       },
//                     ],
//                   },
//                 ],
//               };

//               try {
//                 const paymentCharge = new PaymentCharges(postData);
//                 await paymentCharge.save(); // Save the new entry
//                 await logToDatabase("Success", `Rent Yearly`);
//                 console.log("Data saved to payment-charges collection.");
//               } catch (error) {
//                 console.error(
//                   "Error saving data to payment-charges collection:",
//                   error
//                 );
//               }
//             }
//           }
//         });
    
//       await Cronjobs.updateOne(
//         { _id: cronjobs[0]._id },
//         { isCronjobRunning: false }
//       );
//       //console.log("cron updated to false");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     await logToDatabase("Failure", `Rent`, error.message);
//   }
// });

module.exports = router;