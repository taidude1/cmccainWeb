import { Router } from 'express';
import { readFileSync } from 'fs';

const router = Router();

function readJSON(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return fallback; }
}

router.get('/', (req, res) => {
  const rawGoals    = readJSON('./data/goals.json', []);
  const goals       = rawGoals.map(g => ({ owner: 'connor', ...g }));
  const projects    = readJSON('./data/projects.json', []);
  const punishments = readJSON('./data/punishments.json', []);

  const completedGoals = goals.filter(g => g.selfProgress >= 100);

  // Daily event map { date: { goals, projects } }
  const daily = {};
  function inc(dateStr, type) {
    if (!dateStr) return;
    const d = dateStr.slice(0, 10);
    if (!daily[d]) daily[d] = { goals: 0, projects: 0 };
    daily[d][type]++;
  }

  for (const g of completedGoals) inc(g.completedAt || g.createdAt, 'goals');
  for (const p of projects)       inc(p.completedAt || p.createdAt, 'projects');

  // Commit calendar (goals per day, Connor only)
  const commitData = {};
  for (const g of completedGoals) {
    if (!g.completedAt) continue;
    const d = g.completedAt.slice(0, 10);
    commitData[d] = (commitData[d] || 0) + 1;
  }

  // Sorted date range for chart
  const dates = Object.keys(daily).sort();
  const today = new Date();
  const startDate = dates.length > 0 ? new Date(dates[0]) : new Date(today.getTime() - 7 * 86400000);

  // Build cumulative actual
  let cum = 0;
  const actualMap = {};
  for (const d of dates) {
    cum += daily[d].goals * 1 + daily[d].projects * 10;
    actualMap[d] = cum;
  }

  // Build chart data array from startDate to today + 30 days
  const chartEnd = new Date(today.getTime() + 30 * 86400000);
  const totalDays = Math.max(1, Math.round((chartEnd - startDate) / 86400000));
  const totalGoalPoints = goals.length * 1 + projects.length * 10;
  const dailyRate = totalGoalPoints > 0 ? totalGoalPoints / totalDays : 2;

  const chartData = [];
  let cur = new Date(startDate);
  let dayIndex = 0;
  let lastActual = 0;

  while (cur <= chartEnd) {
    const ds = cur.toISOString().slice(0, 10);
    if (actualMap[ds] !== undefined) lastActual = actualMap[ds];

    chartData.push({
      date: ds,
      label: formatLabel(cur),
      actual: cur <= today ? lastActual : null,
      projected: Math.round(dayIndex * dailyRate),
    });
    cur.setDate(cur.getDate() + 1);
    dayIndex++;
  }

  res.json({
    goalsCompleted: completedGoals.length,
    projectsCompleted: projects.length,
    punishmentsGiven: punishments.filter(p => p.executePending || p.status === 'completed').length,
    chartData,
    commitData,
  });
});

function formatLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default router;
