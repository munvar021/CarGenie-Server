import nodemailer from "nodemailer";

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 3,
  });

  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Connection Failed:", error);
        reject(error);
      } else {
        console.log("SMTP Connection Established");
        resolve(transporter);
      }
    });
  });
};

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: {
        name: "CarGenie",
        address: process.env.EMAIL_USER,
      },
      to,
      subject,
      html,
      headers: {
        "X-Priority": "high",
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully. Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
};
