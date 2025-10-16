import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import EmailModel from "../models/Email.js";
import { simpleParser } from "mailparser";
import { saveEmailToElasticsearch } from "../controllers/emailController.js";
import { categorizeEmail } from "./emailCategorization.js";

dotenv.config();

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

const getSinceDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

export const connectIMAP = async () => {
  for (const account of accounts) connectAccount(account);
};

const connectAccount = async (account: any) => {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: true,
    auth: { user: account.user, pass: account.pass },
  });

  client.on("error", (err) => console.error(err));
  client.on("close", () => setTimeout(() => connectAccount(account), 5000));

  try {
    await client.connect();
    await fetchEmails(client, account);

    client.on("exists", async () => await fetchEmails(client, account, { unseenOnly: true }));
    await client.idle();
  } catch (err) {
    console.error(err);
    setTimeout(() => connectAccount(account), 5000);
  }
};

const fetchEmails = async (client: ImapFlow, account: any, options: { unseenOnly?: boolean } = {}) => {
  const lock = await client.getMailboxLock("INBOX");
  try {
    const searchCriteria = options.unseenOnly ? { seen: false } : { since: getSinceDate() };
    const uidsResult = await client.search(searchCriteria);
    const uids: number[] = uidsResult || [];
    if (!uids.length) return;

    for await (const message of client.fetch(uids, { envelope: true, source: true, uid: true, internalDate: true })) {
      if (!message.source) continue;
      const parsed = await simpleParser(message.source as Buffer);

      const label = await categorizeEmail(parsed.text || parsed.html || "");

      const emailData = {
        uid: message.uid,
        account: account.user,
        folder: "INBOX",
        from: parsed.from?.text || "",
        to: Array.isArray(parsed.to) ? parsed.to.map(t => (t as any).address) : [],
        subject: parsed.subject || "",
        body: parsed.text || parsed.html || "",
        date: parsed.date || message.internalDate || new Date(),
        label
      };

      await EmailModel.updateOne({ uid: message.uid, account: account.user }, emailData, { upsert: true });
      await saveEmailToElasticsearch(emailData);
    }

    console.log(`📥 Fetched ${uids.length} emails for ${account.user}`);
  } finally {
    lock.release();
  }
};
