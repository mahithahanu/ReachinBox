import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import emailRoutes from "./routes/emailRoutes.js";
import { connectIMAP } from "./services/imapService.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/emails", emailRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Start server and IMAP connection
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectIMAP(); // connect to Gmail IMAP
});
