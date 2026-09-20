import { useState } from "react";
import { api } from "../api";

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

// ── Pure JS investment computation ────────────────────────────────────────────
function computePlan(transactions) {
  let inc = 0, exp = 0;
  for (const t of transactions) {
    if (t.type === "income") inc += t.amount;
    else exp += t.amount;
  }
  const surplus = inc - exp;
  const monthlyExp = exp; // treat total as "monthly" for simplicity in demo
  const emergencyTarget = 3 * (monthlyExp || 1);
  const balance = surplus; // demo: use surplus as proxy for current balance

  return { inc, exp, surplus, emergencyTarget, balance };
}

export default function InvestPanel({ transactions, showToast }) {
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  const { inc, exp, surplus, emergencyTarget } = computePlan(transactions);

  if (surplus <= 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-text">Build a surplus first.<br/>Your expenses exceed income. Reduce spending to start investing.</div>
      </div>
    );
  }

  // Step 1: Emergency fund (60% of surplus)
  const emergencyAlloc = Math.round(surplus * 0.60);
  // Remaining 40% split: 50% FD/RD, 30% Nifty 50, 20% Gold/PPF
  const remaining = surplus - emergencyAlloc;
  const fdAlloc   = Math.round(remaining * 0.50);
  const niftyAlloc= Math.round(remaining * 0.30);
  const goldAlloc = Math.round(remaining * 0.20);

  const planSummary = `Emergency fund: ${formatINR(emergencyAlloc)}/mo (target: ${formatINR(emergencyTarget)}). FD/RD: ${formatINR(fdAlloc)}/mo. Nifty 50 SIP: ${formatINR(niftyAlloc)}/mo. Gold/PPF: ${formatINR(goldAlloc)}/mo. Monthly surplus: ${formatINR(surplus)}.`;

  async function explainPlan() {
    setCoachLoading(true);
    setCoachAnswer("");
    try {
      const data = await api.coach({ question: `Explain my investment plan: ${planSummary}. Is this a good approach for a beginner?` });
      setCoachAnswer(data.answer);
    } catch (e) {
      showToast("Coach error: " + e.message, "error");
    } finally {
      setCoachLoading(false);
    }
  }

  const PLAN_CARDS = [
    {
      icon: "🏦",
      bg: "#E8F5DC",
      name: "Emergency Fund",
      desc: `Build a 3-month buffer. Target: ${formatINR(emergencyTarget)}`,
      amount: emergencyAlloc,
      risk: "Safe",
      riskClass: "safe",
    },
    {
      icon: "📈",
      bg: "#E4E6F7",
      name: "FD / RD",
      desc: "Fixed deposit or recurring deposit at ~7% p.a.",
      amount: fdAlloc,
      risk: "Low",
      riskClass: "low",
    },
    {
      icon: "🇮🇳",
      bg: "#FFF0D6",
      name: "Nifty 50 Index SIP",
      desc: "Broad market exposure. Stay invested 5+ years.",
      amount: niftyAlloc,
      risk: "Moderate",
      riskClass: "mod",
    },
    {
      icon: "🥇",
      bg: "#FDEAE8",
      name: "Gold / PPF",
      desc: "Sovereign gold bonds or PPF for tax-free growth.",
      amount: goldAlloc,
      risk: "Safe",
      riskClass: "safe",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 2 }}>Smart Investment Plan</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
          Monthly surplus: <span style={{ color:"var(--green)", fontWeight:700 }}>{formatINR(surplus)}</span>
        </div>
      </div>

      {PLAN_CARDS.map(card => (
        <div key={card.name} className="invest-card">
          <div className="invest-icon" style={{ background: card.bg }}>{card.icon}</div>
          <div className="invest-info">
            <div className="invest-name">{card.name}</div>
            <div className="invest-amount">{formatINR(card.amount)}<span style={{ fontSize:11, fontWeight:600, color:"var(--text-muted)" }}>/mo</span></div>
            <div style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", marginBottom:6 }}>{card.desc}</div>
            <span className={`invest-risk ${card.riskClass}`}>{card.risk}</span>
          </div>
        </div>
      ))}

      {/* Backup plan */}
      <div className="backup-card">
        <div className="backup-title">🛡️ Backup Plan</div>
        <div className="backup-text">
          <b>If income drops:</b> Pause the SIP first, keep FD/RD, use emergency fund if needed.<br />
          <b>If the market falls 15%:</b> Don't sell — continue your SIP. Market dips are buying opportunities for long-term investors.
        </div>
      </div>

      {/* Explain with AI */}
      <button className="btn-outline" style={{ marginBottom: 12 }} onClick={explainPlan} disabled={coachLoading}>
        {coachLoading ? "Asking MINT…" : "🤖 Explain this plan"}
      </button>

      {coachLoading && <div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>}

      {coachAnswer && !coachLoading && (
        <div className="answer-bubble" style={{ marginBottom: 12 }}>
          <div className="answer-badge">🤖 MINT says</div>
          <div className="answer-text">{coachAnswer}</div>
        </div>
      )}

      <div className="disclaimer">
        Illustrative suggestions for learning, not licensed investment advice.
      </div>
    </div>
  );
}
