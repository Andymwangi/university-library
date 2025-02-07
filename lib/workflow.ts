import emailjs from "@emailjs/browser";
import config from "@/lib/config";

type EmailParams = {
  email: string;
  templateId: string;
  templateParams: {
    user_name: string;
    user_email: string;
  };
};

export const sendEmail = async ({ email, templateId, templateParams }: EmailParams) => {
  try {
    await emailjs.send(
      config.env.emailjs.serviceId,
      templateId,
      {
        user_name: templateParams.user_name,
        user_email: templateParams.user_email,
      },
      config.env.emailjs.userId
    );
    console.log(`Email sent to ${email} using template ${templateId}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
