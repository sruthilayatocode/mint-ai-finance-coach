import { useState } from "react";
import { useStore } from "../store";
import WhatIfPanel from "../components/WhatIfPanel";
import InvestPanel from "../components/InvestPanel";
import WishlistPanel from "../components/WishlistPanel";

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

export default function PlansScreen({ showToast }) {
  const { transactions, safeToSpend, settings } = useStore();
  const [plan, setPlan] = useState("whatif"); // "whatif" | "invest" | "wishlist"

  return (
    <>
      {/* Purple header */}
      <div style={{ background: "var(--bg)", padding: "28px 20px 20px" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Plans</h2>
        
        {/* Safe to spend banner */}
        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Safe-to-Spend Balance</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{formatINR(safeToSpend)}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9BE564", textAlign: "right" }}>
            Monthly Target<br />{formatINR(settings.monthlySavings)}
          </div>
        </div>

        <div className="seg-control" style={{ background: "rgba(255,255,255,0.18)" }}>
          {settings.flags.plan && (
            <button className={`seg-btn ${plan === "whatif" ? "active" : ""}`} style={plan !== "whatif" ? { color: "rgba(255,255,255,0.75)" } : {}} onClick={() => setPlan("whatif")}>
              What-If
            </button>
          )}
          {settings.flags.investGuide && (
            <button className={`seg-btn ${plan === "invest" ? "active" : ""}`} style={plan !== "invest" ? { color: "rgba(255,255,255,0.75)" } : {}} onClick={() => setPlan("invest")}>
              Invest
            </button>
          )}
          <button className={`seg-btn ${plan === "wishlist" ? "active" : ""}`} style={plan !== "wishlist" ? { color: "rgba(255,255,255,0.75)" } : {}} onClick={() => setPlan("wishlist")}>
            Wishlist
          </button>
        </div>
      </div>

      <div className="cream-sheet">
        {plan === "whatif"   && settings.flags.plan && <WhatIfPanel showToast={showToast} />}
        {plan === "invest"   && settings.flags.investGuide && <InvestPanel transactions={transactions} showToast={showToast} />}
        {plan === "wishlist" && <WishlistPanel transactions={transactions} />}
      </div>
    </>
  );
}
