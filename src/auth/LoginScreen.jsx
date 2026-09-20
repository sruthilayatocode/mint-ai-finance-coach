import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import "./auth.css";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="google-g" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2a10.3 10.3 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-8.09-2.85H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.95 10.71A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.99-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.33A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.08 9.56c-.02-2.37 1.95-3.52 2.04-3.58-1.11-1.62-2.84-1.84-3.46-1.87-1.48-.15-2.87.87-3.62.87-.75 0-1.9-.85-3.13-.83C3.1 4.19 1.4 5.1.56 6.6c-1.7 2.94-.44 7.31 1.22 9.7.81 1.17 1.78 2.49 3.05 2.44 1.22-.05 1.68-.79 3.15-.79 1.47 0 1.89.79 3.17.76 1.31-.02 2.15-1.19 2.96-2.37.93-1.36 1.31-2.68 1.33-2.75-.03-.01-2.55-.98-2.36-3.03z"/>
      <path d="M10.7 2.83a4.31 4.31 0 0 0 1-3.25 4.39 4.39 0 0 0-2.84 1.47 4.12 4.12 0 0 0-1.02 2.99 3.64 3.64 0 0 0 2.86-1.21z"/>
    </svg>
  );
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function LoginScreen({ onNavigate, onLogin, showToast }) {
  const [mode, setMode] = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  function validate() {
    const errs = {};
    if (mode === "signup" && !name.trim()) errs.name = "Name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const resolvedName = mode === "signup"
        ? name.trim()
        : capitalize(email.split("@")[0]);
      const userData = { name: resolvedName, email: email.toLowerCase() };
      try { localStorage.setItem("mint_user", JSON.stringify(userData)); } catch {}
      setSubmitting(false);
      onLogin(userData);
    }, 600);
  }

  async function handleSocial(provider) {
    setSocialLoading(provider);
    await new Promise(r => setTimeout(r, 600));
    const userData = provider === "google"
      ? { name: "Google User", email: "user@google.com" }
      : { name: "Apple User",  email: "user@apple.com"  };
    try { localStorage.setItem("mint_user", JSON.stringify(userData)); } catch {}
    setSocialLoading(null);
    onLogin(userData);
  }

  function handleGuest() {
    const userData = { name: "Guest", email: "guest@mint.app" };
    try { localStorage.setItem("mint_user", JSON.stringify(userData)); } catch {}
    onLogin(userData);
  }

  function switchMode(m) {
    setMode(m);
    setErrors({});
    setName(""); setEmail(""); setPassword("");
  }

  const isSignup   = mode === "signup";
  const titleText  = isSignup ? "Create account" : "Login";
  const submitText = isSignup ? (submitting ? "Creating…" : "Sign up") : (submitting ? "Logging in…" : "Login");
  const bottomNode = isSignup
    ? <p className="auth-bottom">Already have an account?{" "}<button onClick={() => switchMode("login")}>Log in</button></p>
    : <p className="auth-bottom">Need an account?{" "}<button onClick={() => switchMode("signup")}>Sign up</button></p>;

  return (
    <div className="auth-root auth-fade-enter">
      <button
        onClick={() => onNavigate("welcome")}
        style={{ alignSelf:"flex-start", background:"none", border:"none", cursor:"pointer",
          fontFamily:"Poppins,sans-serif", fontSize:13, fontWeight:600, color:"#1F3A0F",
          marginBottom:16, padding:"4px 0", display:"flex", alignItems:"center", gap:6 }}
        aria-label="Back to welcome"
      >
        ← Back
      </button>

      <h2 className="auth-title-sm">{titleText}</h2>

      <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
        {isSignup && (
          <>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><User size={16} /></span>
              <input
                id="auth-name"
                className={`auth-input ${errors.name ? "has-error" : ""}`}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            {errors.name && <div className="auth-field-error">{errors.name}</div>}
          </>
        )}

        <div className="auth-input-wrap">
          <span className="auth-input-icon"><Mail size={16} /></span>
          <input
            id="auth-email"
            className={`auth-input ${errors.email ? "has-error" : ""}`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        {errors.email && <div className="auth-field-error">{errors.email}</div>}

        <div className="auth-input-wrap">
          <span className="auth-input-icon"><Lock size={16} /></span>
          <input
            id="auth-password"
            className={`auth-input ${errors.password ? "has-error" : ""}`}
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
          <button
            type="button"
            className="auth-input-eye"
            onClick={() => setShowPwd(v => !v)}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <div className="auth-field-error">{errors.password}</div>}

        {!isSignup && (
          <button
            type="button"
            className="auth-forgot"
            onClick={() => showToast("Password reset functionality is currently disabled.", "error")}
          >
            Forgot Password?
          </button>
        )}

        <button
          id="auth-submit"
          type="submit"
          className="auth-btn auth-btn-dark"
          disabled={submitting || !!socialLoading}
          style={{ marginTop: isSignup ? 8 : 0, marginBottom: 16 }}
        >
          {submitText}
        </button>
      </form>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">or</span>
        <div className="auth-divider-line" />
      </div>

      <button
        id="login-google"
        className="auth-btn auth-btn-sage"
        onClick={() => handleSocial("google")}
        disabled={submitting || !!socialLoading}
      >
        <GoogleIcon />
        {socialLoading === "google" ? "Signing in…" : "Continue with Google"}
      </button>

      <button
        id="login-apple"
        className="auth-btn auth-btn-lime"
        onClick={() => handleSocial("apple")}
        disabled={submitting || !!socialLoading}
      >
        <AppleIcon />
        {socialLoading === "apple" ? "Signing in…" : "Continue with Apple"}
      </button>

      <button
        id="login-guest"
        className="auth-btn auth-btn-sage"
        onClick={handleGuest}
        disabled={submitting || !!socialLoading}
      >
        <User size={16} />
        Continue as Guest
      </button>

      {bottomNode}
    </div>
  );
}
