import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import { api } from "./api";
import {
  buildSummary,
  getByCategory,
  getInsight,
  getProjectedMonthEnd,
  getSafeToSpend,
} from "./selectors";

const STORAGE_KEY = "mint_settings";

const DEFAULT_SETTINGS = {
  name: "Sruthi",
  role: "Student / Freelancer",
  monthlySavings: 12000,
  budget: 30000,
  savingsGoal: 50000,
  flags: {
    track: true,
    explain: true,
    plan: true,
    investGuide: true,
    budgetAlerts: true,
    priceAlerts: true,
  },
  bank: {
    connected: true,
    name: "HDFC Bank",
    last4: "4092",
    lastSynced: "Just now",
  },
  sources: {
    gpay: false,
    paytm: false,
    phonepe: false,
    cards: { connected: true, imported: 12 },
  },
};

function loadStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      flags: { ...DEFAULT_SETTINGS.flags, ...(parsed.flags || {}) },
      bank: { ...DEFAULT_SETTINGS.bank, ...(parsed.bank || {}) },
      sources: { ...DEFAULT_SETTINGS.sources, ...(parsed.sources || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveStoredSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

const initialState = {
  transactions: [],
  loading: true,
  settings: loadStoredSettings(),
};

function storeReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload, loading: false };
    case "UPDATE_SETTINGS": {
      const nextSettings = { ...state.settings, ...action.payload };
      saveStoredSettings(nextSettings);
      return { ...state, settings: nextSettings };
    }
    case "TOGGLE_FLAG": {
      const nextFlags = {
        ...state.settings.flags,
        [action.payload]: !state.settings.flags[action.payload],
      };
      const nextSettings = { ...state.settings, flags: nextFlags };
      saveStoredSettings(nextSettings);
      return { ...state, settings: nextSettings };
    }
    case "TOGGLE_SOURCE": {
      const nextSources = {
        ...state.settings.sources,
        [action.payload]: !state.settings.sources[action.payload],
      };
      const nextSettings = { ...state.settings, sources: nextSources };
      saveStoredSettings(nextSettings);
      return { ...state, settings: nextSettings };
    }
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  const fetchTransactions = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const res = await api.getTransactions();
      dispatch({ type: "SET_TRANSACTIONS", payload: res.transactions || [] });
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const addTransaction = useCallback(async (txnData) => {
    const res = await api.addTransaction(txnData);
    await fetchTransactions();
    return res;
  }, [fetchTransactions]);

  const seedData = useCallback(async () => {
    const res = await api.seed();
    await fetchTransactions();
    return res;
  }, [fetchTransactions]);

  const importSourceSamples = useCallback(async (sourceId, samples) => {
    await Promise.all(samples.map((s) => api.addTransaction(s)));
    dispatch({ type: "TOGGLE_SOURCE", payload: sourceId });
    await fetchTransactions();
  }, [fetchTransactions]);

  const updateSettings = useCallback((partial) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: partial });
  }, []);

  const toggleFlag = useCallback((flagKey) => {
    dispatch({ type: "TOGGLE_FLAG", payload: flagKey });
  }, []);

  // Derived selectors
  const summary = useMemo(() => buildSummary(state.transactions), [state.transactions]);
  const categoryStats = useMemo(() => getByCategory(state.transactions), [state.transactions]);
  const insight = useMemo(() => getInsight(state.transactions, state.settings.budget), [state.transactions, state.settings.budget]);
  const projectedMonthEnd = useMemo(() => getProjectedMonthEnd(state.transactions), [state.transactions]);
  const safeToSpend = useMemo(() => getSafeToSpend(summary.balance, state.settings.monthlySavings), [summary.balance, state.settings.monthlySavings]);
  const goalPct = useMemo(() => Math.min(100, Math.max(0, Math.round((summary.balance / state.settings.savingsGoal) * 100))), [summary.balance, state.settings.savingsGoal]);

  const value = {
    transactions: state.transactions,
    loading: state.loading,
    settings: state.settings,
    summary,
    categoryStats,
    insight,
    projectedMonthEnd,
    safeToSpend,
    goalPct,
    fetchTransactions,
    addTransaction,
    seedData,
    importSourceSamples,
    updateSettings,
    toggleFlag,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
