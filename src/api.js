// src/api.js — central API layer for MINT
// Set VITE_USE_MOCK=true in .env.local to run without a live backend.

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const NORMAL_TIMEOUT_MS = 10000;
const AI_TIMEOUT_MS = 30000;

// ── Mock data store (in-memory) ───────────────────────────────────────────────
const now = new Date();
const m = (offset = 0) => {
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const day = (month, d) => `${month}-${String(d).padStart(2, "0")}`;

let mockTxns = [
  { id: "1001", userId: "demo-user", amount: 65000, description: "Monthly Salary",       type: "income",  category: "Salary",        date: day(m(0), 1)  },
  { id: "1002", userId: "demo-user", amount: 4200,  description: "Swiggy & Zomato",       type: "expense", category: "Food",          date: day(m(0), 3)  },
  { id: "1003", userId: "demo-user", amount: 1800,  description: "Metro & Ola rides",     type: "expense", category: "Transport",     date: day(m(0), 5)  },
  { id: "1004", userId: "demo-user", amount: 8500,  description: "Myntra sale",           type: "expense", category: "Shopping",      date: day(m(0), 7)  },
  { id: "1005", userId: "demo-user", amount: 2200,  description: "Electricity bill",      type: "expense", category: "Bills",         date: day(m(0), 10) },
  { id: "1006", userId: "demo-user", amount: 999,   description: "Netflix + Spotify",     type: "expense", category: "Entertainment", date: day(m(0), 12) },
  { id: "1007", userId: "demo-user", amount: 3100,  description: "Groceries - DMart",     type: "expense", category: "Food",          date: day(m(0), 15) },
  { id: "1008", userId: "demo-user", amount: 650,   description: "Petrol",                type: "expense", category: "Transport",     date: day(m(0), 18) },
  { id: "1009", userId: "demo-user", amount: 65000, description: "Monthly Salary",        type: "income",  category: "Salary",        date: day(m(1), 1)  },
  { id: "1010", userId: "demo-user", amount: 5800,  description: "Restaurants & cafes",   type: "expense", category: "Food",          date: day(m(1), 4)  },
  { id: "1011", userId: "demo-user", amount: 2100,  description: "Uber & auto rides",     type: "expense", category: "Transport",     date: day(m(1), 8)  },
  { id: "1012", userId: "demo-user", amount: 3500,  description: "Amazon purchases",      type: "expense", category: "Shopping",      date: day(m(1), 11) },
  { id: "1013", userId: "demo-user", amount: 1200,  description: "Internet & mobile",     type: "expense", category: "Bills",         date: day(m(1), 14) },
  { id: "1014", userId: "demo-user", amount: 1500,  description: "Movie + bowling",       type: "expense", category: "Entertainment", date: day(m(1), 20) },
  { id: "1015", userId: "demo-user", amount: 2900,  description: "Groceries - BigBasket", type: "expense", category: "Food",          date: day(m(1), 22) },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Mock implementations ──────────────────────────────────────────────────────
const mock = {
  async getTransactions() {
    await delay(400);
    return { transactions: [...mockTxns].reverse() };
  },
  async addTransaction(body) {
    await delay(300);
    const id = Date.now().toString();
    const item = { ...body, id, userId: "demo-user", date: new Date().toISOString().slice(0, 10) };
    mockTxns.push(item);
    return { transaction: item };
  },
  async seed() {
    await delay(500);
    // Already seeded above - no-op in mock; just return count
    return { ok: true, count: mockTxns.length };
  },
  async simulate({ goal, currentMonthlySavings, newMonthlySavings }) {
    await delay(600);
    const g = Number(goal), cs = Number(currentMonthlySavings), ns = Number(newMonthlySavings);
    const currentMonths = Math.ceil(g / cs);
    const newMonths = Math.ceil(g / ns);
    const monthsSaved = currentMonths - newMonths;
    return {
      currentMonths, newMonths, monthsSaved,
      explanation: `By saving ₹${ns.toLocaleString("en-IN")} per month, you'll reach your ₹${g.toLocaleString("en-IN")} goal in just ${newMonths} months — ${monthsSaved} months sooner than your current plan! Small consistent changes make a huge difference over time.`,
    };
  },
  async coach({ question }) {
    await delay(800);
    return { answer: `[Mock mode] Based on your spending data, here's some advice about: "${question}". Your top expense category is Food, followed by Shopping. Consider setting a monthly cap on discretionary spending. Next step: allocate 20% of your salary to savings before spending.` };
  },
};

function normalizeTransaction(t) {
  return {
    ...t,
    amount: Number(t.amount) || 0,
    type: t.type === "income" ? "income" : "expense",
    category: t.category || "Other",
    description: t.description || "Transaction",
    date: t.date || new Date().toISOString().slice(0, 10),
  };
}

function normalizeTransactions(data) {
  return {
    ...data,
    transactions: (data.transactions || []).map(normalizeTransaction),
  };
}

function normalizeAddResult(data) {
  return {
    ...data,
    transaction: data.transaction ? normalizeTransaction(data.transaction) : data.transaction,
  };
}

async function apiFetch(path, options = {}, timeoutMs = NORMAL_TIMEOUT_MS) {
  if (!API_URL) throw new Error("Missing VITE_API_URL");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.error || data.message || `API error ${res.status}`);
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// ── Public API surface ────────────────────────────────────────────────────────
export const api = {
  getTransactions: () =>
    USE_MOCK ? mock.getTransactions() : apiFetch("/transactions").then(normalizeTransactions),

  addTransaction: (body) =>
    USE_MOCK ? mock.addTransaction(body) : apiFetch("/transactions", { method: "POST", body: JSON.stringify(body) }).then(normalizeAddResult),

  seed: () =>
    USE_MOCK ? mock.seed() : apiFetch("/seed", { method: "POST" }),

  simulate: (body) =>
    USE_MOCK ? mock.simulate(body) : apiFetch("/simulate", { method: "POST", body: JSON.stringify(body) }, AI_TIMEOUT_MS),

  coach: (body) =>
    USE_MOCK ? mock.coach(body) : apiFetch("/coach", { method: "POST", body: JSON.stringify(body) }, AI_TIMEOUT_MS),

  async ping() {
    const started = performance.now();
    await (USE_MOCK ? mock.getTransactions() : apiFetch("/transactions"));
    return Math.round(performance.now() - started);
  },
};
