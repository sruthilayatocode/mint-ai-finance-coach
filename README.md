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
│  4 Tabs: Home · Expenses        │
│          Plans · Settings       │
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
- Plan purchases with the Wishlist: see exactly how many months until you can afford that washing machine

---

## Feature Areas

| Area | What it does |
|---|---|
| **Home** | Balance card, income/expense mini cards, savings goal progress, add transactions |
| **Expenses** | Full transaction list + Stats view with vertical category bars + comparison badges |
| **Plans** | What-If simulator · Smart Investment Plan (JS math + AI explanation) · Wishlist purchase planner |
| **AI Coach** | Voice input (Web Speech API, en-IN) + text chat + TTS playback, powered by Amazon Bedrock |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, plain CSS (Poppins font, periwinkle theme), lucide-react icons |
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
# .env.local already has VITE_USE_MOCK=true — works without AWS
npm run dev
```

To point at a real API:
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
