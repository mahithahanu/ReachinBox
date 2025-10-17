# ReachinBox - Onebox Email Aggregator

A **feature-rich email aggregator** built with **Node.js, TypeScript, and Elasticsearch** that syncs multiple IMAP accounts in real-time, categorizes emails using AI, integrates with Slack & webhooks, and provides a searchable interface. Inspired by **Reachinbox**.

> ⚠️ Current Status: **5 out of 6 features completed**  
> AI-powered suggested replies (Feature 6) is under development.

---

## **Features Implemented**

1. **Real-Time Email Synchronization**
   - Connects multiple IMAP accounts (minimum 2)
   - Fetches emails from the last 30 days
   - Uses **persistent IMAP connections (IDLE mode)** for real-time updates

2. **Searchable Storage using Elasticsearch**
   - Emails are indexed and stored in a locally hosted Elasticsearch instance
   - Supports filtering by **folder** and **account**
   - Enables fast **search and retrieval** of emails

3. **AI-Based Email Categorization**
   - Categorizes emails into:
     - Interested
     - Meeting Booked
     - Not Interested
     - Spam
     - Out of Office
   - Uses a simple ML/NLP model for categorization
   - **ML scripts repository:** [ML Service](https://github.com/mahithahanu/ml_service)

4. **Slack & Webhook Integration**
   - Sends notifications to **Slack** for every new "Interested" email
   - Triggers **webhooks** for external automation when an email is marked as Interested

5. **Frontend Interface**
   - Displays emails with AI categorization
   - Filters emails by **folder** or **account**
   - Basic search functionality powered by Elasticsearch
   - **Frontend repository:** [ReachinBox Frontend](https://github.com/mahithahanu/ReachinboxFrontend)

---

## **Getting Started**

### **Prerequisites**

- Node.js >= 18.x  
- npm or yarn  
- Docker (for Elasticsearch)  
- IMAP email account credentials  
- Slack workspace (optional for notifications)

### **Clone the Backend Repository**

```bash
git clone https://github.com/mahithahanu/ReachinBox.git
cd ReachinBox
```
### Install Dependencies
 npm install

 ### Setup Elasticsearch (Docker)
 docker pull docker.elastic.co/elasticsearch/elasticsearch:8.10.2
 docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.10.2
Verify:
curl http://localhost:9200

### Backend
npm run dev

### Frontend
git clone https://github.com/mahithahanu/ReachinboxFrontend.git
cd ReachinboxFrontend
npm install
npm start

### ml_scripts
https://github.com/mahithahanu/ml_service
