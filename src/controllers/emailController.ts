// src/controllers/emailController.ts
import { Request, Response } from "express";
import EmailModel from "../models/Email.js";
import { esClient } from "../config/elasticsearch.js";
import { categorizeEmail } from "../services/emailCategorization.js";
import { sendSlackNotification } from "../utils/slackNotifier.js";
import { triggerWebhook } from "../utils/webhookNotifier.js";


// Fetch all emails from MongoDB
export const getAllEmails = async (req: Request, res: Response) => {
  try {
    const emails = await EmailModel.find().sort({ receivedAt: -1 });
    res.status(200).json({ count: emails.length, emails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch emails" });
  }
};

// Search emails in Elasticsearch
export const searchEmails = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string | undefined;
    const folder = req.query.folder as string | undefined;
    const account = req.query.account as string | undefined;

    const filters: any[] = [];
    if (folder) filters.push({ match: { folder } });
    if (account) filters.push({ match: { account } });

    const must: any[] = [];
    if (query && query.trim() !== "") must.push({ match: { body: query } });

    const result = await esClient.search({
      index: "emails",
      query: { bool: { must, filter: filters } },
    });

    const hits = result.hits.hits.map((hit: any) => hit._source);
    res.status(200).json(hits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed", error: err });
  }
};

// Process a single email: categorize, save to MongoDB + Elasticsearch, send notifications
export const processEmail = async (req: Request, res: Response) => {
  try {
    const { subject, body, from, account, to } = req.body;

    // Step 1: Get label from AI
    const label = await categorizeEmail(body);

    // Step 2: Save to MongoDB
    const email = new EmailModel({
      uid: Date.now(), // or use a proper unique ID
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

    // Step 3: Save to Elasticsearch
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

    // Step 4: Slack notification & webhook if Interested
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

// Save an email document to Elasticsearch
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
