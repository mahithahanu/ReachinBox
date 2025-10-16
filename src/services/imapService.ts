import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import Email from "../models/Email.js";

dotenv.config();

// Define your email accounts here
const accounts = [
  {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
    host: process.env.EMAIL_HOST!,
    port: Number(process.env.EMAIL_PORT || 993),
  },
  {
    user: process.env.EMAIL_USER2!,       // Add second account in .env
    pass: process.env.EMAIL_PASSWORD2!,
    host: process.env.EMAIL_HOST2!,
    port: Number(process.env.EMAIL_PORT2 || 993),
  }
];

// Helper: get date 30 days ago
const getSinceDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

// Connect and sync all accounts
export const connectIMAP = async () => {
  for (const account of accounts) {
    const client = new ImapFlow({
      host: account.host,
      port: account.port,
      secure: true,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });

    await client.connect();
    console.log(`✅ Connected to ${account.user}`);

    // Initial fetch of last 30 days
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uidsResult = await client.search({ since: getSinceDate() });
      const uids: number[] = uidsResult || []; // handle false
      for await (const message of client.fetch(uids, { envelope: true, source: true, uid: true, internalDate: true })) {
        await Email.updateOne(
          { uid: message.uid, account: account.user },
          {
            uid: message.uid,
            account: account.user,
            from: message.envelope?.from?.map(f => f.address).join(", ") || "",
            to: message.envelope?.to?.map(f => f.address) || [],
            subject: message.envelope?.subject || "",
            body: message.source ? message.source.toString() : "",
            date: message.internalDate,
          },
          { upsert: true }
        );
      }
      console.log(`📥 Initial fetch completed for ${account.user}`);
    } finally {
      lock.release();
    }

    // Real-time listener (IDLE mode)
    client.on("exists", async () => {
      console.log(`📨 New email detected for ${account.user}`);
      const lock = await client.getMailboxLock("INBOX");
      try {
        const unseenResult = await client.search({ seen: false });
        const unseenUids: number[] = unseenResult || []; // handle false
        if (unseenUids.length === 0) return;

        for await (const message of client.fetch(unseenUids, { envelope: true, source: true, uid: true, internalDate: true })) {
          await Email.updateOne(
            { uid: message.uid, account: account.user },
            {
              uid: message.uid,
              account: account.user,
              from: message.envelope?.from?.map(f => f.address).join(", ") || "",
              to: message.envelope?.to?.map(f => f.address) || [],
              subject: message.envelope?.subject || "",
              body: message.source ? message.source.toString() : "",
              date: message.internalDate,
            },
            { upsert: true }
          );
        }
      } finally {
        lock.release();
      }
    });
  }
};
