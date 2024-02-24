// emailService.js
const nodemailer = require("nodemailer");

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

async function sendWelcomeEmail(toEmail, subject, htmlContent) {
  const info = await transporter.sendMail({
    from: '"donotreplay" <info@cloudpress.host>',
    to: toEmail,
    subject: subject,
    html: htmlContent,
  });
}

module.exports = {
  sendWelcomeEmail,
};
