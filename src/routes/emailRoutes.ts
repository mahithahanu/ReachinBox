// emailRoutes.ts
import express from "express";
import { getAllEmails, searchEmails, processEmail } from "../controllers/emailController.js";

const router = express.Router();

// Fetch all emails
router.get("/emails", getAllEmails);

// Search emails with optional query, folder, account
router.get("/emails/search", searchEmails);

// Process a single email (categorize, save, notify)
router.post("/emails/process", processEmail);

export default router;
