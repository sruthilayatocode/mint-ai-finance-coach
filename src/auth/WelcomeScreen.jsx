import { useState } from "react";
import { User } from "lucide-react";
import "./auth.css";

function MintIllustration() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="90" cy="155" rx="58" ry="7" fill="#EEF0E8"/>
      <ellipse cx="90" cy="130" rx="28" ry="16" fill="#EEF0E8" stroke="#1a1a1a" strokeWidth="2"/>
      <path d="M63 135 Q55 150 72 155 Q82 160 90 155" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M117 135 Q125 150 108 155 Q98 160 90 155" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <rect x="75" y="104" width="30" height="28" rx="8" fill="#9BE564" stroke="#1a1a1a" strokeWidth="2"/>
      <ellipse cx="90" cy="92" rx="18" ry="19" fill="#FAD4A8" stroke="#1a1a1a" strokeWidth="2"/>
      <path d="M72 90 Q73 70 90 69 Q107 68 108 90" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1"/>
      <path d="M72 90 Q68 82 71 76" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M108 90 Q112 82 109 76" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="84" cy="93" r="2" fill="#1a1a1a"/>
      <circle cx="96" cy="93" r="2" fill="#1a1a1a"/>
      <path d="M85 99 Q90 103 95 99" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M75 112 Q60 100 58 88 Q56 80 62 77" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="62" cy="75" r="5" fill="#FAD4A8" stroke="#1a1a1a" strokeWidth="1.8"/>
      <path d="M60 70 L60 64" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M63 69 L64 63" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M66 70 L68 65" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M105 112 Q115 118 118 126" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <rect x="70" y="140" width="52" height="5" rx="2.5" fill="#1a1a1a"/>
      <rect x="75" y="122" width="42" height="20" rx="3" fill="#1F3A0F" stroke="#1a1a1a" strokeWidth="1.5"/>
      <circle cx="96" cy="132" r="6" fill="#9BE564" opacity="0.9"/>
      <text x="96" y="136" textAnchor="middle" fontSize="8" fill="#1F3A0F" fontWeight="bold">₹</text>
      <path d="M130 80 L131 74 L132 80 L138 81 L132 82 L131 88 L130 82 L124 81 Z" fill="#9BE564"/>
      <path d="M42 70 L43 66 L44 70 L48 71 L44 72 L43 76 L42 72 L38 71 Z" fill="#F5A93A" opacity="0.7"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="google-g" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
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

export default function WelcomeScreen({ onNavigate, onLogin }) {
  const [loading, setLoading] = useState(null);

  async function handleSocial(provider) {
    setLoading(provider);
    await new Promise(r => setTimeout(r, 600));
    const userData = provider === "google"
      ? { name: "Google User", email: "user@google.com" }
      : { name: "Apple User",  email: "user@apple.com"  };
    try { localStorage.setItem("mint_user", JSON.stringify(userData)); } catch {}
    setLoading(null);
    onLogin(userData);
  }

  function handleGuest() {
    const userData = { name: "Guest", email: "guest@mint.app" };
    try { localStorage.setItem("mint_user", JSON.stringify(userData)); } catch {}
    onLogin(userData);
  }

  return (
    <div className="auth-root auth-fade-enter">
      <div className="auth-illus"><MintIllustration /></div>

      <h1 className="auth-title">MINT</h1>
      <p className="auth-sub">
        Your personal financial decision coach. Understand your spending, then decide your next move.
      </p>

      <div className="auth-progress">
        <div className="auth-progress-seg filled" />
        <div className="auth-progress-seg filled" />
        <div className="auth-progress-seg" />
      </div>

      <button
        id="welcome-google"
        className="auth-btn auth-btn-sage"
        onClick={() => handleSocial("google")}
        disabled={!!loading}
      >
        <GoogleIcon />
        {loading === "google" ? "Signing in…" : "Continue with Google"}
      </button>

      <button
        id="welcome-apple"
        className="auth-btn auth-btn-lime"
        onClick={() => handleSocial("apple")}
        disabled={!!loading}
      >
        <AppleIcon />
        {loading === "apple" ? "Signing in…" : "Continue with Apple"}
      </button>

      <button
        id="welcome-guest"
        className="auth-btn auth-btn-sage"
        onClick={handleGuest}
        disabled={!!loading}
      >
        <User size={16} />
        Continue as Guest
      </button>

      <p className="auth-bottom">
        Already have an account?{" "}
        <button onClick={() => onNavigate("login")}>Log in</button>
      </p>
    </div>
  );
}
