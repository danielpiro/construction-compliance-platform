// src/utils/mailgun.ts
import formData from "form-data";
import Mailgun from "mailgun.js";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
    });

    const data = {
      from: "Construction Compliance Platform <noreply@constructioncompliance.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN || "", data);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
