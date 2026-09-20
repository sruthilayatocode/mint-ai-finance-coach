import { useState } from "react";
import { api } from "../api";
import { Loader, LogOut } from "lucide-react";

const UPI_SAMPLES = [
  { description: "Swiggy via GPay",    amount: 340,  type: "expense", category: "Food" },
  { description: "Uber via Paytm",     amount: 180,  type: "expense", category: "Transport" },
  { description: "Amazon via PhonePe", amount: 1250, type: "expense", category: "Shopping" },
  { description: "Rent via GPay",      amount: 8000, type: "expense", category: "Bills" },
];

const PAYMENT_APPS = [
  { id: "gpay",    name: "Google Pay",  emoji: "🟢", sub: "UPI payments" },
  { id: "paytm",  name: "Paytm",       emoji: "🔵", sub: "Wallet & UPI" },
  { id: "phonepe",name: "PhonePe",     emoji: "🟣", sub: "UPI transfers" },
];

export default function SettingsScreen({ onRefresh, showToast, user, onLogout }) {
  const [connected, setConnected] = useState({});
  const [syncing, setSyncing]     = useState({});

  async function handleConnect(appId) {
    if (connected[appId]) return;
    setSyncing(s => ({ ...s, [appId]: true }));
    await new Promise(r => setTimeout(r, 2000));
    try {
      const samples = UPI_SAMPLES.filter((_, i) => i < 3);
      await Promise.all(samples.map(s => api.addTransaction({ ...s })));
      await onRefresh();
      setConnected(c => ({ ...c, [appId]: true }));
      showToast(`${samples.length} transactions auto-imported!`);
    } catch {
      showToast("Import failed. Check connection.", "error");
    } finally {
      setSyncing(s => ({ ...s, [appId]: false }));
    }
  }

  const displayName  = user?.name  || "Guest";
  const displayEmail = user?.email || "guest@mint.demo";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <div style={{ background: "var(--bg)", padding: "28px 20px 20px" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>Settings</h2>
      </div>
      <div className="cream-sheet">
        {/* Profile */}
        <div className="settings-section">
          <div className="profile-card">
            <div className="profile-avatar">{avatarLetter}</div>
            <div style={{ flex: 1 }}>
              <div className="profile-name">{displayName}</div>
              <div className="profile-sub">{displayEmail}</div>
            </div>
            {/* Log out */}
            <button
              onClick={onLogout}
              style={{
                background: "none", border: "1.5px solid var(--coral)", borderRadius: 12,
                padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
                cursor: "pointer", color: "var(--coral)", fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font)", flexShrink: 0,
              }}
              title="Log out"
            >
              <LogOut size={13} /> Log out
            </button>
          </div>
        </div>

        {/* Payment connections */}
        <div className="settings-section">
          <div className="settings-title">Connect Payment Apps</div>
          {PAYMENT_APPS.map(app => (
            <div key={app.id} className="payment-card">
              <div className="payment-logo">{app.emoji}</div>
              <div className="payment-info">
                <div className="payment-name">{app.name}</div>
                <div className="payment-sub">{app.sub}</div>
                {syncing[app.id] && (
                  <div className="syncing-text">
                    <Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> Syncing transactions...
                  </div>
                )}
                {connected[app.id] && !syncing[app.id] && (
                  <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginTop: 4 }}>✓ Connected</div>
                )}
              </div>
              <button
                className="toggle"
                style={{ background: connected[app.id] ? "var(--green)" : undefined }}
                onClick={() => !syncing[app.id] && handleConnect(app.id)}
                disabled={syncing[app.id] || connected[app.id]}
                aria-label={`Connect ${app.name}`}
              >
                <div className="toggle-knob" style={{ transform: connected[app.id] ? "translateX(20px)" : "none" }} />
              </button>
            </div>
          ))}
          <div className="demo-note">
            Demo: production uses the Account Aggregator framework (RBI-regulated) for secure, consent-based bank data access.
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, paddingBottom: 8 }}>
          MINT v1.0 · WeMakeDevs × AWS First Commit Hackathon
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
