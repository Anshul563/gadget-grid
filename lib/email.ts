import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail
    pass: process.env.GMAIL_APP_PASSWORD, // App Password
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  return transporter.sendMail({
    from: '"GadgetGrid" <your-email@gmail.com>',
    to,
    subject,
    html,
  });
};