// lib/workflow.ts
import emailjs from "@emailjs/browser";
import config from "@/lib/config";

type SendEmailParams = {
  email: string;
  templateId: string;
  templateParams: {
    user_name: string;
    user_email: string;
    subject: string;
    message: string;
  };
};

export const sendEmail = async ({
  email,
  templateId,
  templateParams,
}: SendEmailParams) => {
  try {
    const response = await emailjs.send(
      config.env.emailjs.serviceId,
      templateId,
      {
        user_name: templateParams.user_name,
        user_email: templateParams.user_email,
        subject: templateParams.subject,
        message: templateParams.message,
      },
      config.env.emailjs.userId
    );
    console.log(`Email sent successfully to ${email} using template ${templateId}:`, response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
