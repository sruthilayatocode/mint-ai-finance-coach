# 🌿 MINT — Your Personal Financial Decision Coach

> **WeMakeDevs × AWS First Commit Hackathon** · Mobile-first · AI-powered · ₹ first

---

## Architecture

```
User (Mobile Browser / Amplify)
    │
    ▼
┌─────────────────────────────────┐
│  React 19 + Vite                │
│  Mobile-first UI (430px frame)  │
│  Hosted on AWS Amplify          │
│                                 │
│  4 Pages: Home · Transactions   │
│           Plans · Settings      │
│  + Floating AI Coach (voice)    │
└────────────┬────────────────────┘
             │  HTTPS fetch  (VITE_API_URL)
             ▼
┌─────────────────────────────────┐
│  Amazon API Gateway (HTTP API)  │
│  ANY /{proxy+} · CORS enabled   │
└────────────┬────────────────────┘
             │  Lambda Proxy
             ▼
┌─────────────────────────────────┐
│  AWS Lambda  mint-handler       │
│  Node.js 20 · ES module         │
│  Routes: GET/POST /transactions │
│          POST /seed /simulate   │
│          POST /coach            │
└────────┬────────────────────────┘
         │                │
         ▼                ▼
┌──────────────┐  ┌────────────────────┐
│  DynamoDB    │  │  Amazon Bedrock     │
│  mint-       │  │  Converse API       │
│  transactions│  │  Nova Lite / Claude │
└──────────────┘  └────────────────────┘
```

---

## The Problem

Most finance apps are **rear-view mirrors** — they show what you already spent.
**MINT flips this.** It uses your real transaction data + Amazon Bedrock AI to coach your *next* decision:

- Ask "How can I save more?" → get a specific answer using your actual ₹ numbers
- Run a What-If simulation → see how saving ₹3,000 more/month gets you to your goal 4 months sooner
- Get a personalised investment allocation (Emergency Fund → FD/RD → Nifty 50 → Gold)
- Plan purchases with the Wishlist: see exactly how many months until you can afford that item
- Centralised React Context Store: instant real-time sync across all 4 pages upon adding transactions, seeding demo data, or importing UPI payments

---

## Feature Areas (4 Pages)

| Page | What it does |
|---|---|
| **Home** | Balance card, income/expense mini cards, savings goal progress, add transactions & seed demo data |
| **Transactions** | Centralised transaction list + search filter + Stats view with vertical category bars & comparison badges |
| **Plans** | Safe-to-Spend balance calculator · What-If simulator · Smart Investment Plan · Wishlist purchase planner |
| **Settings** | Financial target preferences (budget, savings target) · UPI app auto-imports · Feature flags · Profile & Logout |
| **AI Coach** | Voice input (Web Speech API, en-IN) + text chat + TTS playback, powered by Amazon Bedrock |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, plain CSS (Poppins font, periwinkle theme), shared store context, lucide-react icons |
| Hosting | AWS Amplify |
| API | Amazon API Gateway (HTTP API) |
| Backend | AWS Lambda (Node.js 20, ES modules) |
| Database | Amazon DynamoDB |
| AI | Amazon Bedrock — Converse API |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) |

---

## Local Development

```bash
cd mint-app
npm install
# .env.local has VITE_USE_MOCK=true — works offline without AWS
npm run dev
```

To point at a live AWS backend:
```bash
# .env.local
VITE_USE_MOCK=false
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

See [DEPLOY.md](./DEPLOY.md) for full AWS setup.

---

## Roadmap

### Account Aggregator Integration
Replace demo UPI import with **RBI-regulated Account Aggregator (AA) framework** for real, consent-based bank data access. Users grant explicit, revocable consent. FIPs (banks) push statement data to MINT via the AA network — zero screen-scraping, fully compliant.

### Live Price Tracking & Push Notifications
The Wishlist "Simulate price drop" is currently a demo. The production roadmap adds:
- **Price webhooks** from partner APIs (Flipkart, Amazon India) that send real price-change events to a Lambda
- **AWS SNS + Service Worker push notifications** to alert users when a wishlist item drops in price
- In-app notification centre with price history charts

---

## Lambda Routes

| Method | Path | Description |
|---|---|---|
| GET | /transactions | List all transactions (newest first) |
| POST | /transactions | Add a transaction |
| POST | /seed | Insert 15 realistic demo transactions |
| POST | /simulate | What-If calculator (JS math + AI explanation) |
| POST | /coach | AI coach — answers questions from your real data |
