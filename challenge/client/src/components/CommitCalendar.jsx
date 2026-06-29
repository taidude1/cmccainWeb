import { useMemo } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKS = 26;

function cellColor(count) {
  if (!count) return '#ebedf0';
  if (count === 1) return '#9be9a8';
  if (count <= 3) return '#40c463';
  if (count <= 6) return '#30a14e';
  return '#216e39';
}

export default function CommitCalendar({ commitData = {} }) {
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    // Align to the most recent Sunday
    const dayOfWeek = today.getDay();
    const endSunday = new Date(today);
    endSunday.setDate(today.getDate() - dayOfWeek);

    const startSunday = new Date(endSunday);
    startSunday.setDate(endSunday.getDate() - (WEEKS - 1) * 7);

    // Build grid[col=week][row=day]
    const grid = [];
    const monthLabels = [];

    let lastMonth = -1;
    let cur = new Date(startSunday);

    for (let w = 0; w < WEEKS; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const ds = cur.toISOString().slice(0, 10);
        const month = cur.getMonth();
        if (month !== lastMonth && d === 0) {
          monthLabels.push({ col: w, label: cur.toLocaleDateString('en-US', { month: 'short' }) });
          lastMonth = month;
        }
        col.push({ date: ds, count: commitData[ds] || 0, future: cur > today });
        cur.setDate(cur.getDate() + 1);
      }
      grid.push(col);
    }
    return { grid, monthLabels };
  }, [commitData]);

  return (
    <div className="commit-calendar">
      <div className="commit-months">
        {Array.from({ length: WEEKS }, (_, i) => {
          const label = monthLabels.find(m => m.col === i);
          return (
            <div key={i} className="commit-month-cell">
              {label ? label.label : ''}
            </div>
          );
        })}
      </div>
      <div className="commit-grid-row">
        <div className="commit-day-labels">
          {DAYS.map((d, i) => (
            <div key={d} className="commit-day-label">{i % 2 !== 0 ? d : ''}</div>
          ))}
        </div>
        <div className="commit-grid">
          {grid.map((col, w) => (
            <div key={w} className="commit-col">
              {col.map(({ date, count, future }) => (
                <div
                  key={date}
                  className="commit-cell"
                  style={{ background: future ? 'transparent' : cellColor(count) }}
                  title={`${date}: ${count} goal${count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="commit-legend">
        <span className="commit-legend-label">Less</span>
        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map(c => (
          <div key={c} className="commit-cell" style={{ background: c }} />
        ))}
        <span className="commit-legend-label">More</span>
      </div>
    </div>
  );
}
