# MINT Backend Deployment

## Architecture
- **API Gateway** (HTTP API) handling CORS and routing.
- **AWS Lambda** (Node.js 20.x or 24.x) running `lambda/index.mjs`.
- **DynamoDB** (`mint-transactions` table) storing transaction data.
- **Amazon Bedrock** (Claude 3 Haiku) generating financial coach insights.

## Deployment Steps (Manual via Console)
If you need to redeploy this from scratch:

1. **DynamoDB**:
   - Create table `mint-transactions`.
   - Partition Key: `userId` (String).
   - Sort Key: `id` (String).

2. **Lambda**:
   - Create Node.js function.
   - Paste the code from `lambda/index.mjs`.
   - Add Environment Variables:
     - `TABLE_NAME`: `mint-transactions`
     - `BEDROCK_MODEL_ID`: `anthropic.claude-3-haiku-20240307-v1:0`
   - Grant IAM inline policy permissions:
     - `dynamodb:PutItem`, `dynamodb:Query`, `dynamodb:BatchWriteItem`
     - `bedrock:InvokeModel`

3. **API Gateway**:
   - Create HTTP API integrated with the Lambda.
   - Set route to `ANY /{proxy+}`.
   - Enable CORS (Origin: `*`, Methods: `*`, Headers: `content-type`).

## API Endpoints
- `GET /transactions` - Fetch all transactions
- `POST /transactions` - Add a new transaction
- `POST /seed` - Fill database with demo data
- `POST /simulate` - Calculate savings timeline
- `POST /coach` - Ask the AI financial coach a question
