# MINT 3-Minute Demo Script

## 0:00 - Problem

Open MINT on the phone-sized UI. Say: most apps tell us where money went, but MINT helps decide the next move.

## 0:20 - Demo Data + Transaction

Tap **Demo data** on Home. Show the balance, income, expenses, and recent transactions updating from DynamoDB.

Tap **Add Transaction** and add a Food expense. Switch to Transactions and Plans to show the new transaction affects the whole app.

## 0:50 - Ask The Coach

Open the mic button. Ask by voice: "Where am I spending the most?"

Show the AI answer. Point out the caption: "Answered by Amazon Bedrock."

## 1:30 - What-If Simulator

Go to Plans, open What-If, and enter:

- Goal: `50000`
- Current savings: `4000`
- New savings: `5500`

Run it and highlight the two timelines plus the "months earlier" badge.

## 2:15 - Investing Guide + Price Watch

Switch to Invest and show the beginner allocation plan.

Switch to Wishlist, add a planned purchase, and simulate the price drop to show the decision moment.

## 2:40 - AWS Console + Cloud Status

Open Settings and show the Cloud status card:

```text
AWS · us-east-1 · API Gateway + Lambda + DynamoDB + Bedrock
```

Then show AWS Console tabs for Lambda, DynamoDB table items, and Bedrock access/model configuration.
