import { useEffect, useState } from "react";
import { useStore } from "../store";
import { api } from "../api";
import { Cloud, Loader, LogOut, RefreshCw, Trash2 } from "lucide-react";

const SOURCE_SAMPLES = {
  bank: [
    { description: "HDFC salary credit", amount: 65000, type: "income", category: "Salary" },
    { description: "HDFC electricity bill", amount: 2200, type: "expense", category: "Bills" },
  ],
  gpay: [
    { description: "GPay Swiggy", amount: 340, type: "expense", category: "Food" },
    { description: "GPay rent transfer", amount: 8000, type: "expense", category: "Bills" },
  ],
  paytm: [
    { description: "Paytm Uber ride", amount: 180, type: "expense", category: "Transport" },
    { description: "Paytm movie tickets", amount: 520, type: "expense", category: "Entertainment" },
  ],
  phonepe: [
    { description: "PhonePe Amazon order", amount: 1250, type: "expense", category: "Shopping" },
    { description: "PhonePe groceries", amount: 760, type: "expense", category: "Food" },
  ],
  cards: [
    { description: "Credit card pharmacy", amount: 640, type: "expense", category: "Other" },
    { description: "Credit card fuel", amount: 1500, type: "expense", category: "Transport" },
  ],
};

const PAYMENT_APPS = [
  { id: "bank",    name: "HDFC Bank",   emoji: "🏦", sub: "Bank transactions" },
  { id: "gpay",    name: "Google Pay",  emoji: "🟢", sub: "UPI payments" },
  { id: "paytm",   name: "Paytm",       emoji: "🔵", sub: "Wallet & UPI" },
  { id: "phonepe", name: "PhonePe",     emoji: "🟣", sub: "UPI transfers" },
  { id: "cards",   name: "Cards",       emoji: "💳", sub: "Credit card spends" },
];

