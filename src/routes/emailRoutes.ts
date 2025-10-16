import express from "express";
import { getAllEmails, searchEmails } from "../controllers/emailController.js";

const router = express.Router();

router.get("/emails", getAllEmails);
router.get("/emails/search", searchEmails);

export default router;
