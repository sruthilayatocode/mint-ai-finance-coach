import { useState } from "react";

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

export default function Simulator({ api }) {
  const [goal, setGoal] = useState("50000");
  const [currentSavings, setCurrentSavings] = useState("5000");
  const [newSavings, setNewSavings] = useState("8000");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function simulate() {
    const g = Number(goal);
    const cs = Number(currentSavings);
    const ns = Number(newSavings);
    if (!g || !cs || !ns || g <= 0 || cs <= 0 || ns <= 0) {
      setError("All fields must be positive numbers.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${api}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: g,
          currentMonthlySavings: cs,
          newMonthlySavings: ns,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sim-page">
      <div className="sim-header">
        <div className="sim-title">
          ✨ <span style={{ background: "linear-gradient(135deg,#6366f1,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            What-If Simulator
          </span>
        </div>
        <div className="sim-sub">See how small changes to your savings can reshape your future.</div>
      </div>

      <div className="sim-inputs">
        <div className="sim-inputs-grid">
          <div>
            <div className="sim-label">🎯 Goal Amount</div>
            <input
              className="sim-input"
              type="number"
              min="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="50000"
            />
          </div>
          <div>
            <div className="sim-label">📦 Current Monthly Savings</div>
            <input
              className="sim-input"
              type="number"
              min="1"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              placeholder="5000"
            />
          </div>
          <div>
            <div className="sim-label">🚀 What if I save…/month?</div>
            <input
              className="sim-input"
              type="number"
              min="1"
              value={newSavings}
              onChange={(e) => setNewSavings(e.target.value)}
              placeholder="8000"
            />
          </div>
        </div>

        {error && (
          <div style={{ color: "var(--accent-red)", fontSize: 12, marginBottom: 12 }}>{error}</div>
        )}

        <button className="sim-btn" onClick={simulate} disabled={loading}>
          {loading ? "⏳ Calculating…" : "🔮 Run Simulation"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="sim-result">
          {/* Side-by-side comparison */}
          <div className="comparison-cards">
            <div className="compare-card current">
              <div className="compare-plan-label">Current Plan</div>
              <div className="compare-months">{result.currentMonths}</div>
              <div className="compare-unit">months to {formatINR(goal)}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                saving {formatINR(currentSavings)}/mo
              </div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="compare-card new">
              <div className="compare-plan-label">New Plan ✦</div>
              <div className="compare-months">{result.newMonths}</div>
              <div className="compare-unit">months to {formatINR(goal)}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent-green)" }}>
                saving {formatINR(newSavings)}/mo
              </div>
            </div>
          </div>

          {/* WOW banner */}
          <div className="wow-banner">
            <div className="wow-emoji">🎉</div>
            <div className="wow-text">
              {result.monthsSaved > 0
                ? `${result.monthsSaved} month${result.monthsSaved !== 1 ? "s" : ""} earlier!`
                : result.monthsSaved === 0
                ? "Same timeline"
                : `${Math.abs(result.monthsSaved)} month${Math.abs(result.monthsSaved) !== 1 ? "s" : ""} longer`}
            </div>
            <div className="wow-sub">
              {result.monthsSaved > 0
                ? `You'll hit ${formatINR(goal)} in ${result.newMonths} months instead of ${result.currentMonths}.`
                : "Try increasing your new savings amount to see the impact!"}
            </div>
          </div>

          {/* AI explanation */}
          {result.explanation && (
            <div className="explanation-card">
              <div className="explanation-label">🤖 MINT says</div>
              <div className="explanation-text">{result.explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
