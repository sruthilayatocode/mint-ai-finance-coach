import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const bedrockClient = new BedrockRuntimeClient({});

const TABLE_NAME = process.env.TABLE_NAME || "mint-transactions";
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
  "Access-Control-Allow-Headers": "Content-Type"
};

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  
  const routeKey = `${event.requestContext?.http?.method} ${event.requestContext?.http?.path}`;
  const userId = "demo-user";

  try {
    switch (routeKey) {
      case "GET /transactions":
        return await getTransactions(userId);
      case "POST /transactions":
        return await addTransaction(userId, JSON.parse(event.body));
      case "POST /seed":
        return await seedTransactions(userId);
      case "POST /simulate":
        return await simulate(JSON.parse(event.body));
      case "POST /coach":
        return await coach(userId, JSON.parse(event.body));
      case "OPTIONS /transactions":
      case "OPTIONS /seed":
      case "OPTIONS /simulate":
      case "OPTIONS /coach":
        return { statusCode: 200, headers, body: "" };
      default:
        return { statusCode: 404, headers, body: JSON.stringify({ message: `Not Found: ${routeKey}` }) };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function getTransactions(userId) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    }
  };
  
  const data = await docClient.send(new QueryCommand(params));
  const transactions = data.Items || [];
  transactions.sort((a, b) => b.id.localeCompare(a.id));
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ transactions })
  };
}

async function addTransaction(userId, body) {
  const { amount, description, type, category, date } = body;
  const id = Date.now().toString();
  
  const transaction = {
    userId,
    id,
    amount: Number(amount),
    description,
    type,
    category,
    date: date || new Date().toISOString().split('T')[0]
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: transaction
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ transaction })
  };
}

async function seedTransactions(userId) {
  const sampleTransactions = [
    { amount: 5000, description: "Salary", type: "income", category: "Salary", date: "2026-09-01" },
    { amount: 1200, description: "Rent", type: "expense", category: "Housing", date: "2026-09-02" },
    { amount: 300, description: "Groceries", type: "expense", category: "Food", date: "2026-09-05" },
    { amount: 150, description: "Internet", type: "expense", category: "Utilities", date: "2026-09-06" },
    { amount: 50, description: "Coffee", type: "expense", category: "Food", date: "2026-09-07" },
    { amount: 200, description: "Dinner", type: "expense", category: "Food", date: "2026-09-10" },
    { amount: 100, description: "Gas", type: "expense", category: "Transport", date: "2026-09-12" },
    { amount: 400, description: "Car Insurance", type: "expense", category: "Transport", date: "2026-09-15" },
    { amount: 80, description: "Movies", type: "expense", category: "Entertainment", date: "2026-09-16" },
    { amount: 120, description: "Clothes", type: "expense", category: "Shopping", date: "2026-09-17" },
    { amount: 300, description: "Bonus", type: "income", category: "Salary", date: "2026-09-18" },
    { amount: 40, description: "Pharmacy", type: "expense", category: "Health", date: "2026-09-19" },
    { amount: 250, description: "Electric Bill", type: "expense", category: "Utilities", date: "2026-09-20" }
  ];

  const putRequests = sampleTransactions.map((t, index) => ({
    PutRequest: {
      Item: {
        userId,
        id: (Date.now() + index).toString(),
        ...t
      }
    }
  }));

  await docClient.send(new BatchWriteCommand({
    RequestItems: {
      [TABLE_NAME]: putRequests
    }
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, count: sampleTransactions.length })
  };
}

async function simulate(body) {
  const { goal, currentMonthlySavings, newMonthlySavings } = body;
  
  const currentMonths = Math.ceil(goal / currentMonthlySavings);
  const newMonths = Math.ceil(goal / newMonthlySavings);
  const monthsSaved = currentMonths - newMonths;
  
  const systemPrompt = `You are an AI financial coach. The user is simulating a new savings plan. Explain the time saved in max 2 sentences. Do NOT do any math, just use the provided numbers.`;
  const userPrompt = `I am trying to save ₹${goal}. Currently I save ₹${currentMonthlySavings} (takes ${currentMonths} months). If I save ₹${newMonthlySavings}, it will take ${newMonths} months, saving me ${monthsSaved} months. Give me a brief, encouraging explanation.`;

  const command = new ConverseCommand({
    modelId: BEDROCK_MODEL_ID,
    messages: [{ role: "user", content: [{ text: userPrompt }] }],
    system: [{ text: systemPrompt }]
  });

  const response = await bedrockClient.send(command);
  const explanation = response.output.message.content[0].text;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ currentMonths, newMonths, monthsSaved, explanation })
  };
}

async function coach(userId, body) {
  const { question } = body;

  const data = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId }
  }));
  
  const transactions = data.Items || [];
  
  let income = 0;
  let expenses = 0;
  const spendingByCategory = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      income += Number(t.amount);
    } else {
      expenses += Number(t.amount);
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Number(t.amount);
    }
  });

  const balance = income - expenses;
  let topCategory = null;
  let topAmount = 0;
  
  for (const [cat, amt] of Object.entries(spendingByCategory)) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }

  const summary = `
User Financial Summary:
Total Income: ₹${income}
Total Expenses: ₹${expenses}
Balance: ₹${balance}
Top Spending Category: ${topCategory} (₹${topAmount})
Spending by Category: ${JSON.stringify(spendingByCategory)}
  `;

  const systemPrompt = `You are an AI financial coach. Answer ONLY from the user's data provided. Cite ₹ amounts and categories directly from the summary. Max 4 sentences. End with one concrete next step.`;
  
  const command = new ConverseCommand({
    modelId: BEDROCK_MODEL_ID,
    messages: [
      {
        role: "user",
        content: [{ text: `${summary}\n\nUser Question: ${question}` }]
      }
    ],
    system: [{ text: systemPrompt }]
  });

  const response = await bedrockClient.send(command);
  const answer = response.output.message.content[0].text;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ answer })
  };
}
