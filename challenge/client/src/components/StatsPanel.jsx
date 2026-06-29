export default function StatsPanel({ stats }) {
  const items = [
    { label: 'Goals Completed',   value: stats?.goalsCompleted    ?? '—', color: '#089981' },
    { label: 'Projects Completed', value: stats?.projectsCompleted ?? '—', color: '#2962ff' },
    { label: 'Punishments Given',  value: stats?.punishmentsGiven  ?? '—', color: '#f23645' },
  ];

  return (
    <div className="stats-panel">
      {items.map(({ label, value, color }) => (
        <div className="stat-item" key={label}>
          <div className="stat-value" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}
