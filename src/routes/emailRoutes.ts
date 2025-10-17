import express from "express";
import { getAllEmails, searchEmails, processEmail } from "../controllers/emailController.js";

const router = express.Router();

router.get("/emails", getAllEmails);

router.get("/emails/search", searchEmails);

router.post("/emails/process", processEmail);

export default router;
