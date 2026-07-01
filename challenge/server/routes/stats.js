import { Router } from 'express';
import { readFileSync } from 'fs';

const router = Router();

function readJSON(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return fallback; }
}

function computeStreak(completedGoals) {
  if (!completedGoals.length) return 0;
  const dates = new Set(completedGoals.filter(g => g.completedAt).map(g => g.completedAt.slice(0, 10)));
  if (!dates.size) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Try streak ending today first, then ending yesterday
  for (let startOffset = 0; startOffset <= 1; startOffset++) {
    let streak = 0;
    const cur = new Date(today);
    cur.setDate(cur.getDate() - startOffset);
    while (dates.has(cur.toISOString().slice(0, 10))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    if (streak > 0) return streak;
  }
  return 0;
}

function weeklyCount(completedGoals) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return completedGoals.filter(g => g.completedAt && new Date(g.completedAt) >= cutoff).length;
}

router.get('/', (req, res) => {
  const rawGoals    = readJSON('./data/goals.json', []);
  const goals       = rawGoals.map(g => ({ owner: 'connor', type: 'daily', points: 1, ...g }));
  const projects    = readJSON('./data/projects.json', []);
  const punishments = readJSON('./data/punishments.json', []);

  const completedGoals = goals.filter(g => g.selfProgress >= 100);
  const connorGoals    = goals.filter(g => g.owner === 'connor');
  const jackGoals      = goals.filter(g => g.owner === 'jack');
  const connorDone     = completedGoals.filter(g => g.owner === 'connor');
  const jackDone       = completedGoals.filter(g => g.owner === 'jack');

  // Per-user commit calendars
  const commitDataConnor = {};
  const commitDataJack   = {};
  for (const g of completedGoals) {
    if (!g.completedAt) continue;
    const d = g.completedAt.slice(0, 10);
    if (g.owner === 'jack') commitDataJack[d]  = (commitDataJack[d]  || 0) + 1;
    else                    commitDataConnor[d] = (commitDataConnor[d] || 0) + 1;
  }

  // Cumulative chart (all completions combined)
  const daily = {};
  function inc(dateStr, pts) {
    if (!dateStr) return;
    const d = dateStr.slice(0, 10);
    daily[d] = (daily[d] || 0) + pts;
  }
  for (const g of completedGoals) inc(g.completedAt || g.createdAt, g.points || 1);
  for (const p of projects)       inc(p.completedAt || p.createdAt, 10);

  const dates    = Object.keys(daily).sort();
  const today    = new Date();
  const startDate = dates.length > 0 ? new Date(dates[0]) : new Date(today.getTime() - 7 * 86400000);
  const chartEnd  = new Date(today.getTime() + 30 * 86400000);
  const totalDays = Math.max(1, Math.round((chartEnd - startDate) / 86400000));

  let cum = 0;
  const actualMap = {};
  for (const d of dates) { cum += daily[d]; actualMap[d] = cum; }

  const totalPts  = connorDone.reduce((s, g) => s + (g.points || 1), 0)
                  + jackDone.reduce((s, g) => s + (g.points || 1), 0)
                  + projects.length * 10;
  const dailyRate = totalPts > 0 ? totalPts / totalDays : 2;

  const chartData = [];
  let cur = new Date(startDate), dayIndex = 0, lastActual = 0;
  while (cur <= chartEnd) {
    const ds = cur.toISOString().slice(0, 10);
    if (actualMap[ds] !== undefined) lastActual = actualMap[ds];
    chartData.push({
      date:      ds,
      label:     cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual:    cur <= today ? lastActual : null,
      projected: Math.round(dayIndex * dailyRate),
    });
    cur.setDate(cur.getDate() + 1);
    dayIndex++;
  }

  const connorPoints = connorDone.reduce((s, g) => s + (g.points || 1), 0);
  const jackPoints   = jackDone.reduce((s, g)   => s + (g.points || 1), 0);

  res.json({
    // Legacy fields (public view)
    goalsCompleted:    completedGoals.length,
    projectsCompleted: projects.length,
    punishmentsGiven:  punishments.filter(p => p.executePending || p.status === 'completed').length,
    chartData,
    commitDataConnor,
    commitDataJack,
    // Per-user stats (user dashboards)
    connorStats: {
      goalsCompleted:  connorDone.length,
      goalsTotal:      connorGoals.length,
      points:          connorPoints,
      streak:          computeStreak(connorDone),
      weeklyCompleted: weeklyCount(connorDone),
    },
    jackStats: {
      goalsCompleted:  jackDone.length,
      goalsTotal:      jackGoals.length,
      points:          jackPoints,
      streak:          computeStreak(jackDone),
      weeklyCompleted: weeklyCount(jackDone),
    },
  });
});

export default router;
