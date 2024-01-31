// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.socketlabs.com",
  port: 587,
  secure: false,
  auth: {
    user: "server39897",
    pass: "c9J3Wwm5N4Bj",
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
