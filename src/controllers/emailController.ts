import { Request, Response } from "express";
import EmailModel from "../models/Email.js";
import { esClient } from "../config/elasticsearch.js";
import { categorizeEmail } from "../services/emailCategorization.js";
import { sendSlackNotification } from "../utils/slackNotifier.js";
import { triggerWebhook } from "../utils/webhookNotifier.js";

export const getAllEmails = async (req: Request, res: Response) => {
  try {
    const emails = await EmailModel.find().sort({ receivedAt: -1 });
    res.status(200).json({ count: emails.length, emails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch emails" });
  }
};

export const searchEmails = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string | undefined)?.toLowerCase() || "";
    const folder = (req.query.folder as string | undefined)?.toLowerCase() || "";
    const account = (req.query.account as string | undefined)?.toLowerCase() || "";

    const result = await esClient.search({
      index: "emails",
      size: 10000, 
      query: { match_all: {} },
    });

    let hits = result.hits.hits.map((hit: any) => hit._source);

    if (account && account !== "all") {
      hits = hits.filter((e: any) => e.account?.toLowerCase() === account);
    }

    if (folder && folder !== "all") {
      hits = hits.filter((e: any) => e.folder?.toLowerCase() === folder);
    }

    if (query) {
      hits = hits.filter(
        (e: any) =>
          e.subject?.toLowerCase().includes(query) ||
          e.body?.toLowerCase().includes(query) ||
          e.from?.toLowerCase().includes(query)
      );
    }

    res.status(200).json(hits);
  } catch (err) {
    console.error("❌ Search failed:", err);
    res.status(500).json({ message: "Search failed", error: err });
  }
};


export const processEmail = async (req: Request, res: Response) => {
  try {
    const { subject, body, from, account, to } = req.body;

    const label = await categorizeEmail(body);

    const email = new EmailModel({
      uid: Date.now(),
      account,
      folder: "INBOX",
      from,
      to,
      subject,
      body,
      label,
      date: new Date(),
    });

    const savedEmail = await email.save();

    await saveEmailToElasticsearch({
      uid: savedEmail.uid,
      account: savedEmail.account,
      folder: savedEmail.folder,
      from: savedEmail.from,
      to: savedEmail.to,
      subject: savedEmail.subject,
      body: savedEmail.body,
      label: savedEmail.label,
      date: savedEmail.date,
    });
    if (label === "Interested") {
      await sendSlackNotification(savedEmail);
      await triggerWebhook(savedEmail);
    }

    res.status(200).json({ message: "Email categorized and saved", label });
  } catch (err) {
    console.error("Error processing email:", err);
    res.status(500).json({ message: "Error processing email" });
  }
};

export const saveEmailToElasticsearch = async (emailData: any) => {
  try {
    await esClient.index({
      index: "emails",
      document: emailData,
    });
    console.log(`✅ Indexed email UID ${emailData.uid}`);
  } catch (err) {
    console.error("❌ Error indexing email:", err);
  }
};
