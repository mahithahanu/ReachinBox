# Onebox Email Aggregator

A **feature-rich email aggregator** built with **Node.js, TypeScript, and Elasticsearch** that syncs multiple IMAP accounts in real-time, categorizes emails using AI, integrates with Slack & webhooks, and provides a searchable interface. This project is inspired by **Reachinbox**.

> ⚠️ Current Status: **5 out of 6 features completed**  
> AI-powered suggested replies (Feature 6) is under development.

---

## **Features Implemented**

1. **Real-Time Email Synchronization**
   - Connects multiple IMAP accounts (minimum 2).
   - Fetches emails from the last 30 days.
   - Uses **persistent IMAP connections (IDLE mode)** for real-time updates.
   
2. **Searchable Storage using Elasticsearch**
   - Emails are indexed and stored in a locally hosted Elasticsearch instance.
   - Supports filtering by **folder** and **account**.
   - Enables fast **search and retrieval** of emails.

3. **AI-Based Email Categorization**
   - Categorizes emails into:
     - Interested
     - Meeting Booked
     - Not Interested
     - Spam
     - Out of Office
   - Uses a simple ML/NLP model for categorization.

4. **Slack & Webhook Integration**
   - Sends notifications to **Slack** for every new "Interested" email.
   - Triggers **webhooks** for external automation when an email is marked as Interested.

5. **Frontend Interface**
   - Displays emails with AI categorization.
   - Filters emails by **folder** or **account**.
   - Basic search functionality powered by Elasticsearch.

---

## **Getting Started**

### **Prerequisites**

- Node.js >= 18.x  
- npm or yarn  
- Docker (for Elasticsearch)  
- IMAP email account credentials  
- Slack workspace (optional for notifications)

### **Clone the repository**

```bash
git clone https://github.com/yourusername/onebox-email-aggregator.git
cd onebox-email-aggregator
