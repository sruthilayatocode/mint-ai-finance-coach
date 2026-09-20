import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../api";
import AddTransactionSheet from "../components/AddTransactionSheet";

const GOAL = 50000;

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function buildSummary(txns) {
  let inc = 0, exp = 0;
  for (const t of txns) {
    if (t.type === "income") inc += t.amount;
    else exp += t.amount;
  }
  return { totalIncome: inc, totalExpenses: exp, balance: inc - exp };
}

// Friendly inline SVG illustration (plant / piggy bank icon)
function HeroIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="40" cy="50" rx="20" ry="14" fill="#FAF7EE" opacity="0.9"/>
      <path d="M40 36c0-8 6-14 6-14s-4 4-4 14" stroke="#7DB35A" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M40 36c0-8-6-14-6-14s4 4 4 14" stroke="#7DB35A" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="40" cy="38" r="4" fill="#7DB35A"/>
      <rect x="32" y="48" width="16" height="10" rx="5" fill="#F5A93A"/>
      <circle cx="44" cy="48" r="2" fill="#FAF7EE"/>
      <path d="M36 58c0 2 1.8 4 4 4s4-2 4-4" stroke="#FAF7EE" strokeWidth="1.5"/>
    </svg>
  );
}

export default function HomeScreen({ transactions, loading, onRefresh, showToast, user }) {
  const [addOpen, setAddOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const { totalIncome, totalExpenses, balance } = buildSummary(transactions);
  const goalPct = Math.min(100, Math.max(0, Math.round((balance / GOAL) * 100)));
  const recent = [...transactions].slice(0, 6);

  const CAT_ICONS = {
    Food: "🍔", Transport: "🚌", Shopping: "🛍️",
    Bills: "📄", Entertainment: "🎬", Salary: "💰", Other: "📦",
  };
  const CAT_CLASS = {
    Food: "food", Transport: "transport", Shopping: "shopping",
    Bills: "bills", Entertainment: "entertainment", Salary: "salary", Other: "other",
  };

  async function handleSeed() {
    setSeeding(true);
    try {
      const data = await api.seed();
      showToast(`🎲 ${data.seeded} demo transactions loaded!`);
      await onRefresh();
    } catch {
      showToast("Seed failed. Check API URL.", "error");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      {/* Purple header zone */}
      <div style={{ padding: "28px 20px 20px", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>Good morning 🌿</p>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>Hello, {user?.name || "there"}.</h1>
          </div>
          <HeroIllustration />
        </div>

        {/* Balance card */}
        <div className="balance-card">
          <div className="balance-chip">
            <span>💳</span> Main Card
          </div>
          <div className="balance-label">Available balance</div>
          {loading
            ? <div className="skeleton" style={{ height: 42, width: "70%", marginBottom: 6 }} />
            : <div className="balance-amount">{formatINR(balance)}</div>
          }
          <div className="balance-card-row" style={{ marginTop: 12 }}>
            <div className="balance-dots">
              <div className="balance-dot active" /><div className="balance-dot" /><div className="balance-dot" />
            </div>
            <button className="btn-small" onClick={handleSeed} disabled={seeding} style={{ background: "var(--navy)", color: "white" }}>
              {seeding ? "Loading…" : "🎲 Demo data"}
            </button>
          </div>
        </div>
      </div>

      {/* Cream sheet */}
      <div className="cream-sheet">
        {/* Income / Expense mini cards */}
        <div className="mini-cards">
          <div className="mini-card income-card">
            <div className="mini-card-icon">📈</div>
            <div className="mini-card-label">Income</div>
            {loading
              ? <div className="skeleton" style={{ height: 22, width: "80%" }} />
              : <div className="mini-card-value" style={{ color: "var(--green)" }}>{formatINR(totalIncome)}</div>
            }
          </div>
          <div className="mini-card expense-card">
            <div className="mini-card-icon">📉</div>
            <div className="mini-card-label">Expenses</div>
            {loading
              ? <div className="skeleton" style={{ height: 22, width: "80%" }} />
              : <div className="mini-card-value" style={{ color: "var(--coral)" }}>{formatINR(totalExpenses)}</div>
            }
          </div>
        </div>

        {/* Savings goal */}
        <div className="goal-card">
          <div className="goal-top">
            <span className="goal-title">🎯 Emergency Fund</span>
            <span className="goal-pct">{goalPct}%</span>
          </div>
          <div className="goal-track"><div className="goal-fill" style={{ width: `${goalPct}%` }} /></div>
          <div className="goal-sub">
            <span>{formatINR(Math.max(0, balance))} saved</span>
            <span>Target {formatINR(GOAL)}</span>
          </div>
        </div>

        {/* Add Transaction */}
        <button className="btn-orange" style={{ marginBottom: 20 }} onClick={() => setAddOpen(true)}>
          <Plus size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Add Transaction
        </button>

        {/* Recent transactions */}
        <div className="section-heading">
          Recent
          <span className="section-heading-link">{transactions.length} total</span>
        </div>

        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom:10 }}>
              <div className="skeleton" style={{ width:40, height:40, borderRadius:14, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div className="skeleton" style={{ height:14, width:"65%", marginBottom:6 }} />
                <div className="skeleton" style={{ height:11, width:"40%" }} />
              </div>
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <div className="empty-text">No transactions yet.<br/>Load demo data or add one above!</div>
          </div>
        ) : (
          <div className="txn-list" style={{ paddingBottom: 8 }}>
            {recent.map(t => (
              <div key={t.id} className="txn-row">
                <div className={`txn-cat-icon ${CAT_CLASS[t.category] || "other"}`}>{CAT_ICONS[t.category] || "📦"}</div>
                <div className="txn-row-info">
                  <div className="txn-row-name">{t.description}</div>
                  <div className="txn-row-date">{t.category} · {t.date}</div>
                </div>
                <div className={`txn-row-amount ${t.type}`}>{t.type === "income" ? "+" : "-"}{formatINR(t.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addOpen && (
        <AddTransactionSheet
          onClose={() => setAddOpen(false)}
          onSaved={onRefresh}
          showToast={showToast}
        />
      )}
    </>
  );
}
