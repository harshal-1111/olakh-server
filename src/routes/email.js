require('dotenv').config();

const nodemailer = require('nodemailer');

// Create a transporter using your business email provider's SMTP settings
function sending_mail(var_to, var_sub, var_text) {
  console.log('inside ');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Set up the email data
  const mailOptions = {
    from: 'info@homiedeveloper.com',
    to: var_to,
    subject: var_sub,
    text: var_text
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred:', error.message);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
}

module.exports = sending_mail;
