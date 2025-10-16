import { Request, Response } from "express";
import Email from "../models/Email.js";
import { esClient } from "../config/elasticsearch.js";

// Fetch all emails from MongoDB
export const getAllEmails = async (req: Request, res: Response) => {
  try {
    const emails = await Email.find().sort({ date: -1 });
    console.log("📧 Found emails count:", emails.length);
    res.status(200).json({ count: emails.length, emails });
  } catch (error) {
    let errorMessage = "Failed to fetch emails";
    if (error instanceof Error) errorMessage = error.message;
    console.error("🔥 Error fetching emails:", error);
    res.status(500).json({ error: errorMessage });
  }
};

export const saveEmailToElasticsearch = async (emailData: any) => {
  try {
    await esClient.index({
      index: "emails",
      document: {
        subject: emailData.subject,
        sender: emailData.from,
        to: emailData.to,
        date: emailData.date,
        folder: emailData.folder || "INBOX",
        account: emailData.account,
        body: emailData.body,
      },
    });
    console.log(`✅ Indexed email UID ${emailData.uid} in Elasticsearch`);
  } catch (err) {
    console.error("❌ Error indexing email to Elasticsearch:", err);
  }
};

// Search emails from Elasticsearch
export const searchEmails = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string | undefined;
    const folder = req.query.folder as string | undefined;
    const account = req.query.account as string | undefined;

    const filters: any[] = [];
    if (folder) filters.push({ match: { folder } });
    if (account) filters.push({ match: { account } });

    const must: any[] = [];
    if (query && query.trim() !== "") {
      must.push({ match: { body: query } });
    }

    const result = await esClient.search({
      index: "emails",
      query: {
        bool: {
          must,
          filter: filters,
        },
      },
    });

    const hits = result.hits.hits.map((hit: any) => hit._source);
    res.status(200).json(hits);
  } catch (error) {
    console.error("❌ Error searching emails:", error);
    res.status(500).json({ message: "Search failed", error });
  }
};
