import { useState } from "react";
import { api } from "../api";

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

export default function WhatIfPanel({ showToast }) {
  const [goal, setGoal]         = useState("50000");
  const [curSav, setCurSav]     = useState("5000");
  const [newSav, setNewSav]     = useState("8000");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  async function simulate() {
    const g = Number(goal), cs = Number(curSav), ns = Number(newSav);
    if (!g || !cs || !ns || g <= 0 || cs <= 0 || ns <= 0) {
      showToast("All values must be positive.", "error");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await api.simulate({ goal: g, currentMonthlySavings: cs, newMonthlySavings: ns });
      setResult(data);
    } catch (e) {
      showToast("Simulation failed: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>What-If Simulator</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>See how saving more gets you to your goal faster</div>
      </div>

      {/* Inputs */}
      <div className="form-field">
        <label className="form-label">🎯 Goal Amount</label>
        <input className="form-input" type="number" min="1" placeholder="50000" value={goal} onChange={e => setGoal(e.target.value)} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div className="form-field">
          <label className="form-label">📦 Current Savings/mo</label>
          <input className="form-input" type="number" min="1" placeholder="5000" value={curSav} onChange={e => setCurSav(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">🚀 New Savings/mo</label>
          <input className="form-input" type="number" min="1" placeholder="8000" value={newSav} onChange={e => setNewSav(e.target.value)} />
        </div>
      </div>
      <button className="btn-orange" style={{ marginBottom: 20 }} onClick={simulate} disabled={loading}>
        {loading ? "Calculating…" : "🔮 Run Simulation"}
      </button>

      {loading && <div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>}

      {result && (
        <div style={{ animation:"fadeUp 0.4s ease" }}>
          {/* Side-by-side */}
          <div className="sim-compare" style={{ marginBottom: 14 }}>
            <div className="sim-card current">
              <div className="sim-card-label">Current Plan</div>
              <div className="sim-card-months">{result.currentMonths}</div>
              <div className="sim-card-unit">months</div>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:6, fontWeight:600 }}>saving {formatINR(curSav)}/mo</div>
            </div>
            <div className="sim-card new-plan">
              <div className="sim-card-label">New Plan ✦</div>
              <div className="sim-card-months">{result.newMonths}</div>
              <div className="sim-card-unit">months</div>
              <div style={{ fontSize:11, color:"var(--green)", marginTop:6, fontWeight:600 }}>saving {formatINR(newSav)}/mo</div>
            </div>
          </div>

          {/* WOW banner */}
          <div className="wow-banner">
            <div className="wow-emoji">🎉</div>
            <div className="wow-months">
              {result.monthsSaved > 0
                ? `${result.monthsSaved} month${result.monthsSaved !== 1 ? "s" : ""} earlier!`
                : result.monthsSaved === 0
                ? "Same timeline!"
                : `${Math.abs(result.monthsSaved)} month${Math.abs(result.monthsSaved) !== 1 ? "s" : ""} longer`}
            </div>
            <div className="wow-sub">
              Reach {formatINR(goal)} by month {result.newMonths} instead of {result.currentMonths}
            </div>
          </div>

          {/* AI explanation */}
          {result.explanation && (
            <div className="answer-bubble">
              <div className="answer-badge">🤖 MINT says</div>
              <div className="answer-text">{result.explanation}</div>
              <div className="answer-source">Answered by Amazon Bedrock</div>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
