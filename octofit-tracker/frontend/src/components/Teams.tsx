import { CapabilityCard } from './CapabilityCard.js';

type Team = {
  name: string;
  mascot?: string;
  members?: Array<string | { name?: string }>;
};

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      dataKey="teams"
      emptyMessage="No teams have been created yet."
      renderItem={(team) => (
        <>
          <strong>{team.name}</strong>
          {team.mascot && <span> · Mascot: {team.mascot}</span>}
          <div className="text-muted">Members: {team.members?.length ? team.members.map((member) => typeof member === 'string' ? member : member.name ?? 'Team member').join(', ') : 'None'}</div>
        </>
      )}
    />
  );
}
