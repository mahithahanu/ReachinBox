import express from "express";
import { getAllEmails } from "../controllers/emailController.js";

const router = express.Router();

router.get("/", getAllEmails);

export default router;
