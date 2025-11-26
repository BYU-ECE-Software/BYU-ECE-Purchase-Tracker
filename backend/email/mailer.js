// src/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify connection configuration (optional but useful)
transporter.verify(function(error, success) {
    console.log("Verifying mailer transporter...");
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`SMTP Secure: ${process.env.SMTP_SECURE}`);
  if (error) {
    console.error('Mailer transporter verification failed:', error);
  } else {
    console.log('Mailer transporter is ready to send emails');
  }
});

export default transporter;
