import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";  // Import the sendEmail function

type UserState = "non-active" | "active";

type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

// Function to get the user state based on their activity
const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (timeDifference > THREE_DAYS_IN_MS && timeDifference <= THIRTY_DAYS_IN_MS) {
    return "non-active";
  }

  return "active";
};

// Main handler for the email workflow
export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // Send the welcome email dynamically
  await context.run("new-signup", async () => {
    const message = `
      <html>
        <div>Hello ${fullName},</div>
        <div>We are excited to welcome you to the platform! Explore our vast collection of books and get started today.</div>
        <div>Visit your <a href="https://bookwise-libraryapp.vercel.app/">dashboard</a> to begin.</div>
      </html>
    `;
    await sendEmail({
      email,
      subject: "Welcome to the Platform",
      message,
      template_params: {
        fullName, // Dynamic user's full name
        welcome: true, // Flag for welcome email
        dashboardUrl: "https://bookwise-libraryapp.vercel.app/", // Link to user's dashboard
      },
    });
  });

  // Wait for 3 days before checking user activity
  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  // Continuous loop to check user activity and send appropriate emails
  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email); // Check if the user is active or non-active
    });

    // If user is non-active
    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        const message = `
          <html>
            <div>Hello ${fullName},</div>
            <div>We miss you! Come back and check out our latest updates. Your dashboard is waiting for you!</div>
            <div><a href="https://bookwise-libraryapp.vercel.app/">Go to your dashboard</a></div>
          </html>
        `;
        await sendEmail({
          email,
          subject: "Are you still there?",
          message,
          template_params: {
            fullName, // User's full name
            welcome: false, // Flag to differentiate this email type
            dashboardUrl: "https://bookwise-libraryapp.vercel.app/", // Link to the dashboard
            reengage: true, // Optional flag for re-engagement emails
          },
        });
      });
    } 
    // If user is active
    else if (state === "active") {
      await context.run("send-email-active", async () => {
        const message = `
          <html>
            <div>Welcome back ${fullName}!</div>
            <div>We're thrilled to have you back. Check out what's new on the platform.</div>
            <div><a href="https://bookwise-libraryapp.vercel.app/">Go to your dashboard</a></div>
          </html>
        `;
        await sendEmail({
          email,
          subject: "Welcome back!",
          message,
          template_params: {
            fullName, // User's full name
            welcome: false, // Flag for this email type
            dashboardUrl: "https://bookwise-libraryapp.vercel.app/", // Link to the dashboard
            reengage: false, // Optional flag for re-engagement emails
          },
        });
      });
    }

    // Wait for 1 month before checking again
    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});
