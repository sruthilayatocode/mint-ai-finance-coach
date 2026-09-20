import { useState } from "react";
import { useStore } from "../store";

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

const CAT_ICONS = { Food:"🍔", Transport:"🚌", Shopping:"🛍️", Bills:"📄", Entertainment:"🎬", Salary:"💰", Other:"📦" };
const CAT_CLASS  = { Food:"food", Transport:"transport", Shopping:"shopping", Bills:"bills", Entertainment:"entertainment", Salary:"salary", Other:"other" };
const BAR_COLORS = ["#F0705F","#6F78C4","#F5A93A","#7DB35A"];

export default function ExpensesScreen() {
  const { transactions, loading, summary, categoryStats } = useStore();
  const [view, setView] = useState("transactions"); // "transactions" | "stats"
  const [search, setSearch] = useState("");

  const { totalIncome, totalExpenses, balance } = summary;
  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const maxCatPct = categoryStats.length > 0 ? categoryStats[0].pct : 100;
  const expPct = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
  const savings = totalIncome - totalExpenses;
  const savingsPct = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  return (
    <>
      {/* Purple header with title "Transactions" */}
      <div style={{ background: "var(--bg)", padding: "28px 20px 20px" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Transactions</h2>
        <div className="balance-card" style={{ marginBottom: 0 }}>
          <div className="balance-chip"><span>📊</span> Overview</div>
          <div className="balance-label">Total Expenses</div>
          {loading
            ? <div className="skeleton" style={{ height: 38, width: "60%", marginBottom: 6 }} />
            : <div className="balance-amount" style={{ color: "var(--coral)" }}>{formatINR(totalExpenses)}</div>
          }
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mid)", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Income: <strong style={{ color: "var(--green)" }}>{formatINR(totalIncome)}</strong></span>
            <span>Net: <strong style={{ color: balance >= 0 ? "var(--green)" : "var(--coral)" }}>{formatINR(balance)}</strong></span>
          </div>
        </div>
      </div>

      {/* Cream sheet */}
      <div className="cream-sheet">
        {/* Segmented toggle */}
        <div className="seg-control" style={{ marginBottom: 16 }}>
          <button className={`seg-btn ${view === "transactions" ? "active" : ""}`} onClick={() => setView("transactions")}>
            Transactions ({transactions.length})
          </button>
          <button className={`seg-btn ${view === "stats" ? "active" : ""}`} onClick={() => setView("stats")}>
            Stats
          </button>
        </div>

        {/* Transactions view */}
        {view === "transactions" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ borderRadius: 12, fontSize: 13 }}
              />
            </div>

            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: "65%", marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: "40%" }} />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-text">
                  {search ? "No matching transactions found." : "No transactions yet.\nGo to Home and load demo data!"}
                </div>
              </div>
            ) : (
              <div className="txn-list">
                {filtered.map(t => (
                  <div key={t.id || t.timestamp} className="txn-row">
                    <div className={`txn-cat-icon ${CAT_CLASS[t.category] || "other"}`}>
                      {CAT_ICONS[t.category] || "📦"}
                    </div>
                    <div className="txn-row-info">
                      <div className="txn-row-name">{t.description}</div>
                      <div className="txn-row-date">{t.category} · {t.date}</div>
                    </div>
                    <div className={`txn-row-amount ${t.type}`}>
                      {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Stats view */}
        {view === "stats" && !loading && (
          <>
            {categoryStats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div className="empty-text">No expense data yet.</div>
              </div>
            ) : (
              <>
                <div className="section-heading" style={{ marginBottom: 16 }}>Main Expenses</div>
                <div className="cat-bars-row">
                  {categoryStats.map((c, i) => (
                    <div key={c.category} className="cat-bar-col">
                      <span className="cat-bar-pct" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{c.pct}%</span>
                      <div className="cat-bar-track">
                        <div
                          className="cat-bar-fill"
                          style={{
                            height: `${Math.round((c.pct / maxCatPct) * 100)}%`,
                            background: BAR_COLORS[i % BAR_COLORS.length]
                          }}
                        />
                      </div>
                      <span className="cat-bar-label">{c.category}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-mid)" }}>{formatINR(c.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="section-heading" style={{ margin: "20px 0 12px" }}>Comparison</div>
                <div className="badge-row">
                  <div className="badge-hex expense-b">
                    <span className="badge-hex-pct" style={{ color: "var(--coral)" }}>{expPct}%</span>
                    <span className="badge-hex-label">Expenses</span>
                  </div>
                  <div className="badge-hex income-b">
                    <span className="badge-hex-pct" style={{ color: "var(--green)" }}>100%</span>
                    <span className="badge-hex-label">Income</span>
                  </div>
                  <div className="badge-hex saving-b">
                    <span className="badge-hex-pct" style={{ color: "var(--blue)" }}>{savingsPct > 0 ? savingsPct : 0}%</span>
                    <span className="badge-hex-label">Savings</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
