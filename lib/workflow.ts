// lib/workflow.ts
import axios from "axios";
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
    const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: config.env.emailjs.serviceId,
      template_id: templateId,
      user_id: config.env.emailjs.userId,
      template_params: {
        ...templateParams,
        to_email: email,  // Include recipient email if required by your template
      },
    });
    console.log("Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
