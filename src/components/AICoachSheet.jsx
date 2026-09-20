import { useState, useEffect, useRef } from "react";
import { X, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { api } from "../api";

const QUICK_QUESTIONS = [
  "Why am I overspending?",
  "Where am I spending the most?",
  "How can I save more this month?",
  "What should I reduce?",
];

// ── Speech API detection ──────────────────────────────────────────────────────
const SpeechRecognition = typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);
const hasSpeech = !!SpeechRecognition;

export default function AICoachSheet({ onClose, showToast }) {
  const [question, setQuestion]   = useState("");
  const [answer, setAnswer]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [recording, setRecording] = useState(false);
  const [speakOn, setSpeakOn]     = useState(true);
  const recognizerRef = useRef(null);

  async function askQuestion(q) {
    const query = (q || question).trim();
    if (!query) return;
    setAnswer("");
    setLoading(true);
    try {
      const data = await api.coach({ question: query });
      setAnswer(data.answer);
      if (speakOn && data.answer) speak(data.answer);
    } catch (e) {
      showToast("Coach error: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-IN";
    utt.rate = 1.0;
    window.speechSynthesis.speak(utt);
  }

  function startVoice() {
    if (!hasSpeech) return;
    const r = new SpeechRecognition();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onstart  = () => setRecording(true);
    r.onend    = () => setRecording(false);
    r.onerror  = () => setRecording(false);
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuestion(transcript);
      askQuestion(transcript);
    };
    r.start();
    recognizerRef.current = r;
  }

  function stopVoice() {
    recognizerRef.current?.stop();
    setRecording(false);
  }

  // Stop speech on close
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <div className="bottom-sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bottom-sheet">
        <div className="sheet-handle" />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div>
            <div className="sheet-title">🤖 AI Coach</div>
            <div className="sheet-sub" style={{ marginBottom:0 }}>Powered by Amazon Bedrock · your real data</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Speaker toggle */}
            <button className={`speaker-toggle ${speakOn ? "speaker-on" : ""}`} onClick={() => setSpeakOn(s => !s)}>
              {speakOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick chips */}
        <div className="quick-chips" style={{ marginTop: 16 }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q} className={`chip ${question === q ? "active-chip" : ""}`}
              onClick={() => { setQuestion(q); askQuestion(q); }}>
              {q}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <div className="chat-input-row">
          <input
            className="chat-input"
            type="text"
            placeholder="Ask anything about your finances…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && askQuestion()}
          />
          {hasSpeech ? (
            <button
              className={`chat-mic-btn ${recording ? "recording" : ""}`}
              onClick={recording ? stopVoice : startVoice}
              aria-label={recording ? "Stop recording" : "Start voice input"}
            >
              {recording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          ) : null}
          <button className="chat-send-btn" onClick={() => askQuestion()} disabled={loading || !question.trim()}>
            <Send size={16} />
          </button>
        </div>

        {!hasSpeech && (
          <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:500, marginBottom:12 }}>
            Voice input not supported in this browser.
          </div>
        )}

        {/* Answer area */}
        {loading && <div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>}

        {answer && !loading && (
          <div className="answer-bubble">
            <div className="answer-badge">🌿 MINT says</div>
            <div className="answer-text">{answer}</div>
            <div className="answer-source">Answered by Amazon Bedrock</div>
          </div>
        )}

        {!answer && !loading && (
          <div className="empty-state" style={{ padding:"20px 0" }}>
            <div className="empty-icon">💬</div>
            <div className="empty-text">Pick a quick question or type your own above.</div>
          </div>
        )}
      </div>
    </div>
  );
}
