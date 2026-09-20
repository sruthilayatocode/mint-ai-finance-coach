import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "../store";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Salary", "Other"];

export default function AddTransactionSheet({ onClose, showToast }) {
  const { addTransaction } = useStore();
  const [form, setForm]     = useState({ amount: "", description: "", type: "expense", category: "Food" });
  const [err, setErr]       = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const amt = Number(form.amount);
    if (!amt || amt <= 0) { setErr("Enter a valid positive amount."); return; }
    if (!form.description.trim()) { setErr("Description is required."); return; }
    setSaving(true);
    try {
      await addTransaction({ ...form, amount: amt });
      showToast("Transaction saved!");
      onClose();
    } catch (e) {
      setErr(e.message || "Failed to save transaction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bottom-sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bottom-sheet">
        <div className="sheet-handle" />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div className="sheet-title">Add Transaction</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>
        <div className="sheet-sub">Record income or an expense</div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="form-field">
            <div className="form-label">Type</div>
            <div className="type-toggle">
              <button type="button" className={`type-btn ${form.type === "income"  ? "active-income"  : ""}`} onClick={() => setForm({...form, type:"income"})}>↑ Income</button>
              <button type="button" className={`type-btn ${form.type === "expense" ? "active-expense" : ""}`} onClick={() => setForm({...form, type:"expense"})}>↓ Expense</button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Amount (₹)</label>
            <input className="form-input" type="number" min="1" placeholder="e.g. 500" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} />
          </div>

          <div className="form-field">
            <label className="form-label">Description</label>
            <input className="form-input" type="text" placeholder="e.g. Lunch at office" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
          </div>

          <div className="form-field">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {err && <div style={{ color:"var(--coral)", fontSize:12, fontWeight:600, marginBottom:12 }}>{err}</div>}
          <button type="submit" className="btn-orange" disabled={saving}>{saving ? "Saving…" : "Save Transaction"}</button>
        </form>
      </div>
    </div>
  );
}
