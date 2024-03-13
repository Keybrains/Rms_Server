var express = require("express");
var router = express.Router();
var Cronjobs = require("../../../modals/superadmin/Cronjobs");
var LateFee = require("../../../modals/payment/Latefee");
const Payment = require("../../../modals/payment/Payment");
const Charge = require("../../../modals/superadmin/Charge");
const cron = require("node-cron");
var axios = require("axios");
var moment = require("moment");
const nodemailer = require("nodemailer");
const Latefee = require("../../../modals/payment/Latefee");
const Leasing = require("../../../modals/superadmin/Leasing");

const transporter = nodemailer.createTransport({
  host: "smtp.sparkpostmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "SMTP_Injection",
    pass: "3a634e154f87fb51dfd179b5d5ff6d771bf03240",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//shedule payment for nmi transaction
cron.schedule("07 15 * * *", async () => {
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
      console.log("fetchedchargespayaments-----------",fetchedchargespayaments)
      if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
        for (const charge of fetchedchargespayaments) {
          console.log("charge-----------",charge)
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
                  paymentDetails: charge,
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
                      );

                      return !!foundUnit;
                    }
                  );
                  console.log("unit to update", unitToUpdate);
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
                      entry: [
                        {
                          charge_type: "Rent Late Fee",
                          account: "Rent Late Fee",
                          amount: charge.amount * (adminLateFee.late_fee / 100),
                          memo: "Late fee for Rent",
                          date: currentDate,
                          rent_cycle: "Monthly",
                          is_paid: false,
                          is_repeatable: false,
                        },
                      ],
                      total_amount:
                        charge.amount * (adminLateFee.late_fee / 100),
                      uploaded_file: [],
                      createdAt: currentDate,
                      updatedAt: currentDate,
                      is_delete: false,
                    };

                    // Make POST request to /charge endpoint
                    await axios.post(
                      "https://saas.cloudrentalmanager.com/api/charge/charge",
                      lateFeeRecord
                    );

                    console.log("Late fee added to the payment details.");
                    // Update the specific charge's islatefee to true in the fetched data
                    unitToUpdate.entry[foundUnitIndex].is_lateFee = true;
                    await Charge.updateOne(
                      { _id: unitToUpdate._id },
                      { entry: unitToUpdate.entry }
                    );
                    console.log("Updated islatefee to true for the charge.");
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

//cron job for charge rent on each rent cycle
cron.schedule("26 15 * * *", async () => {
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
      const tenants = await Leasing.find();

      tenants.forEach(async (entry) => {
        const startDate = entry.start_date
          ? new Date(entry.start_date).toISOString().split("T")[0]
          : null;
        const endDate = entry.end_date
          ? new Date(entry.end_date).toISOString().split("T")[0]
          : null;
        const nextDueDate = entry.entry[0].date
          ? new Date(entry.entry[0].date).toISOString().split("T")[0]
          : null;
        const rentCycle = entry.entry[0].rent_cycle;
        // const paymentMethod = entry.paymentMethod;
        console.log(
          "start-end-due",
          startDate + " " + endDate + " " + nextDueDate + " " + rentCycle
        );

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
          console.log("--------------------------", nextDueDatePlusOneMonth);

          entry.entry[0].date = nextDueDatePlusOneMonth
            .toISOString()
            .split("T")[0];

          console.log("Monthly Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Monthly",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
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
          //paymentMethod === "Manually"
        ) {
          // Update the nextDue_date to current date
          const nextDueDatePlusOneWeek = new Date(currentDate);
          nextDueDatePlusOneWeek.setDate(nextDueDatePlusOneWeek.getDate() + 7);

          console.log("Weekly Cron hitt...!!!");
          entry.entry[0].date = nextDueDatePlusOneWeek
            .toISOString()
            .split("T")[0];

          console.log("Monthly Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Weekly",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
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
          //paymentMethod === "Manually"
        ) {
          // Update the nextDue_date to current date + 1 day
          const nextDueDatePlusOneDay = new Date(currentDate);
          nextDueDatePlusOneDay.setDate(nextDueDatePlusOneDay.getDate() + 1);
          console.log("--------------------------", nextDueDatePlusOneDay);

          entry.entry[0].date = nextDueDatePlusOneDay
            .toISOString()
            .split("T")[0];

          console.log("Daily Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Daily",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
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
          //paymentMethod === "Manually"
        ) {
          // Update the nextDue_date to current date + 1 month
          const nextDueDatePlusTwoMonths = new Date(currentDate);
          nextDueDatePlusTwoMonths.setMonth(
            nextDueDatePlusTwoMonths.getMonth() + 2
          );
          console.log("--------------------------", nextDueDatePlusTwoMonths);

          entry.entry[0].date = nextDueDatePlusTwoMonths
            .toISOString()
            .split("T")[0];

          console.log("Every two months Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Every two months",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
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
          //paymentMethod === "Manually"
        ) {
          // Update the nextDue_date to current date + 1 month
          const nextDueDatePlusTwoWeeks = new Date(currentDate);
          nextDueDatePlusTwoWeeks.setDate(
            nextDueDatePlusTwoWeeks.getDate() + 14
          );
          console.log("--------------------------", nextDueDatePlusTwoWeeks);

          entry.entry[0].date = nextDueDatePlusTwoWeeks
            .toISOString()
            .split("T")[0];

          console.log("Every two weeks Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Every two weeks",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
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
          //paymentMethod === "Manually"
        ) {
          // Update the nextDue_date to current date + 1 month
          const nextDueDatePlusThreeMonths = new Date(currentDate);
          nextDueDatePlusThreeMonths.setMonth(
            nextDueDatePlusThreeMonths.getMonth() + 3
          );
          console.log("--------------------------", nextDueDatePlusThreeMonths);

          entry.entry[0].date = nextDueDatePlusThreeMonths
            .toISOString()
            .split("T")[0];

          console.log("Quarterly Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Quarterly",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
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
          //paymentMethod === "Manually"
        ) {
          // Update the nextDue_date to current date + 1 month
          const nextDueDatePlusOneYear = new Date(currentDate);
          nextDueDatePlusOneYear.setFullYear(
            nextDueDatePlusOneYear.getFullYear() + 1
          );
          console.log("--------------------------", nextDueDatePlusOneYear);

          entry.entry[0].date = nextDueDatePlusOneYear
            .toISOString()
            .split("T")[0];

          console.log("Yearly Cron end...!!!");
          // Save the changes to the database
          await entry.save();
          const postData = {
            admin_id: entry.admin_id,
            tenant_id: entry.tenant_id,
            lease_id: entry.lease_id,
            type: "Charge",
            entry: [
              {
                charge_type: "Rent",
                account: "Last Month's Rent",
                amount: entry.entry[0].amount,
                memo: "Last Month's Rent",
                date: currentDate,
                rent_cycle: "Yearly",
                islatefee: false,
                is_paid: false,
                is_repeatable: false,
              },
            ],
            total_amount: entry.entry[0].amount,
            uploaded_file: [],
          };

          try {
            await axios.post(
              "https://saas.cloudrentalmanager.com/api/charge/charge",
              postData
            ); // Save the new entry
            console.log("Data charges collection.");
            // await logToDatabase("Success", `Rent Monthly`);
          } catch (error) {
            console.error(
              "Error saving data to payment-charges collection:",
              error
            );
            // await logToDatabase("Failure", `Rent Monthly`);
          }
        }
      });

      await Cronjobs.updateOne(
        { _id: cronjobs[0]._id },
        { isCronjobRunning: false }
      );
      //console.log("cron updated to false");
    }
  } catch (error) {
    console.error("Error:", error);
    // await logToDatabase("Failure", `Rent`, error.message);
  }
});

//reminder mails cron job
cron.schedule("14 17 * * *", async () => {
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
      const fetchedchargespayaments = await Leasing.find();
      let details;

      if (fetchedchargespayaments && fetchedchargespayaments.length > 0) {
        for (const charge of fetchedchargespayaments) {
              if (
                charge.end_date &&
                charge.tenant_id
              ) {

                try {
                  const res = await axios.get(
                    `https://saas.cloudrentalmanager.com/api/tenants/tenant_details/${charge.tenant_id}`
                  ); // Save the new entry
                  console.log("Data charges collection.",res.data);
                   details = res.data.data;
                  // await logToDatabase("Success", `Rent Monthly`);
                } catch (error) {
                  console.error(
                    "Error saving data to payment-charges collection:",
                    error
                  );
                  // await logToDatabase("Failure", `Rent Monthly`);
                }
                const chargeDate = new Date(charge.end_date);
                const differenceInTime = Math.abs(
                  chargeDate - new Date(currentDate)
                );
                const differenceInDays = Math.ceil(
                  differenceInTime / (1000 * 60 * 60 * 24)
                );
                  console.log("details",details)
                if (differenceInDays > 3) {
                  console.log("Mail Sent");
                  const info = await transporter.sendMail({
                    from: '"302 Properties" <info@cloudpress.host>',
                    to: details[0].tenant_email,
                    subject: "Lease End Reminder - 302 Properties",
                    html: `     
                      <p>Hello ${details[0].tenant_firstName} ${details[0].tenant_lastName},</p>
                
                      <p>We are pleased to inform you that your lease will end on ${details[0].end_date}.</p>

                      <p>Thank you for choosing 302 Properties. If you have any further questions or concerns, feel free to contact our customer support.</p>
                
                      <p>Best regards,<br>
                      The 302 Properties Team</p>
                    `,
                  });
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
