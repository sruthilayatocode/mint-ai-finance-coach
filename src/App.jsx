import { useState, useEffect, useCallback } from "react";
import { Home, CreditCard, Lightbulb, Settings, Mic } from "lucide-react";
import { api } from "./api";
import HomeScreen     from "./screens/HomeScreen";
import ExpensesScreen from "./screens/ExpensesScreen";
import PlansScreen    from "./screens/PlansScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AICoachSheet   from "./components/AICoachSheet";
import WelcomeScreen  from "./auth/WelcomeScreen";
import LoginScreen    from "./auth/LoginScreen";
import "./App.css";
import "./auth/auth.css";

// ── Auth helpers ─────────────────────────────────────────────────────────────
function loadUser() {
  try { return JSON.parse(localStorage.getItem("mint_user") || "null"); }
  catch { return null; }
}

export default function App() {
  // authScreen: "welcome" | "login" | null (null = authenticated)
  const [authScreen, setAuthScreen] = useState(() => loadUser() ? null : "welcome");
  const [user, setUser]             = useState(() => loadUser());

  const [tab,          setTab]          = useState("home");
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);
  const [coachOpen,    setCoachOpen]    = useState(false);
  // Used to trigger a re-mount/fade when switching between auth and main app
  const [appKey, setAppKey]            = useState(0);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions();
      setTransactions(data.transactions || []);
    } catch {
      showToast("Could not load transactions. Tap retry.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Only fetch once we're authenticated
  useEffect(() => {
    if (!authScreen) fetchTransactions();
  }, [authScreen, fetchTransactions]);

  // ── Called by auth screens after successful sign-in ──────────────────────
  function handleLogin(userData) {
    setUser(userData);
    setAuthScreen(null);
    setAppKey(k => k + 1); // triggers fade-in animation for main app
  }

  // ── Called by SettingsScreen → Log out ──────────────────────────────────
  function handleLogout() {
    try { localStorage.removeItem("mint_user"); } catch {}
    setUser(null);
    setTab("home");
    setTransactions([]);
    setAuthScreen("welcome");
    setAppKey(k => k + 1);
  }

  const TABS = [
    { id: "home",     label: "Home",     Icon: Home },
    { id: "expenses", label: "Expenses", Icon: CreditCard },
    { id: "plans",    label: "Plans",    Icon: Lightbulb },
    { id: "settings", label: "Settings", Icon: Settings },
  ];

  // ── Auth screens ─────────────────────────────────────────────────────────
  if (authScreen === "welcome") {
    return (
      <div className="app" key={`auth-${appKey}`}>
        <WelcomeScreen
          onNavigate={setAuthScreen}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  if (authScreen === "login") {
    return (
      <div className="app" key={`auth-${appKey}`}>
        <LoginScreen
          onNavigate={setAuthScreen}
          onLogin={handleLogin}
          showToast={showToast}
        />
        {toast && (
          <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
          </div>
        )}
      </div>
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div className="app app-fade" key={`main-${appKey}`}>
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* Screens */}
      <div className="page-scroll">
        {tab === "home"     && <HomeScreen     transactions={transactions} loading={loading} onRefresh={fetchTransactions} showToast={showToast} user={user} />}
        {tab === "expenses" && <ExpensesScreen  transactions={transactions} loading={loading} />}
        {tab === "plans"    && <PlansScreen     transactions={transactions} showToast={showToast} />}
        {tab === "settings" && <SettingsScreen  onRefresh={fetchTransactions} showToast={showToast} user={user} onLogout={handleLogout} />}
      </div>

      {/* Floating mic FAB */}
      <button className="fab-mic" onClick={() => setCoachOpen(true)} aria-label="Open AI Coach">
        <Mic size={22} />
      </button>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            <Icon size={18} strokeWidth={tab === id ? 2.5 : 2} />
            <span className="nav-item-label">{label}</span>
            {tab === id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      {/* AI Coach bottom sheet */}
      {coachOpen && <AICoachSheet onClose={() => setCoachOpen(false)} showToast={showToast} />}
    </div>
  );
}
