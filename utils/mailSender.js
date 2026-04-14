const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("Server is ready to take messages");
  } catch (err) {
    console.error("Verification failed:", err);
  }
};

const sendMail = async ({ email, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: '"StudyNotion Team" <aditya154919@gmail.com>',
      to: email,
      subject: subject,
      html: html || `<p>${text}</p>`,
    });

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};

module.exports = {
  transporter,
  sendMail,
  verifyTransporter,
};