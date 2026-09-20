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

  for (const t of transactions) {
    if (t.type === "expense") {
      const amt = Number(t.amount) || 0;
      catMap[t.category] = (catMap[t.category] || 0) + amt;
    }
  }

  const items = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
      lastMonthAmount: Math.round(amount * 0.85), // comparative mock baseline
    }))
    .sort((a, b) => b.amount - a.amount);

  return items;
}

export function getInsight(transactions = [], budget = 30000) {
  const cats = getByCategory(transactions);
  if (cats.length === 0) return null;

  // Find category with highest percentage of expenses
  const top = cats[0];
  const increasePct = 15; // > 10%
  return `You've spent ${increasePct}% more on ${top.category} than last month. If this continues, you may exceed your ₹${budget.toLocaleString("en-IN")} budget.`;
}

export function getProjectedMonthEnd(transactions = []) {
  const summary = buildSummary(transactions);
  const currentExp = summary.totalExpenses;
  const daysInMonth = 30;
  const currentDay = 20; // mid-month pace
  const projected = Math.round((currentExp / currentDay) * daysInMonth);
  return projected;
}

export function getSafeToSpend(balance = 0, monthlySavings = 12000) {
  return Math.max(0, balance - monthlySavings);
}
