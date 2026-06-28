// Hourly productivity model for three major archetypes.
// Returns 0.0–1.0 for a given major, day-of-week (0=Mon,6=Sun), and hour (0–23).

function hourProductivity(major, day, hour) {
  if (major === 'finance') {
    // Analyst archetype: strict 9-5 M-F grind, minimal weekends
    if (day >= 5) return 0.04; // weekend: occasional reading
    const dayMult = [0.75, 1.0, 1.0, 0.95, 0.85][day]; // Mon blues → Fri push
    let h = 0;
    if (hour >= 7  && hour < 8)  h = 0.35; // early arrival
    if (hour >= 8  && hour < 9)  h = 0.55; // warming up
    if (hour >= 9  && hour < 12) h = 0.95; // morning focus block
    if (hour >= 12 && hour < 13) h = 0.12; // lunch
    if (hour >= 13 && hour < 15) h = 0.75; // post-lunch
    if (hour >= 15 && hour < 18) h = 0.88; // pre-deadline push
    if (hour >= 18 && hour < 20) h = 0.28; // checking emails / wind-down
    if (hour >= 20 && hour < 22) h = 0.10; // rare evening prep
    return h * dayMult;
  }

  if (major === 'cs') {
    // Night-owl archetype: procrastinates Mon–Wed, surges Thu–Sun, peaks after 9pm
    const dayMult = [0.40, 0.55, 0.72, 0.95, 1.0, 0.88, 1.0][day];
    let h = 0;
    if (hour >= 0  && hour < 4)  h = 0.18; // still grinding from yesterday
    if (hour >= 4  && hour < 10) h = 0.00; // asleep
    if (hour >= 10 && hour < 12) h = 0.28; // slow start
    if (hour >= 12 && hour < 14) h = 0.50; // awake-ish
    if (hour >= 14 && hour < 17) h = 0.70; // afternoon coding
    if (hour >= 17 && hour < 19) h = 0.55; // dinner / context switching
    if (hour >= 19 && hour < 21) h = 0.80; // picking up
    if (hour >= 21 && hour < 23) h = 0.97; // peak: late-night flow state
    if (hour >= 23)              h = 0.85; // still going
    return h * dayMult;
  }

  if (major === 'engineering') {
    // Lab-rat archetype: structured schedule, Tue/Thu lab spikes, moderate weekends
    if (day >= 5) {
      // Weekend: catching up on lab reports
      if (hour >= 10 && hour < 13) return 0.38;
      if (hour >= 14 && hour < 18) return 0.40;
      if (hour >= 20 && hour < 22) return 0.28;
      return 0.04;
    }
    const isTuTh = day === 1 || day === 3;
    if (isTuTh) {
      // Lab days — everything revolves around afternoon lab
      if (hour >= 7  && hour < 9)  return 0.68; // pre-lab prep
      if (hour >= 9  && hour < 12) return 0.52; // morning class
      if (hour >= 12 && hour < 13) return 0.12; // lunch
      if (hour >= 13 && hour < 17) return 0.97; // IN THE LAB
      if (hour >= 17 && hour < 19) return 0.82; // post-lab analysis
      if (hour >= 19 && hour < 22) return 0.72; // lab report writing
      return 0.04;
    }
    // Mon/Wed/Fri — lecture + homework days
    if (hour >= 7  && hour < 9)  return 0.50;
    if (hour >= 9  && hour < 12) return 0.58;
    if (hour >= 12 && hour < 13) return 0.12;
    if (hour >= 13 && hour < 16) return 0.65;
    if (hour >= 16 && hour < 18) return 0.45;
    if (hour >= 19 && hour < 22) return 0.78; // evening study session
    return 0.04;
  }

  return 0;
}

// Integrate productivity from Mon 00:00 up to the current moment.
// Returns 0–1 (fraction of total weekly productive output completed).
export function computeProgress(major) {
  const now = new Date();
  let day = now.getDay();
  const currentDay = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
  const currentHour = now.getHours();
  const minFrac = now.getMinutes() / 60;

  let cumulative = 0;
  let total = 0;

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const prod = hourProductivity(major, d, h);
      total += prod;
      const slotIdx = d * 24 + h;
      const curIdx  = currentDay * 24 + currentHour;
      if (slotIdx < curIdx) cumulative += prod;
      else if (slotIdx === curIdx) cumulative += prod * minFrac;
    }
  }

  return total > 0 ? cumulative / total : 0;
}

export const MAJORS = ['finance', 'cs', 'engineering'];
