import { useState } from "react";

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

function getMonthlyBalance(transactions) {
  // Use average monthly surplus as savings rate
  let inc = 0, exp = 0;
  for (const t of transactions) {
    if (t.type === "income") inc += t.amount;
    else exp += t.amount;
  }
  const balance = inc - exp;
  // Monthly savings estimate: if 2 months of data, halve it
  const months = [...new Set(transactions.map(t => (t.date || "").slice(0,7)))].length || 1;
  return { balance, monthlySavings: Math.max(0, Math.round((inc - exp) / months)) };
}

export default function WishlistPanel({ transactions }) {
  const [items, setItems]     = useState([]);
  const [name, setName]       = useState("");
  const [price, setPrice]     = useState("");
  const [notification, setNotification] = useState(null);

  const { balance, monthlySavings } = getMonthlyBalance(transactions);

  function addItem() {
    const p = Number(price);
    if (!name.trim() || !p || p <= 0) return;
    const id = Date.now();
    const canAfford = balance >= p;
    const monthsNeeded = canAfford ? 0 : Math.ceil((p - balance) / (monthlySavings || 1));
    setItems(prev => [...prev, { id, name: name.trim(), price: p, canAfford, monthsNeeded, droppedPrice: null, notifShown: false }]);
    setName(""); setPrice("");
  }

  // Demo: simulate a 15% price drop for an item
  function simulatePriceDrop(id) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const droppedPrice = Math.round(item.price * 0.85);
      const canAffordNow = balance >= droppedPrice;
      const newMonths = canAffordNow ? 0 : Math.ceil((droppedPrice - balance) / (monthlySavings || 1));
      const monthsSaved = item.monthsNeeded - newMonths;
      // Show in-app notification banner
      setNotification({ name: item.name, droppedPrice, monthsSaved: Math.max(0, monthsSaved), canAffordNow });
      setTimeout(() => setNotification(null), 4000);
      return { ...item, droppedPrice, monthsNeeded: newMonths, canAfford: canAffordNow };
    }));
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 2 }}>Purchase Planner</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
          Balance: <span style={{ color:"var(--green)", fontWeight:700 }}>{formatINR(balance)}</span>
          {" · "}Saves ~{formatINR(monthlySavings)}/mo
        </div>
      </div>

      {/* In-app notification banner */}
      {notification && (
        <div className="notif-banner green-notif">
          🔔 Price dropped to {formatINR(notification.droppedPrice)} for "{notification.name}"!
          {notification.monthsSaved > 0
            ? ` You can buy it ${notification.monthsSaved} months sooner.`
            : " You can afford it now!"}
        </div>
      )}

      {/* Add item */}
      <div className="wish-add-row" style={{ flexWrap:"wrap", gap:8 }}>
        <input className="form-input" style={{ flex:2, minWidth:120 }} placeholder="Item name" value={name} onChange={e => setName(e.target.value)} />
        <input className="form-input" style={{ flex:1, minWidth:90 }} type="number" placeholder="₹ price" value={price} onChange={e => setPrice(e.target.value)} />
        <button className="btn-orange" style={{ flex:"0 0 auto", width:"auto", padding:"12px 20px", fontSize:13 }} onClick={addItem}>Add</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 24 }}>
          <div className="empty-icon">🛒</div>
          <div className="empty-text">Add something you want to buy!<br/>MINT will tell you when you can afford it.</div>
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className="wishlist-item">
            <div className="wish-row">
              <div className="wish-name">{item.name}</div>
              <div className="wish-price">
                {item.droppedPrice
                  ? <><s style={{ color:"var(--text-muted)", fontSize:12 }}>{formatINR(item.price)}</s> {formatINR(item.droppedPrice)}</>
                  : formatINR(item.price)
                }
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {item.canAfford
                ? <span className="wish-badge can-afford">✅ You can afford this now!</span>
                : <>
                    <span className="wish-badge postponed">🕐 Affordable in ~{item.monthsNeeded} months</span>
                    <span className="wish-badge watching">👀 Watching price</span>
                  </>
              }
            </div>
            {/* Demo: simulate price drop button — comment in code as demo simulation */}
            {!item.canAfford && item.droppedPrice === null && (
              <button className="btn-small" style={{ marginTop:10 }} onClick={() => simulatePriceDrop(item.id)}>
                🎯 Simulate 15% price drop {/* DEMO SIMULATION – not real price tracking */}
              </button>
            )}
            {item.droppedPrice !== null && (
              <div className="price-drop-banner">
                🎉 Price dropped 15%! New price: {formatINR(item.droppedPrice)}
                {item.canAfford ? " — Buy it now!" : ` — Now affordable in ~${item.monthsNeeded} months`}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
