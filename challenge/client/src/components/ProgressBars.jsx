const BARS = [
  { key: 'finance',     label: 'Finance Major',     color: '#3fb950' },
  { key: 'cs',          label: 'CS Major',           color: '#58a6ff' },
  { key: 'engineering', label: 'Engineering Major',  color: '#e3b341' },
];

function Bar({ label, value, color, labelClass }) {
  return (
    <div className="progress-row">
      <div className={`progress-label ${labelClass || ''}`}>{label}</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <div className="progress-value">{value}%</div>
    </div>
  );
}

export default function ProgressBars({ algorithms, userProgress }) {
  const daysLeft = (() => {
    const t = algorithms.weekFraction;
    const secondsLeft = (1 - t) * 7 * 86400;
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  })();

  return (
    <section className="progress-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0 }}>Week Progress</h2>
        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>{daysLeft} in the week</span>
      </div>

      {BARS.map(({ key, label, color }) => (
        <Bar key={key} label={label} value={algorithms[key]} color={color} />
      ))}

      <div className="divider" />

      <Bar label="You" value={userProgress} color="#e8609a" labelClass="you-label" />
    </section>
  );
}
