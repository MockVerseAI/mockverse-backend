import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import logger from "../logger/winston.logger.js";
import { ApiError } from "./ApiError.js";

/**
 * Interface for email sending options
 */
interface EmailOptions {
  email: string;
  subject: string;
  mailgenContent: Mailgen.Content;
}

/**
 * Sends an email using nodemailer
 * @param options - The email options including recipient, subject, and content
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Initialize mailgen instance with default theme and brand configuration
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "MockVerse",
      link: "https://mockverse.me",
    },
  });

  // For more info on how mailgen content work visit https://github.com/eladnava/mailgen#readme
  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // Create a nodemailer transporter instance which is responsible to send a mail
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    secure: true,
    port: 465,
    auth: {
      user: "resend",
      pass: process.env.RESEND_API_KEY,
    },
  });

  const mail = {
    from: "MockVerse <admin@info.mockverse.me>",
    to: options.email, // receiver's mail
    subject: options.subject, // mail subject
    text: emailTextual, // mailgen content textual variant
    html: emailHtml, // mailgen content html variant
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    logger.error(
      "Email service failed silently. Make sure you have provided your credentials in the .env file",
      error
    );
    throw new ApiError(500, "Failed to send email");
  }
};

/**
 * Generates content for email verification emails
 * @param username - The username of the recipient
 * @param verificationUrl - The URL for email verification
 * @returns Mailgen content for the email
 */
const emailVerificationMailgenContent = (
  username: string,
  verificationUrl: string
): Mailgen.Content => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button:",
        button: {
          color: "#3d61ff", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

/**
 * Generates content for password reset emails
 * @param username - The username of the recipient
 * @param passwordResetUrl - The URL for password reset
 * @returns Mailgen content for the email
 */
const forgotPasswordMailgenContent = (
  username: string,
  passwordResetUrl: string
): Mailgen.Content => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of our account",
      action: {
        instructions:
          "To reset your password click on the following button or link:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