export default function SettingsScreen({ showToast, user, onLogout }) {
  const { settings, updateSettings, toggleFlag, importSourceSamples } = useStore();
  const [syncing, setSyncing] = useState({});
  const [cloud, setCloud] = useState({ loading: true, ok: false, latency: null });

  async function refreshCloudStatus() {
    setCloud(c => ({ ...c, loading: true }));
    try {
      const latency = await api.ping();
      setCloud({ loading: false, ok: true, latency });
    } catch {
      setCloud({ loading: false, ok: false, latency: null });
    }
  }

  useEffect(() => {
    refreshCloudStatus();
  }, []);

  async function handleConnect(appId) {
    if (settings.sources[appId] === true) return;
    setSyncing(s => ({ ...s, [appId]: true }));
    try {
      const samples = SOURCE_SAMPLES[appId] || [];
      const res = await importSourceSamples(appId, samples);
      showToast(res.skipped ? "Already imported for this source." : `${samples.length} transactions imported`);
    } catch (error) {
      showToast(`Import failed: ${error.message}`, "error");
    } finally {
      setSyncing(s => ({ ...s, [appId]: false }));
    }
  }

  function handleDeleteAccount() {
    if (window.confirm("Are you sure you want to reset all account data?")) {
      try {
        localStorage.clear();
      } catch {}
      if (onLogout) onLogout();
    }
  }

  const displayName  = user?.name  || settings.name  || "Sruthi";
  const displayEmail = user?.email || "sruthi@mint.demo";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <div style={{ background: "var(--bg)", padding: "28px 20px 20px" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>Settings</h2>
      </div>

      <div className="cream-sheet">
        {/* Profile Card */}
        <div className="settings-section">
          <div className="profile-card">
            <div className="profile-avatar">{avatarLetter}</div>
            <div style={{ flex: 1 }}>
              <div className="profile-name">{displayName}</div>
              <div className="profile-sub">{displayEmail} · {settings.role}</div>
            </div>
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

        <div className="settings-section">
          <div className="cloud-card">
            <div className="cloud-icon"><Cloud size={18} /></div>
            <div className="cloud-info">
              <div className="payment-name">Cloud status</div>
              <div className="payment-sub">AWS · us-east-1 · API Gateway + Lambda + DynamoDB + Bedrock</div>
              <div className={`cloud-state ${cloud.ok ? "online" : "offline"}`}>
                {cloud.loading ? "Checking..." : cloud.ok ? `Connected · ${cloud.latency} ms` : "Offline"}
              </div>
            </div>
            <button className="icon-btn" onClick={refreshCloudStatus} disabled={cloud.loading} aria-label="Refresh cloud status">
              <RefreshCw size={16} className={cloud.loading ? "spin-icon" : ""} />
            </button>
          </div>
        </div>

        {/* Budget & Target Preferences */}
        <div className="settings-section">
          <div className="settings-title">Financial Preferences</div>
          
          <div className="form-field" style={{ marginBottom: 12 }}>
            <label className="form-label">Monthly Savings Target (₹)</label>
            <input
              type="number"
              className="form-input"
              value={settings.monthlySavings}
              onChange={e => updateSettings({ monthlySavings: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="form-field" style={{ marginBottom: 12 }}>
            <label className="form-label">Monthly Expense Budget (₹)</label>
            <input
              type="number"
              className="form-input"
              value={settings.budget}
              onChange={e => updateSettings({ budget: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Emergency Savings Goal (₹)</label>
            <input
              type="number"
              className="form-input"
              value={settings.savingsGoal}
              onChange={e => updateSettings({ savingsGoal: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Payment Connections */}
        <div className="settings-section">
          <div className="settings-title">Connect Payment Apps</div>
          {PAYMENT_APPS.map(app => {
            const isConnected = settings.sources[app.id] === true;
            const isSyncing = !!syncing[app.id];
            return (
              <div key={app.id} className="payment-card">
                <div className="payment-logo">{app.emoji}</div>
                <div className="payment-info">
                  <div className="payment-name">{app.name}</div>
                  <div className="payment-sub">{app.sub}</div>
                  {isSyncing && (
                    <div className="syncing-text">
                      <Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> Syncing transactions...
                    </div>
                  )}
                  {isConnected && !isSyncing && (
                    <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginTop: 4 }}>✓ Connected</div>
                  )}
                </div>
                <button
                  className="toggle"
                  style={{ background: isConnected ? "var(--green)" : undefined }}
                  onClick={() => !isSyncing && handleConnect(app.id)}
                  disabled={isSyncing || isConnected}
                  aria-label={`Connect ${app.name}`}
                >
                  <div className="toggle-knob" style={{ transform: isConnected ? "translateX(20px)" : "none" }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Flags */}
        <div className="settings-section">
          <div className="settings-title">Features & Alerts</div>
          {Object.entries({
            track: "Automated Expense Tracking",
            explain: "AI Decision Coach Explanations",
            plan: "What-If Simulator Panel",
            investGuide: "Smart Investment Guide",
            budgetAlerts: "Budget Breach Alerts",
            priceAlerts: "Smart Price Alerts",
          }).map(([key, label]) => {
            const active = !!settings.flags[key];
            return (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0eee6" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{label}</span>
                <button
                  className="toggle"
                  style={{ background: active ? "var(--green)" : undefined }}
                  onClick={() => toggleFlag(key)}
                >
                  <div className="toggle-knob" style={{ transform: active ? "translateX(20px)" : "none" }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Danger zone */}
        <div className="settings-section" style={{ borderTop: "1px solid #eee" }}>
          <button
            onClick={handleDeleteAccount}
            style={{
              width: "100%", padding: "12px", borderRadius: 16,
              background: "#FFF0F0", border: "1px solid #F0705F",
              color: "var(--coral)", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: "pointer", fontFamily: "var(--font)",
            }}
          >
            <Trash2 size={16} /> Delete Account & Reset Data
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, paddingBottom: 16, paddingTop: 8 }}>
          MINT v1.0 · WeMakeDevs × AWS First Commit Hackathon
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
