import { useState } from "react";

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Bills: "📄",
  Entertainment: "🎬",
  Salary: "💰",
  Other: "📦",
};

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Salary", "Other"];

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function buildSummary(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals = {};

  for (const t of transactions) {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  }

  const spendingByCategory = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, spendingByCategory };
}

export default function Dashboard({ transactions, loading, api, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: "", description: "", type: "expense", category: "Food" });
  const [formError, setFormError] = useState("");
  const [seedMsg, setSeedMsg] = useState("");

  const { totalIncome, totalExpenses, balance, spendingByCategory } = buildSummary(transactions);
  const recent = [...transactions].slice(0, 8);

  const GOAL = 50000;
  const goalPct = Math.min(100, Math.round((balance / GOAL) * 100));

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch(`${api}/seed`, { method: "POST" });
      const data = await res.json();
      setSeedMsg(`✅ Loaded ${data.seeded} demo transactions!`);
      await onRefresh();
    } catch {
      setSeedMsg("❌ Seed failed. Check API URL.");
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(""), 3000);
    }
  }

  async function handleAddTxn(e) {
    e.preventDefault();
    setFormError("");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError("Enter a valid positive amount.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${api}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setForm({ amount: "", description: "", type: "expense", category: "Food" });
      setShowForm(false);
      await onRefresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="stat-cards">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card balance" style={{ height: 90 }}>
              <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 28, width: "80%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stat Cards */}
      <div className="stat-cards mb-20">
        <div className="stat-card balance">
          <span className="stat-icon">💳</span>
          <div className="stat-label">Balance</div>
          <div className="stat-value">{formatINR(balance)}</div>
        </div>
        <div className="stat-card income">
          <span className="stat-icon">📈</span>
          <div className="stat-label">Total Income</div>
          <div className="stat-value">{formatINR(totalIncome)}</div>
        </div>
        <div className="stat-card expense">
          <span className="stat-icon">📉</span>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{formatINR(totalExpenses)}</div>
        </div>
      </div>

      {/* Savings Goal */}
      <div className="card goal-card mb-20">
        <div className="goal-header">
          <div>
            <div className="section-title">🎯 Savings Goal</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Emergency Fund Target</div>
          </div>
          <div className="goal-pct">{goalPct}%</div>
        </div>
        <div className="goal-track">
          <div className="goal-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <div className="goal-amounts">
          <span>{formatINR(Math.max(0, balance))} saved</span>
          <span>Target: {formatINR(GOAL)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="add-txn-section">
        <div className="flex-gap mb-20">
          <button className="add-txn-toggle" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Add Transaction"}
          </button>
          <button className="seed-btn" onClick={handleSeed} disabled={seeding}>
            {seeding ? "⏳ Loading..." : "🎲 Load Demo Data"}
          </button>
          {seedMsg && <span style={{ fontSize: 13, color: "var(--accent-green)" }}>{seedMsg}</span>}
        </div>

        {showForm && (
          <form className="add-txn-form" onSubmit={handleAddTxn}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row one">
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Lunch at office"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row one">
              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="type-toggle">
                  <button type="button" className={`type-btn ${form.type === "income" ? "active-income" : ""}`} onClick={() => setForm({ ...form, type: "income" })}>
                    ↑ Income
                  </button>
                  <button type="button" className={`type-btn ${form.type === "expense" ? "active-expense" : ""}`} onClick={() => setForm({ ...form, type: "expense" })}>
                    ↓ Expense
                  </button>
                </div>
              </div>
            </div>
            {formError && <div style={{ color: "var(--accent-red)", fontSize: 12, marginBottom: 10 }}>{formError}</div>}
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Save Transaction"}
            </button>
          </form>
        )}
      </div>

      {/* Spending by Category */}
      {spendingByCategory.length > 0 && (
        <div className="card mb-20">
          <div className="section-header">
            <div className="section-title">📊 Spending Breakdown</div>
          </div>
          <div className="category-bars">
            {spendingByCategory.map((cat) => (
              <div key={cat.category} className="category-row">
                <div className="category-meta">
                  <span className="category-name">
                    {CATEGORY_ICONS[cat.category] || "📦"} {cat.category}
                  </span>
                  <div className="category-amounts">
                    <span className="category-pct">{cat.percent}%</span>
                    <span className="category-amt">{formatINR(cat.amount)}</span>
                  </div>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">🕐 Recent Transactions</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{transactions.length} total</span>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <div>No transactions yet. Load demo data or add one!</div>
          </div>
        ) : (
          <div className="txn-list">
            {recent.map((t) => (
              <div key={t.id} className="txn-item">
                <div className={`txn-icon ${t.type}`}>
                  {CATEGORY_ICONS[t.category] || "📦"}
                </div>
                <div className="txn-info">
                  <div className="txn-desc">{t.description}</div>
                  <div className="txn-meta">{t.category} · {t.date}</div>
                </div>
                <div className={`txn-amount ${t.type}`}>
                  {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
