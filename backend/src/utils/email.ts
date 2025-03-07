import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using configured transport
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Mail options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
