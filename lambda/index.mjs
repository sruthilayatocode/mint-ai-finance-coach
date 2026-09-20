import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ── Config ────────────────────────────────────────────────────────────────────
const TABLE_NAME = process.env.TABLE_NAME || "mint-transactions";
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0";
const BEDROCK_REGION = process.env.BEDROCK_REGION || "us-east-1";
const USER_ID = "demo-user";

// ── Clients ───────────────────────────────────────────────────────────────────
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const bedrock = new BedrockRuntimeClient({ region: BEDROCK_REGION });

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const ok = (body, status = 200) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", ...CORS },
  body: JSON.stringify(body),
});

const err = (msg, status = 400) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", ...CORS },
  body: JSON.stringify({ error: msg }),
});

// ── Bedrock helper ────────────────────────────────────────────────────────────
async function chat(systemPrompt, userMessage) {
  const res = await bedrock.send(
    new ConverseCommand({
      modelId: BEDROCK_MODEL_ID,
      system: [{ text: systemPrompt }],
      messages: [{ role: "user", content: [{ text: userMessage }] }],
      inferenceConfig: { maxTokens: 512, temperature: 0.5 },
    })
  );
  return res.output.message.content[0].text;
}

// ── DynamoDB helpers ──────────────────────────────────────────────────────────
async function listTransactions() {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": USER_ID },
      ScanIndexForward: false, // newest first (by SK = timestamp id)
    })
  );
  return res.Items || [];
}

async function putTransaction(item) {
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

// ── Financial summary builder ─────────────────────────────────────────────────
function buildSummary(transactions) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals = {};
  const thisMonthByCategory = {};
  const prevMonthByCategory = {};

  for (const t of transactions) {
    const month = (t.date || "").slice(0, 7);
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      if (month === thisMonth)
        thisMonthByCategory[t.category] =
          (thisMonthByCategory[t.category] || 0) + t.amount;
      if (month === prevMonth)
        prevMonthByCategory[t.category] =
          (prevMonthByCategory[t.category] || 0) + t.amount;
    }
  }

  const balance = totalIncome - totalExpenses;
  const spendingByCategory = Object.entries(categoryTotals).map(
    ([cat, amt]) => ({
      category: cat,
      amount: amt,
      percent: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
    })
  );
  spendingByCategory.sort((a, b) => b.amount - a.amount);
  const topCategory = spendingByCategory[0]?.category || "N/A";

  return {
    totalIncome,
    totalExpenses,
    balance,
    spendingByCategory,
    topCategory,
    thisMonthByCategory,
    prevMonthByCategory,
    transactionCount: transactions.length,
  };
}

// ── Seed data ─────────────────────────────────────────────────────────────────
function seedTransactions() {
  const now = new Date();
  const m = (offset = 0) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const day = (month, d) => `${month}-${String(d).padStart(2, "0")}`;

  return [
    // This month
    { amount: 65000, description: "Monthly Salary", type: "income", category: "Salary", date: day(m(0), 1) },
    { amount: 4200, description: "Swiggy & Zomato orders", type: "expense", category: "Food", date: day(m(0), 3) },
    { amount: 1800, description: "Metro & Ola rides", type: "expense", category: "Transport", date: day(m(0), 5) },
    { amount: 8500, description: "Myntra sale shopping", type: "expense", category: "Shopping", date: day(m(0), 7) },
    { amount: 2200, description: "Electricity bill", type: "expense", category: "Bills", date: day(m(0), 10) },
    { amount: 999, description: "Netflix + Spotify", type: "expense", category: "Entertainment", date: day(m(0), 12) },
    { amount: 3100, description: "Groceries - DMart", type: "expense", category: "Food", date: day(m(0), 15) },
    { amount: 650, description: "Petrol", type: "expense", category: "Transport", date: day(m(0), 18) },
    // Previous month
    { amount: 65000, description: "Monthly Salary", type: "income", category: "Salary", date: day(m(1), 1) },
    { amount: 5800, description: "Restaurants & cafes", type: "expense", category: "Food", date: day(m(1), 4) },
    { amount: 2100, description: "Uber & auto rides", type: "expense", category: "Transport", date: day(m(1), 8) },
    { amount: 3500, description: "Amazon purchases", type: "expense", category: "Shopping", date: day(m(1), 11) },
    { amount: 1200, description: "Internet & mobile bill", type: "expense", category: "Bills", date: day(m(1), 14) },
    { amount: 1500, description: "Movie + bowling", type: "expense", category: "Entertainment", date: day(m(1), 20) },
    { amount: 2900, description: "Groceries - BigBasket", type: "expense", category: "Food", date: day(m(1), 22) },
  ];
}

