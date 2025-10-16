import { Request, Response } from "express";
import Email from "../models/Email.js";

export const getAllEmails = async (req: Request, res: Response) => {
  try {
    const emails = await Email.find().sort({ date: -1 }); // newest first
    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};
