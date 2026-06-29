import SpotlightCard from './SpotlightCard.jsx';

const MAJORS = [
  {
    key: 'finance',
    label: 'Finance Major',
    emoji: '📈',
    color: '#2A5C45',
    animClass: 'avatar-bounce',
    bg: 'rgba(42,92,69,0.10)',
  },
  {
    key: 'cs',
    label: 'CS Major',
    emoji: '💻',
    color: '#4DA8A4',
    animClass: 'avatar-pulse',
    bg: 'rgba(77,168,164,0.10)',
  },
  {
    key: 'engineering',
    label: 'Engineering Major',
    emoji: '⚙️',
    color: '#8A9BAA',
    animClass: 'avatar-spin',
    bg: 'rgba(138,155,170,0.12)',
  },
];

export default function ProgressBars({ algorithms, userProgress }) {
  return (
    <SpotlightCard className="section-card">
      <div className="section-heading">Competition — This Week</div>

      {MAJORS.map(({ key, label, emoji, color, animClass, bg }) => (
        <div className="progress-row" key={key}>
          <div className="progress-label">
            <div className="major-avatar" style={{ background: bg }}>
              <span className={animClass}>{emoji}</span>
            </div>
            {label}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${algorithms?.[key] ?? 0}%`, background: color }}
            />
          </div>
          <div className="progress-value">{algorithms?.[key] ?? 0}%</div>
        </div>
      ))}

      <div className="progress-divider" />

      <div className="progress-row you-row">
        <div className="progress-label">
          <div className="major-avatar" style={{ background: 'rgba(201,107,58,0.12)' }}>
            <span className="avatar-pulse">🎯</span>
          </div>
          You (avg)
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${userProgress}%`, background: '#C96B3A' }}
          />
        </div>
        <div className="progress-value">{userProgress}%</div>
      </div>
    </SpotlightCard>
  );
}
