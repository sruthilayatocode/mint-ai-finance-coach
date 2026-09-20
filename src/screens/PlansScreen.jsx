import { useState } from "react";
import { api } from "../api";
import WhatIfPanel from "../components/WhatIfPanel";
import InvestPanel from "../components/InvestPanel";
import WishlistPanel from "../components/WishlistPanel";

export default function PlansScreen({ transactions, showToast }) {
  const [plan, setPlan] = useState("whatif"); // "whatif" | "invest" | "wishlist"

  return (
    <>
      {/* Purple header */}
      <div style={{ background: "var(--bg)", padding: "28px 20px 20px" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Plans</h2>
        <div className="seg-control" style={{ background: "rgba(255,255,255,0.18)" }}>
          <button className={`seg-btn ${plan === "whatif"   ? "active" : ""}`} style={plan !== "whatif"   ? { color: "rgba(255,255,255,0.75)" } : {}} onClick={() => setPlan("whatif")}>What-If</button>
          <button className={`seg-btn ${plan === "invest"   ? "active" : ""}`} style={plan !== "invest"   ? { color: "rgba(255,255,255,0.75)" } : {}} onClick={() => setPlan("invest")}>Invest</button>
          <button className={`seg-btn ${plan === "wishlist" ? "active" : ""}`} style={plan !== "wishlist" ? { color: "rgba(255,255,255,0.75)" } : {}} onClick={() => setPlan("wishlist")}>Wishlist</button>
        </div>
      </div>

      <div className="cream-sheet">
        {plan === "whatif"   && <WhatIfPanel showToast={showToast} />}
        {plan === "invest"   && <InvestPanel transactions={transactions} showToast={showToast} />}
        {plan === "wishlist" && <WishlistPanel transactions={transactions} />}
      </div>
    </>
  );
}
