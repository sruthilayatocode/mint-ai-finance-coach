# MINT — Deploy Guide

> End-to-end setup in ~15 minutes. Follow in order.

---

## 1. DynamoDB Table

**AWS Console → DynamoDB → Create table**

| Setting | Value |
|---|---|
| Table name | `mint-transactions` |
| Partition key | `userId` (String) |
| Sort key | `id` (String) |
| Capacity mode | On-demand |

Click **Create table**.

---

## 2. Lambda Function

**AWS Console → Lambda → Create function**

| Setting | Value |
|---|---|
| Function name | `mint-handler` |
| Runtime | Node.js 20.x |
| Architecture | x86_64 |

### Code
- In the **Code** tab, rename `index.mjs` (it is already `.mjs` by default in Node 20 ES module handlers).
- Paste the entire contents of `lambda/index.mjs` from this repo.
- Set **Handler** to `index.handler`.

### Environment Variables
Add these in **Configuration → Environment variables**:

| Key | Value |
|---|---|
| `TABLE_NAME` | `mint-transactions` |
| `BEDROCK_MODEL_ID` | `amazon.nova-lite-v1:0` *(or any Bedrock model you have access to)* |
| `BEDROCK_REGION` | `us-east-1` *(must be a region where your model is enabled)* |

### Timeout & Memory
- Timeout: **30 seconds**
- Memory: **256 MB**

---

## 3. Lambda IAM Role Permissions

**IAM → Roles → [your lambda role] → Add permissions → Attach policies**

Attach `AWSLambdaBasicExecutionRole` (already attached), then add an **inline policy** with:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/mint-transactions"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:Converse"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 4. API Gateway (HTTP API)

**AWS Console → API Gateway → Create API → HTTP API**

1. Add integration → Lambda → select `mint-handler`
2. API name: `mint-api`
3. Under **Routes**, add a single catch-all route:
   - Method: `ANY`
   - Resource path: `/{proxy+}`
4. Under **CORS**, click **Configure**:
   - Allow origins: `*`
   - Allow headers: `Content-Type`
   - Allow methods: `GET, POST, OPTIONS`
5. Deploy → Stage name: `$default` (gives you a URL immediately)

Copy the **Invoke URL** — you'll need it for Amplify.

> **Test it:** `curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/transactions`

---

## 5. Enable Bedrock Model Access

**AWS Console → Amazon Bedrock → Model access** (in `us-east-1` or your chosen region)

Enable the model matching your `BEDROCK_MODEL_ID` (e.g. `Amazon Nova Lite`).

---

## 6. Deploy Frontend via AWS Amplify

1. Push this repo to GitHub.
2. **AWS Console → Amplify → Create new app → Host web app**
3. Connect your GitHub repo and select the branch (e.g. `main`).
4. Amplify will detect Vite automatically. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd mint-app && npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: mint-app/dist
       files:
         - '**/*'
     cache:
       paths:
         - mint-app/node_modules/**/*
   ```
5. Under **Environment variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com` |

6. Click **Save and deploy**.

---

## Quick Smoke Test

```bash
# 1. Seed demo data
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/seed

# 2. List transactions
curl https://YOUR_API.execute-api.us-east-1.amazonaws.com/transactions

# 3. Add a transaction
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"description":"Coffee","type":"expense","category":"Food"}'

# 4. Ask the AI Coach
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/coach \
  -H "Content-Type: application/json" \
  -d '{"question":"Where am I spending the most?"}'
```
