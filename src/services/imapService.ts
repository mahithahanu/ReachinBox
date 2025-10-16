import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import Email from "../models/Email.js";
import { simpleParser } from "mailparser";
import { saveEmailToElasticsearch } from "../controllers/emailController.js";

dotenv.config();

// Define your email accounts
const accounts = [
  {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
    host: process.env.EMAIL_HOST!,
    port: Number(process.env.EMAIL_PORT || 993),
  },
  {
    user: process.env.EMAIL_USER2!,
    pass: process.env.EMAIL_PASSWORD2!,
    host: process.env.EMAIL_HOST2!,
    port: Number(process.env.EMAIL_PORT2 || 993),
  },
];

// Helper: get date 30 days ago
const getSinceDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

// Main function to connect and sync all accounts
export const connectIMAP = async () => {
  for (const account of accounts) {
    connectAccount(account); // call each account
  }
};

// Function to handle a single account
const connectAccount = async (account: any) => {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: true,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  client.on("error", (err) => {
    console.error(`❌ IMAP error for ${account.user}:`, err);
  });

  client.on("close", () => {
    console.warn(`⚠️ IMAP connection closed for ${account.user}, reconnecting...`);
    setTimeout(() => connectAccount(account), 5000); // reconnect after 5 sec
  });

  try {
    await client.connect();
    console.log(`✅ Connected to ${account.user}`);

    // Initial fetch
    await fetchEmails(client, account);

    // Real-time listener
    client.on("exists", async () => {
      await fetchEmails(client, account, { unseenOnly: true });
    });

    // Start IDLE mode
    await client.idle();

  } catch (err) {
    console.error(`❌ Failed IMAP connect for ${account.user}:`, err);
    setTimeout(() => connectAccount(account), 5000); // reconnect after 5 sec
  }
};

// Function to fetch emails
const fetchEmails = async (client: ImapFlow, account: any, options: { unseenOnly?: boolean } = {}) => {
  const lock = await client.getMailboxLock("INBOX");
  try {
    const searchCriteria = options.unseenOnly
      ? { seen: false }
      : { since: getSinceDate() };

    const uidsResult = await client.search(searchCriteria);
    const uids: number[] = uidsResult || [];
    if (uids.length === 0) return;

    for await (const message of client.fetch(uids, { envelope: true, source: true, uid: true, internalDate: true })) {
      if (!message.source) continue;

      try {
        const parsed = await simpleParser(message.source as Buffer);

        const emailData = {
          uid: message.uid,
          account: account.user,
          folder: "INBOX",
          from: parsed.from?.text || "",
          to: Array.isArray(parsed.to)
            ? parsed.to.map((t) => (t as any).address)
            : parsed.to
            ? [(parsed.to as any).text || (parsed.to as any).address]
            : [],
          subject: parsed.subject || "",
          body: parsed.text || parsed.html || "",
          date: parsed.date || message.internalDate || new Date(),
        };

        // Save to MongoDB
        await Email.updateOne(
          { uid: message.uid, account: account.user },
          emailData,
          { upsert: true }
        );

        // Save to Elasticsearch
        await saveEmailToElasticsearch(emailData);

      } catch (err) {
        console.error(`❌ Error processing message UID ${message.uid} for ${account.user}:`, err);
      }
    }

    console.log(`📥 Fetched ${uids.length} emails for ${account.user} (${options.unseenOnly ? "new only" : "initial"})`);
  } finally {
    lock.release();
  }
};
