import { useState } from "react";

const QUICK_QUESTIONS = [
  "Why am I overspending?",
  "Where am I spending the most?",
  "How can I save more this month?",
  "What should I reduce?",
];

export default function AICoach({ api }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(q) {
    const query = (q || question).trim();
    if (!query) return;
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await fetch(`${api}/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");
      setAnswer(data.answer);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="coach-page">
      <div className="coach-header">
        <div className="coach-title">
          🤖 <span style={{ background: "linear-gradient(135deg,#10b981,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AI Coach
          </span>
        </div>
        <div className="coach-sub">Ask anything about your finances. I'll use your real data.</div>
      </div>

      {/* Quick-question chips */}
      <div className="quick-chips">
        {QUICK_QUESTIONS.map((q) => (
          <button key={q} className="chip" onClick={() => { setQuestion(q); ask(q); }}>
            {q}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="Ask a custom question…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button className="ask-btn" onClick={() => ask()} disabled={loading || !question.trim()}>
          {loading ? "Thinking…" : "Ask →"}
        </button>
      </div>

      {/* Answer area */}
      <div className="chat-area">
        {loading && (
          <div className="loading-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        )}
        {error && (
          <div style={{ color: "var(--accent-red)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
        {answer && !loading && (
          <div className="answer-bubble">
            <div className="answer-badge">🌿 MINT says</div>
            <div className="answer-text">{answer}</div>
          </div>
        )}
        {!answer && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <div>Select a quick question or type your own above.</div>
          </div>
        )}
      </div>
    </div>
  );
}
