import { useState } from "react";

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

const CAT_ICONS = { Food:"🍔", Transport:"🚌", Shopping:"🛍️", Bills:"📄", Entertainment:"🎬", Salary:"💰", Other:"📦" };
const CAT_CLASS  = { Food:"food", Transport:"transport", Shopping:"shopping", Bills:"bills", Entertainment:"entertainment", Salary:"salary", Other:"other" };

// Bar colors for stats view
const BAR_COLORS = ["#F0705F","#6F78C4","#F5A93A","#7DB35A"];

function buildStats(txns) {
  let inc = 0, exp = 0;
  const catMap = {};
  for (const t of txns) {
    if (t.type === "income") inc += t.amount;
    else {
      exp += t.amount;
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    }
  }
  const cats = Object.entries(catMap)
    .map(([cat, amt]) => ({ cat, amt, pct: exp > 0 ? Math.round((amt / exp) * 100) : 0 }))
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 4);
  const savings = inc - exp;
  return { inc, exp, cats, savings, savingsPct: inc > 0 ? Math.round((savings / inc) * 100) : 0, expPct: inc > 0 ? Math.round((exp / inc) * 100) : 0, incPct: 100 };
}

export default function ExpensesScreen({ transactions, loading }) {
  const [view, setView] = useState("transactions"); // "transactions" | "stats"
  const { inc, exp, cats, savings, savingsPct, expPct } = buildStats(transactions);
  const maxCatPct = cats.length > 0 ? cats[0].pct : 100;

  return (
    <>
      {/* Purple header with balance */}
      <div style={{ background: "var(--bg)", padding: "28px 20px 20px" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Expenses</h2>
        <div className="balance-card" style={{ marginBottom: 0 }}>
          <div className="balance-chip"><span>📊</span> Overview</div>
          <div className="balance-label">Total Expenses</div>
          {loading
            ? <div className="skeleton" style={{ height: 38, width: "60%", marginBottom: 6 }} />
            : <div className="balance-amount" style={{ color: "var(--coral)" }}>{formatINR(exp)}</div>
          }
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mid)", marginTop: 8 }}>
            Income: <span style={{ color: "var(--green)" }}>{formatINR(inc)}</span>
          </div>
        </div>
      </div>

      {/* Cream sheet */}
      <div className="cream-sheet">
        {/* Segmented toggle */}
        <div className="seg-control" style={{ marginBottom: 20 }}>
          <button className={`seg-btn ${view === "transactions" ? "active" : ""}`} onClick={() => setView("transactions")}>Transactions</button>
          <button className={`seg-btn ${view === "stats" ? "active" : ""}`} onClick={() => setView("stats")}>Stats</button>
        </div>

        {/* Transactions view */}
        {view === "transactions" && (
          loading ? [1,2,3,4].map(i => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom:12 }}>
              <div className="skeleton" style={{ width:40, height:40, borderRadius:14, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div className="skeleton" style={{ height:14, width:"65%", marginBottom:6 }} />
                <div className="skeleton" style={{ height:11, width:"40%" }} />
              </div>
            </div>
          )) :
          transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No transactions yet.<br/>Go to Home and load demo data!</div>
            </div>
          ) : (
            <div className="txn-list">
              {transactions.map(t => (
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
          )
        )}

        {/* Stats view */}
        {view === "stats" && !loading && (
          <>
            {cats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div className="empty-text">No expense data yet.</div>
              </div>
            ) : (
              <>
                <div className="section-heading" style={{ marginBottom: 16 }}>Main Expenses</div>
                {/* Vertical bars */}
                <div className="cat-bars-row">
                  {cats.map((c, i) => (
                    <div key={c.cat} className="cat-bar-col">
                      <span className="cat-bar-pct" style={{ color: BAR_COLORS[i] }}>{c.pct}%</span>
                      <div className="cat-bar-track">
                        <div className="cat-bar-fill" style={{
                          height: `${Math.round((c.pct / maxCatPct) * 100)}%`,
                          background: BAR_COLORS[i]
                        }} />
                      </div>
                      <span className="cat-bar-label">{c.cat}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-mid)" }}>{formatINR(c.amt)}</span>
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

        {view === "stats" && loading && (
          <div style={{ display:"flex", gap:10 }}>
            {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{flex:1, height:120, borderRadius:12}}/>)}
          </div>
        )}
      </div>
    </>
  );
}
