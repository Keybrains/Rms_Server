var express = require("express");
var router = express.Router();
var Tenants = require("../../modals/Tenants");
var CronjobLog = require("../../modals/CronjobLog");
var Rentals = require("../../modals/Rentals");
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../../authentication");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
//var moment = require("moment");
const moment = require("moment-timezone");
const cron = require("node-cron");
const PaymentCharges = require("../../modals/AddPaymentAndCharge");
var NmiPayment = require("../../modals/NmiPayment");
var Cronjobs = require("../../modals/cronjobs");
const axios = require("axios");

async function logToDatabase(status, cronjob_type, date, reason = null) {
  try {
    const usaDate = moment(date).tz("America/New_York").format();
    const log = new CronjobLog({
      status,
      cronjob_type,
      reason,
      date: usaDate,
    });
    await log.save();
  } catch (error) {
    console.error("Error logging to database:", error);
  }
}

//shedule payment for nmi transaction
cron.schedule("18 17 * * *", async () => {
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
      const fetchedchargespayaments = await NmiPayment.find({
        status: "Pending",
        paymentType: "Credit Card",
        date: currentDate,
      });
      if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
        for (const charge of fetchedchargespayaments) {
          if (
            charge.status === "Pending" &&
            charge.paymentType === "Credit Card"
          ) {
            const chargeDate = new Date(charge.date)
              .toISOString()
              .split("T")[0];

            if (chargeDate === currentDate) {
              let id = charge._id;

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

//cron job for the late fee for unpaid rent charge
cron.schedule("25 16 * * *", async () => {
  const cronjobs = await Cronjobs.find();
  const isCronjobRunning = cronjobs[0].isCronjobRunning;
  try {
    //const current = new Date();

    if (isCronjobRunning === false) {
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: true }
      );
      console.log("Cron hitt...!!!");
      const currentDate = new Date().toISOString().split("T")[0];
      const fetchedchargespayaments = await PaymentCharges.find();
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
                    if (differenceInDays > 5) {
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
                          rent_cycle: "Monthly", // Change this accordingly
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

//rent cron job
cron.schedule("40 17 * * *", async () => {
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
      const tenants = await Tenants.find();

      tenants.forEach(async (tenant) => {
        tenant.entries.forEach(async (entry) => {
          const startDate = entry.start_date
            ? new Date(entry.start_date).toISOString().split("T")[0]
            : null;
          const endDate = entry.end_date
            ? new Date(entry.end_date).toISOString().split("T")[0]
            : null;
          const nextDueDate = entry.nextDue_date
            ? new Date(entry.nextDue_date).toISOString().split("T")[0]
            : null;
          const rentCycle = entry.rent_cycle;
          const paymentMethod = entry.paymentMethod;
          console.log(
            "start-end-due",
            startDate + " " + endDate + " " + nextDueDate + " " + paymentMethod
          );
          // console.log("currentDate", currentDate);
          // console.log("rentCycle", rentCycle);
          // console.log(" Cron middle hitt ...!!!");

          // Monthly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Monthly"
            //paymentMethod === "Manually"
          ) {
            // Update the nextDue_date to current date + 1 month
            const nextDueDatePlusOneMonth = new Date(currentDate);
            nextDueDatePlusOneMonth.setMonth(
              nextDueDatePlusOneMonth.getMonth() + 1
            );

            entry.nextDue_date = nextDueDatePlusOneMonth
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Monthly Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the monthly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Monthly", // Change this accordingly
                islatefee: false, // Change this accordingly
              });

              try {
                await existingEntry.save();
                await logToDatabase("Success", `Rent Monthly`);
              } catch (error) {
                await logToDatabase("Failure", `Rent Monthly`);
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "test",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Monthly", // Change this accordingly
                        islatefee: false, // Change this accordingly
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                console.log("Data saved to payment-charges collection.");
                await logToDatabase("Success", `Rent Monthly`);
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
                await logToDatabase("Failure", `Rent Monthly`);
              }
            }
          }
          //**************************************************************************************************************************************************************************************************************** */
          // Weekly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Weekly"
          ) {
            console.log("Weekly Cron hitt...!!!");

            // Update the nextDue_date to current date + 1 week
            const nextDueDatePlusOneWeek = new Date(currentDate);
            nextDueDatePlusOneWeek.setDate(
              nextDueDatePlusOneWeek.getDate() + 7
            );

            entry.nextDue_date = nextDueDatePlusOneWeek
              .toISOString()
              .split("T")[0]; // Update nextDue_date
            console.log("Weekly Cron hitt...!!!");
            // Save the changes to the database
            await tenant.save();

            //Data Post Logic Here for Weekly
            //post data static after cron run for the Weekly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Weekly",
              });

              try {
                await existingEntry.save();
                await logToDatabase("Success", `Rent Weekly`);
                console.log(
                  "Data appended to an existing entry in payment-charges collection."
                );
              } catch (error) {
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "Last Month's Rent",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Weekly", // Change this accordingly
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                console.log("Data saved to payment-charges collection.");
                await logToDatabase("Success", `Rent Weekly`);
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
              }
            }
          }

          // Daily cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Daily"
          ) {
            console.log("Daily Cron hitt...!!!");

            // Update the nextDue_date to current date + 1 day
            const nextDueDatePlusOneDay = new Date(currentDate);
            nextDueDatePlusOneDay.setDate(nextDueDatePlusOneDay.getDate() + 1);

            entry.nextDue_date = nextDueDatePlusOneDay
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Daily Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Daily ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Daily", // Change this accordingly
              });

              try {
                await existingEntry.save();
                await logToDatabase("Success", `Rent Daily`);
                console.log(
                  "Data appended to an existing entry in payment-charges collection."
                );
              } catch (error) {
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "Last Month's Rent",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Daily", // Change this accordingly
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                console.log("Data saved to payment-charges collection.");
                await logToDatabase("Success", `Rent Daily`);
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
              }
            }
            //post data static after cron run for the Daily end----------------------------------------
          }

          // Every Two months cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Every two months"
          ) {
            console.log("Every two months Cron hitt...!!!");

            // Update the nextDue_date to current date + 2 months
            const nextDueDatePlusTwoMonths = new Date(currentDate);
            nextDueDatePlusTwoMonths.setMonth(
              nextDueDatePlusTwoMonths.getMonth() + 2
            );

            entry.nextDue_date = nextDueDatePlusTwoMonths
              .toISOString()
              .split("T")[0]; // Update nextDue_date
            console.log("Every two months Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Every two months ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Every two months", // Change this accordingly
              });

              try {
                await existingEntry.save(); // Save the updated entry
                console.log(
                  "Data appended to an existing entry in payment-charges collection."
                );
                await logToDatabase("Success", `Rent Every two months`);
              } catch (error) {
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "Last Month's Rent",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Every two months", // Change this accordingly
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                console.log("Data saved to payment-charges collection.");
                await logToDatabase("Success", `Rent Every two months`);
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
              }
            }
            //post data static after cron run for the Every two months end----------------------------------------
          }

          // Every Two Week cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Every two weeks"
          ) {
            console.log("Every two weeks Cron hitt...!!!");

            // Update the nextDue_date to current date + 2 weeks
            const nextDueDatePlusTwoWeeks = new Date(currentDate);
            nextDueDatePlusTwoWeeks.setDate(
              nextDueDatePlusTwoWeeks.getDate() + 14
            );

            entry.nextDue_date = nextDueDatePlusTwoWeeks
              .toISOString()
              .split("T")[0]; // Update nextDue_date
            console.log("Every two weeks Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Every two weeks ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Every two weeks", // Change this accordingly
              });

              try {
                await existingEntry.save(); // Save the updated entry
                await logToDatabase("Success", `Rent Every two months`);
                console.log(
                  "Data appended to an existing entry in payment-charges collection."
                );
              } catch (error) {
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "Last Month's Rent",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Every two weeks", // Change this accordingly
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                await logToDatabase("Success", `Rent Every two months`);
                console.log("Data saved to payment-charges collection.");
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
              }
            }
            //post data static after cron run for the Every two weeks end----------------------------------------
          }

          // quarterly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Quarterly"
          ) {
            console.log("Quarterly Cron hitt...!!!");

            // Update the nextDue_date to current date + 3 months
            const nextDueDatePlusThreeMonths = new Date(currentDate);
            nextDueDatePlusThreeMonths.setMonth(
              nextDueDatePlusThreeMonths.getMonth() + 3
            );

            entry.nextDue_date = nextDueDatePlusThreeMonths
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Quarterly Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the monthly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Quarterly", // Change this accordingly
              });

              try {
                await existingEntry.save(); // Save the updated entry
                await logToDatabase("Success", `Rent Quarterly`);
                console.log(
                  "Data appended to an existing entry in payment-charges collection."
                );
              } catch (error) {
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "Last Month's Rent",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Quarterly", // Change this accordingly
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                await logToDatabase("Success", `Rent Quarterly`);
                console.log("Data saved to payment-charges collection.");
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
              }
            }
            //post data static after cron run for the monthly end----------------------------------------
          }

          // Yearly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate &&
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Yearly"
          ) {
            console.log("Yearly Cron hitt...!!!");

            // Update the nextDue_date to current date + 1 year
            const nextDueDatePlusOneYear = new Date(currentDate);
            nextDueDatePlusOneYear.setFullYear(
              nextDueDatePlusOneYear.getFullYear() + 1
            );

            entry.nextDue_date = nextDueDatePlusOneYear
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Yearly Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Weekly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            const existingEntry = await PaymentCharges.findOne({
              "properties.rental_adress": rentalAdress,
              "properties.property_id": propertyId,
              "unit.unit": unit,
              "unit.unit_id": unitId,
            });

            if (existingEntry) {
              // Entry exists, add payment information to existing entry
              existingEntry.unit[0].paymentAndCharges.push({
                type: "Charge",
                charge_type: "Last Month's Rent",
                account: "Last Month's Rent",
                amount: tenant.entries[0].amount,
                rental_adress: rentalAdress,
                tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                tenant_id: tenant._id,
                memo: "Last Month's Rent",
                date: currentDate,
                month_year: `${currentDate.split("-")[1]}-${
                  currentDate.split("-")[0]
                }`,
                rent_cycle: "Yearly", // Change this accordingly
              });

              try {
                await existingEntry.save(); // Save the updated entry
                await logToDatabase("Success", `Rent Yearly`);
                console.log(
                  "Data appended to an existing entry in payment-charges collection."
                );
              } catch (error) {
                await logToDatabase("Success", `Rent Yearly`);
                console.error(
                  "Error appending data to an existing entry:",
                  error
                );
              }
            } else {
              // Entry doesn't exist, create a new entry
              const postData = {
                properties: {
                  rental_adress: rentalAdress,
                  property_id: propertyId,
                },
                unit: [
                  {
                    unit: unit,
                    unit_id: unitId,
                    paymentAndCharges: [
                      {
                        type: "Charge",
                        charge_type: "Last Month's Rent",
                        account: "Last Month's Rent",
                        amount: tenant.entries[0].amount,
                        rental_adress: rentalAdress,
                        tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                        tenant_id: tenant._id,
                        memo: "Last Month's Rent",
                        date: currentDate,
                        month_year: `${currentDate.split("-")[1]}-${
                          currentDate.split("-")[0]
                        }`,
                        rent_cycle: "Yearly",
                      },
                    ],
                  },
                ],
              };

              try {
                const paymentCharge = new PaymentCharges(postData);
                await paymentCharge.save(); // Save the new entry
                await logToDatabase("Success", `Rent Yearly`);
                console.log("Data saved to payment-charges collection.");
              } catch (error) {
                console.error(
                  "Error saving data to payment-charges collection:",
                  error
                );
              }
            }
          }
        });
      });
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: false }
      );
      //console.log("cron updated to false");
    }
  } catch (error) {
    console.error("Error:", error);
    await logToDatabase("Failure", `Rent`, error.message);
  }
});

