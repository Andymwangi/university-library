import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import axios from "axios";
import config from "@/lib/config";

// Function to fetch the user by email
const getUserByEmail = async (email: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user.length > 0 ? user[0] : null;
};

// Updated sendEmail function to include the user's full name dynamically
export const sendEmail = async ({
  email,
  subject,
  message,
  template_params,  // Additional dynamic parameters for the template
}: {
  email: string;
  subject: string;
  message: string;
  template_params: Record<string, any>;  // Additional dynamic params
}) => {
  const user = await getUserByEmail(email);

  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  const fullName = user.fullName; // Fetch user’s full name from the database

  try {
    const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: config.env.emailjs.serviceId,
      template_id: config.env.emailjs.templateId,
      user_id: config.env.emailjs.publicKey,  // Correct EmailJS user ID (publicKey)
      template_params: {
        to_email: email,  // Dynamic recipient email
        fullName: fullName, // Inject user's full name dynamically
        subject: subject,  // Dynamic email subject
        message: message,  // Dynamic email message (HTML content)
        ...template_params,  // Spread any additional dynamic params from the call
      },
    });

    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
