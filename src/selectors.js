export function buildSummary(transactions = []) {
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === "income") totalIncome += amt;
    else totalExpenses += amt;
  }
  const balance = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, balance };
}

export function getByCategory(transactions = []) {
  const summary = buildSummary(transactions);
  const totalExp = summary.totalExpenses;
  const catMap = {};
  const lastMonthCatMap = {};

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  for (const t of transactions) {
    if (t.type === "expense") {
      const amt = Number(t.amount) || 0;
      catMap[t.category] = (catMap[t.category] || 0) + amt;
      if (t.date && t.date.startsWith(prevMonthStr)) {
        lastMonthCatMap[t.category] = (lastMonthCatMap[t.category] || 0) + amt;
      }
    }
  }

  const items = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
      lastMonthAmount: lastMonthCatMap[category] || 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return items;
}

export function getInsight(transactions = [], budget = 30000) {
  const cats = getByCategory(transactions);
  if (cats.length === 0) return null;

  const top = cats[0];
  if (top.lastMonthAmount > 0 && top.amount > top.lastMonthAmount) {
    const increasePct = Math.round(((top.amount - top.lastMonthAmount) / top.lastMonthAmount) * 100);
    return `You've spent ${increasePct}% more on ${top.category} than last month. If this continues, you may exceed your ₹${budget.toLocaleString("en-IN")} budget.`;
  }

  return `Your highest spending category is ${top.category} at ₹${top.amount.toLocaleString("en-IN")}. Total budget: ₹${budget.toLocaleString("en-IN")}.`;
}

export function getProjectedMonthEnd(transactions = []) {
  const summary = buildSummary(transactions);
  const currentExp = summary.totalExpenses;
  const now = new Date();
  const currentDay = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projected = Math.round((currentExp / currentDay) * daysInMonth);
  return projected;
}

export function getSafeToSpend(balance = 0, monthlySavings = 12000) {
  return Math.max(0, balance - monthlySavings);
}
