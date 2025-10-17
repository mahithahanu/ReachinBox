import axios from "axios";

const WEBHOOK_URL = process.env.WEBHOOK_URL;

export const triggerWebhook = async (email: any) => {
  if (!WEBHOOK_URL) {
    console.error("Webhook URL not set in environment variables!");
    return;
  }

  try {
    await axios.post(WEBHOOK_URL, { email });
    console.log("Webhook triggered!");
  } catch (err) {
    if (err instanceof Error) console.error("Error triggering webhook:", err.message);
    else console.error("Error triggering webhook:", err);
  }
};
