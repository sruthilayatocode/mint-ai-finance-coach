import { useState, useEffect, useCallback } from "react";
import { Home, Receipt, Target, Settings, Mic } from "lucide-react";
import { StoreProvider, useStore } from "./store";
import HomeScreen     from "./screens/HomeScreen";
import ExpensesScreen from "./screens/ExpensesScreen";
import PlansScreen    from "./screens/PlansScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AICoachSheet   from "./components/AICoachSheet";
import WelcomeScreen  from "./auth/WelcomeScreen";
import LoginScreen    from "./auth/LoginScreen";
import "./App.css";
import "./auth/auth.css";

function loadUser() {
  try { return JSON.parse(localStorage.getItem("mint_user") || "null"); }
  catch { return null; }
}

function MainContent({ authScreen, setAuthScreen, user, setUser, toast, showToast }) {
  const { fetchTransactions } = useStore();
  const [tab, setTab]         = useState("home");
  const [coachOpen, setCoachOpen] = useState(false);
  const [appKey, setAppKey]   = useState(0);

  useEffect(() => {
    if (!authScreen) {
      fetchTransactions();
    }
  }, [authScreen, fetchTransactions]);

  function handleLogin(userData) {
    setUser(userData);
    setAuthScreen(null);
    setAppKey(k => k + 1);
  }

  function handleLogout() {
    try { localStorage.removeItem("mint_user"); } catch {}
    setUser(null);
    setTab("home");
    setAuthScreen("welcome");
    setAppKey(k => k + 1);
  }

  const TABS = [
    { id: "home",         label: "Home",         Icon: Home },
    { id: "transactions", label: "Transactions", Icon: Receipt },
    { id: "plans",        label: "Plans",        Icon: Target },
    { id: "settings",     label: "Settings",     Icon: Settings },
  ];

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

  return (
    <div className="app app-fade" key={`main-${appKey}`}>
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* Main Screen Views */}
      <div className="page-scroll">
        {tab === "home"         && <HomeScreen     showToast={showToast} user={user} />}
        {tab === "transactions" && <ExpensesScreen showToast={showToast} />}
        {tab === "plans"        && <PlansScreen    showToast={showToast} />}
        {tab === "settings"     && <SettingsScreen showToast={showToast} user={user} onLogout={handleLogout} />}
      </div>

      {/* Floating AI Coach FAB */}
      <button className="fab-mic" onClick={() => setCoachOpen(true)} aria-label="Open AI Coach">
        <Mic size={22} />
      </button>

      {/* Bottom Nav */}
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

export default function App() {
  const [authScreen, setAuthScreen] = useState(() => loadUser() ? null : "welcome");
  const [user, setUser]             = useState(() => loadUser());
  const [toast, setToast]           = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <StoreProvider>
      <MainContent
        authScreen={authScreen}
        setAuthScreen={setAuthScreen}
        user={user}
        setUser={setUser}
        toast={toast}
        showToast={showToast}
      />
    </StoreProvider>
  );
}
