import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import emailRoutes from "./routes/emailRoutes.js";
import { connectIMAP } from "./services/imapService.js";
import { esClient } from "./config/elasticsearch.js"; // <- import ES client

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", emailRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI!, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Test Elasticsearch connection
esClient.info()
  .then(res => console.log("✅ Connected to Elasticsearch"))
  .catch(err => console.error("❌ Elasticsearch connection failed:", err));

app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectIMAP();
});
