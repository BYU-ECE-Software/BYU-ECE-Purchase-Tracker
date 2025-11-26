// src/sendMail.js
import transporter from './mailer.js';
import nodemailer from 'nodemailer';

export default async function sendMail({ to, subject, text, html, attachments }) {
  try {
    const from = process.env.FROM_NAME? `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>` : process.env.FROM_EMAIL;
    const mailOptions = {
      from: from,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    // For test SMTP accounts (like Ethereal), this gives you a preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
