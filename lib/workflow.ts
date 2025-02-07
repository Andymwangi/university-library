
import config from "@/lib/config";
 import fetch from 'node-fetch';

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
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: config.env.emailjs.serviceId,
        template_id: templateId,
        user_id: config.env.emailjs.userId,
        template_params: {
          ...templateParams,
          to_email: email, // ensure this field is what your EmailJS template expects, if needed
        },
      }),
    });

   
    if (!response.ok) {
      const errorText = await response.text(); 
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log("Email sent successfully"); 
    return { success: true, message: "Email sent successfully" }; 
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error}; 
  }
};