// ── Main handler ──────────────────────────────────────────────────────────────
export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "GET";
  const path = event.rawPath || event.path || "/";

  // Preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    // ── GET /transactions ──────────────────────────────────────────────────
    if (method === "GET" && path === "/transactions") {
      const items = await listTransactions();
      return ok({ transactions: items });
    }

    // ── POST /transactions ─────────────────────────────────────────────────
    if (method === "POST" && path === "/transactions") {
      const body = JSON.parse(event.body || "{}");
      const { amount, description, type, category } = body;

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
        return err("amount must be a positive number");
      if (!description || !description.trim())
        return err("description is required");
      if (!["income", "expense"].includes(type))
        return err("type must be income or expense");
      if (!category) return err("category is required");

      const id = Date.now().toString();
      const item = {
        userId: USER_ID,
        id,
        amount: Number(amount),
        description: description.trim(),
        type,
        category,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };
      await putTransaction(item);
      return ok({ transaction: item }, 201);
    }

    // ── POST /seed ─────────────────────────────────────────────────────────
    if (method === "POST" && path === "/seed") {
      const seeds = seedTransactions();
      const base = Date.now();
      await Promise.all(
        seeds.map((s, i) =>
          putTransaction({
            userId: USER_ID,
            id: (base - i * 1000).toString(),
            ...s,
            createdAt: new Date(base - i * 1000).toISOString(),
          })
        )
      );
      return ok({ seeded: seeds.length });
    }

    // ── POST /simulate ─────────────────────────────────────────────────────
    if (method === "POST" && path === "/simulate") {
      const body = JSON.parse(event.body || "{}");
      const { goal, currentMonthlySavings, newMonthlySavings } = body;

      if (!goal || !currentMonthlySavings || !newMonthlySavings)
        return err("goal, currentMonthlySavings, newMonthlySavings are required");

      const g = Number(goal);
      const cs = Number(currentMonthlySavings);
      const ns = Number(newMonthlySavings);

      if (g <= 0 || cs <= 0 || ns <= 0)
        return err("All values must be positive numbers");

      // Pure JS math — AI does NOT do any math
      const currentMonths = Math.ceil(g / cs);
      const newMonths = Math.ceil(g / ns);
      const monthsSaved = currentMonths - newMonths;

      const systemPrompt =
        "You are MINT, a friendly financial coach. Your ONLY job is to write an encouraging 2-sentence explanation of the simulation result given to you. Do NOT calculate or change any numbers. Use the exact numbers provided.";

      const userMessage = `The user wants to save ₹${g.toLocaleString("en-IN")}. Currently saving ₹${cs.toLocaleString("en-IN")}/month, they'll reach the goal in ${currentMonths} months. By saving ₹${ns.toLocaleString("en-IN")}/month instead, they'll reach it in ${newMonths} months — that's ${monthsSaved} months earlier. Write 2 friendly, encouraging sentences about this improvement.`;

      const explanation = await chat(systemPrompt, userMessage);

      return ok({ currentMonths, newMonths, monthsSaved, explanation });
    }

    // ── POST /coach ────────────────────────────────────────────────────────
    if (method === "POST" && path === "/coach") {
      const body = JSON.parse(event.body || "{}");
      const { question } = body;
      if (!question || !question.trim()) return err("question is required");

      const transactions = await listTransactions();
      if (transactions.length === 0)
        return ok({ answer: "No transactions found. Please add some transactions or load demo data first, then ask me again!" });

      const summary = buildSummary(transactions);

      const systemPrompt =
        "You are MINT, a personal financial coach. Answer ONLY using the user's data provided. Cite specific ₹ amounts and categories. Be concise (max 4 sentences), practical, and end with one concrete next step. Never invent numbers.";

      const userMessage = `User's financial data:\n${JSON.stringify(summary, null, 2)}\n\nUser's question: ${question.trim()}`;

      const answer = await chat(systemPrompt, userMessage);
      return ok({ answer });
    }

    // ── 404 ────────────────────────────────────────────────────────────────
    return err(`Route not found: ${method} ${path}`, 404);
  } catch (e) {
    console.error("Handler error:", e);
    return err(`Internal server error: ${e.message}`, 500);
  }
};
