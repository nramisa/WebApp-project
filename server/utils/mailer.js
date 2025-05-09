const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // e.g. smtp.sendgrid.net
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  const mailOptions = {
    from: `"PitchIn AI" <${process.env.EMAIL_FROM}>`,
    to:   toEmail,
    subject: 'Please verify your PitchIn account',
    html: `
      <p>Welcome to PitchIn! Please verify your email by clicking below:</p>
      <a href="${verifyUrl}">Verify My Account</a>
      <p>If you didn’t sign up, you can ignore this email.</p>
    `
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
