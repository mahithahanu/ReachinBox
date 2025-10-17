import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import emailRoutes from "./routes/emailRoutes.js";
import { connectIMAP } from "./services/imapService.js";
import { esClient } from "./config/elasticsearch.js"; 
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use("/api", emailRoutes);

mongoose.connect(process.env.MONGO_URI!, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

esClient.info()
  .then(res => console.log("✅ Connected to Elasticsearch"))
  .catch(err => console.error("❌ Elasticsearch connection failed:", err));

app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  try {
    await connectIMAP();
    console.log("✅ IMAP service connected");
  } catch (err) {
    console.error("❌ IMAP connection failed:", err);
  }
});
