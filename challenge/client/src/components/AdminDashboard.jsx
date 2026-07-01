import ProgressBars      from './ProgressBars.jsx';
import CompetitorSection from './CompetitorSection.jsx';
import GoalsList         from './GoalsList.jsx';
import PunishmentsSection from './PunishmentsSection.jsx';

export default function AdminDashboard({
  algorithms,
  connorGoals, jackGoals, allGoals, setAllGoals,
  competitorGoals, setCompetitorGoals,
  punishments, setPunishments,
  settings, setSettings,
  token, role,
}) {
  const connorAvg = connorGoals.length
    ? Math.round(connorGoals.reduce((s, g) => s + g.selfProgress, 0) / connorGoals.length) : 0;

  return (
    <div className="admin-dash-section">
      <div className="admin-dash-title">Admin Panel</div>

      {algorithms && <ProgressBars algorithms={algorithms} userProgress={connorAvg} />}

      <CompetitorSection
        competitorGoals={competitorGoals}
        setCompetitorGoals={setCompetitorGoals}
        algorithms={algorithms}
        token={token}
        settings={settings}
        setSettings={setSettings}
      />

      <div className="goals-grid">
        <GoalsList
          title="Connor's Goals"
          owner="connor"
          goals={connorGoals}
          setGoals={setAllGoals}
          allGoals={allGoals}
          token={token}
          role={role}
          canEdit={true}
          adminMode={true}
        />
        <GoalsList
          title="Jack's Goals"
          owner="jack"
          goals={jackGoals}
          setGoals={setAllGoals}
          allGoals={allGoals}
          token={token}
          role={role}
          canEdit={true}
          adminMode={true}
        />
      </div>

      <PunishmentsSection
        punishments={punishments}
        setPunishments={setPunishments}
        token={token}
        role={role}
      />
    </div>
  );
}
