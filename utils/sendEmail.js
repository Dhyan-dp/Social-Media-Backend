import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

export const sendActivationEmail = async (email, activationLink) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SocialMedia App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Activate your account',
    html: `<p>Click the link below to activate your account:</p>
           <a href="${activationLink}">${activationLink}</a>`,
  });
};
