import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export const sendSlackNotification = async (email: any) => {
  if (!SLACK_WEBHOOK_URL) {
    console.error("Slack webhook URL not set in environment variables");
    return;
  }

  try {
    const message = {
      text: `📧 New Interested Email!\n*Subject:* ${email.subject}\n*From:* ${email.from}\n*Date:* ${email.date}`,
    };
    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log("Slack notification sent!");
  } catch (err: unknown) {
    if (err instanceof Error) console.error("Error sending Slack notification:", err.message);
    else console.error("Error sending Slack notification:", err);
  }
};
