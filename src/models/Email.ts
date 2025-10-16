import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema({
    uid: { type: Number, required: true },
    account: { type: String, required: true }, // email account
    folder: { type: String, default: "INBOX" }, // new field
    from: String,
    to: [String],
    subject: String,
    date: Date,
    body: String,
}, { timestamps: true });

EmailSchema.index({ uid: 1, account: 1 }, { unique: true });

export default mongoose.model("Email", EmailSchema);
