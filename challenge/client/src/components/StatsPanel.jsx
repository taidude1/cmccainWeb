export default function StatsPanel({ stats }) {
  const items = [
    { label: 'Goals Completed',    value: stats?.goalsCompleted    ?? '—', color: '#089981' },
    { label: 'Projects Completed', value: stats?.projectsCompleted ?? '—', color: '#CC2200' },
    { label: 'Punishments Given',  value: stats?.punishmentsGiven  ?? '—', color: '#E87030' },
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