//simple test cronjob
cron.schedule("49 5 * * *", async () => {
  try {
    const cronjobs = await Cronjobs.find();
    const isCronjobRunning = cronjobs[0].isCronjobRunning;
    // console.log("isCronjobRunning", isCronjobRunning);

    if (isCronjobRunning === false) {
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: true }
      );

      //here set interveral of 20 sec
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: false }
      );
      //console.log("updated to false");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

//recurring cron job
cron.schedule("55 15 * * *", async () => {
  try {
    const cronjobs = await Cronjobs.find();
    const isCronjobRunning = cronjobs[0].isCronjobRunning;
    if (isCronjobRunning === false) {
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: true }
      );

      console.log("Cron hitt...!!!");
      const currentDate = new Date().toISOString().split("T")[0];

      const tenants = await Tenants.find();

      tenants.forEach(async (tenant) => {
        tenant.entries.forEach(async (entry) => {
          const startDate = entry.start_date
            ? new Date(entry.start_date).toISOString().split("T")[0]
            : null;
          const endDate = entry.end_date
            ? new Date(entry.end_date).toISOString().split("T")[0]
            : null;
          const nextDueDate = entry.nextDue_date
            ? new Date(entry.nextDue_date).toISOString().split("T")[0]
            : null;
          const rentCycle = entry.rent_cycle;
          const paymentMethod = entry.paymentMethod;
          const recurring = entry.recurring_charges;
          console.log(
            "start-end-due",
            startDate + " " + endDate + " " + nextDueDate + " " + paymentMethod
          );
          // console.log("currentDate", currentDate);
          // console.log("rentCycle", rentCycle);
          // console.log(" Cron middle hitt ...!!!");

          // Monthly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Monthly" &&
            //paymentMethod === "Manually"
            recurring.length > 0
          ) {
            // Update the nextDue_date to current date + 1 month
            const nextDueDatePlusOneMonth = new Date(currentDate);
            nextDueDatePlusOneMonth.setMonth(
              nextDueDatePlusOneMonth.getMonth() + 1
            );

            entry.nextDue_date = nextDueDatePlusOneMonth
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Monthly Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the monthly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "recurring cron",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Monthly",
                });

                try {
                  await existingEntry.save();
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "test",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Monthly",
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }
          //**************************************************************************************************************************************************************************************************************** */
          // Weekly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Weekly"
          ) {
            console.log("Weekly Cron hitt...!!!");

            // Update the nextDue_date to current date + 1 week
            const nextDueDatePlusOneWeek = new Date(currentDate);
            nextDueDatePlusOneWeek.setDate(
              nextDueDatePlusOneWeek.getDate() + 7
            );

            entry.nextDue_date = nextDueDatePlusOneWeek
              .toISOString()
              .split("T")[0]; // Update nextDue_date
            console.log("Weekly Cron hitt...!!!");
            // Save the changes to the database
            await tenant.save();

            //Data Post Logic Here for Weekly
            //post data static after cron run for the Weekly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "Last Month's Rent",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Weekly",
                });

                try {
                  await existingEntry.save();
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "Last Month's Rent",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Weekly",
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }

          // Daily cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Daily"
          ) {
            console.log("Daily Cron hitt...!!!");

            // Update the nextDue_date to current date + 1 day
            const nextDueDatePlusOneDay = new Date(currentDate);
            nextDueDatePlusOneDay.setDate(nextDueDatePlusOneDay.getDate() + 1);

            entry.nextDue_date = nextDueDatePlusOneDay
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Daily Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Daily ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "Last Month's Rent",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Daily", // Change this accordingly
                });

                try {
                  await existingEntry.save(); // Save the updated entry
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "Last Month's Rent",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Daily",
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }

          // Every Two months cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Every two months"
          ) {
            console.log("Every two months Cron hitt...!!!");

            // Update the nextDue_date to current date + 2 months
            const nextDueDatePlusTwoMonths = new Date(currentDate);
            nextDueDatePlusTwoMonths.setMonth(
              nextDueDatePlusTwoMonths.getMonth() + 2
            );

            entry.nextDue_date = nextDueDatePlusTwoMonths
              .toISOString()
              .split("T")[0]; // Update nextDue_date
            console.log("Every two months Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Every two months ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "Last Month's Rent",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Every two months",
                });

                try {
                  await existingEntry.save(); // Save the updated entry
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "Last Month's Rent",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Every two months",
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }

          // Every Two Week cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Every two weeks"
          ) {
            console.log("Every two weeks Cron hitt...!!!");

            // Update the nextDue_date to current date + 2 weeks
            const nextDueDatePlusTwoWeeks = new Date(currentDate);
            nextDueDatePlusTwoWeeks.setDate(
              nextDueDatePlusTwoWeeks.getDate() + 14
            );

            entry.nextDue_date = nextDueDatePlusTwoWeeks
              .toISOString()
              .split("T")[0]; // Update nextDue_date
            console.log("Every two weeks Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Every two weeks ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "Last Month's Rent",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Every two weeks",
                });

                try {
                  await existingEntry.save(); // Save the updated entry
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "Last Month's Rent",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Every two weeks",
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }

          // quarterly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Quarterly"
          ) {
            console.log("Quarterly Cron hitt...!!!");

            // Update the nextDue_date to current date + 3 months
            const nextDueDatePlusThreeMonths = new Date(currentDate);
            nextDueDatePlusThreeMonths.setMonth(
              nextDueDatePlusThreeMonths.getMonth() + 3
            );

            entry.nextDue_date = nextDueDatePlusThreeMonths
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Quarterly Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the monthly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "Last Month's Rent",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Quarterly", // Change this accordingly
                });

                try {
                  await existingEntry.save(); // Save the updated entry
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "Last Month's Rent",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Quarterly", // Change this accordingly
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }

          // Yearly cronjob condition
          if (
            startDate &&
            endDate &&
            nextDueDate && // Ensure these dates exist
            currentDate >= startDate &&
            currentDate <= endDate &&
            currentDate === nextDueDate &&
            rentCycle === "Yearly"
          ) {
            console.log("Yearly Cron hitt...!!!");

            // Update the nextDue_date to current date + 1 year
            const nextDueDatePlusOneYear = new Date(currentDate);
            nextDueDatePlusOneYear.setFullYear(
              nextDueDatePlusOneYear.getFullYear() + 1
            );

            entry.nextDue_date = nextDueDatePlusOneYear
              .toISOString()
              .split("T")[0]; // Update nextDue_date

            console.log("Yearly Cron end...!!!");
            // Save the changes to the database
            await tenant.save();

            //post data static after cron run for the Weekly ----------------------------------------
            const rentalAdress = tenant.entries[0].rental_adress;
            const propertyId = tenant.entries[0].property_id;
            const unit = tenant.entries[0].rental_units;
            const unitId = tenant.entries[0].unit_id;

            for (const recurringCharge of recurring) {
              const existingEntry = await PaymentCharges.findOne({
                "properties.rental_adress": rentalAdress,
                "properties.property_id": propertyId,
                "unit.unit": unit,
                "unit.unit_id": unitId,
              });

              if (existingEntry) {
                // Entry exists, add payment information to existing entry
                existingEntry.unit[0].paymentAndCharges.push({
                  type: "Charge",
                  charge_type: "Recurring",
                  account: recurringCharge.recuring_account,
                  amount: recurringCharge.recuring_amount,
                  rental_adress: rentalAdress,
                  tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                  tenant_id: tenant._id,
                  memo: "Last Month's Rent",
                  date: currentDate,
                  month_year: `${currentDate.split("-")[1]}-${
                    currentDate.split("-")[0]
                  }`,
                  rent_cycle: "Yearly", // Change this accordingly
                });

                try {
                  await existingEntry.save(); // Save the updated entry
                  console.log(
                    "Data appended to an existing entry in payment-charges collection."
                  );
                } catch (error) {
                  console.error(
                    "Error appending data to an existing entry:",
                    error
                  );
                }
              } else {
                // Entry doesn't exist, create a new entry
                const postData = {
                  properties: {
                    rental_adress: rentalAdress,
                    property_id: propertyId,
                  },
                  unit: [
                    {
                      unit: unit,
                      unit_id: unitId,
                      paymentAndCharges: [
                        {
                          type: "Charge",
                          charge_type: "Recurring",
                          account: recurringCharge.recuring_account,
                          amount: recurringCharge.recuring_amount,
                          rental_adress: rentalAdress,
                          tenant_firstName: `${tenant.tenant_firstName} ${tenant.tenant_lastName}`,
                          tenant_id: tenant._id,
                          memo: "Last Month's Rent",
                          date: currentDate,
                          month_year: `${currentDate.split("-")[1]}-${
                            currentDate.split("-")[0]
                          }`,
                          rent_cycle: "Yearly",
                        },
                      ],
                    },
                  ],
                };

                try {
                  const paymentCharge = new PaymentCharges(postData);
                  await paymentCharge.save(); // Save the new entry
                  console.log("Data saved to payment-charges collection.");
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                }
              }
            }
          }
        });
      });
      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: false }
      );
      //console.log("cron updated to false");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

module.exports = router;
