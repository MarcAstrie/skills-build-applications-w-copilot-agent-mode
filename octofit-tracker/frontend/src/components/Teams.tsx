import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = {
  name: string;
  mascot?: string;
  members?: Array<string | { name?: string }>;
};

type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<TeamsResponse>('/api/teams')
      .then(({ teams: result }) => {
        if (!Array.isArray(result)) throw new Error('The teams response was invalid.');
        if (active) setTeams(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : 'An unexpected error occurred.';
        setError(`Unable to load teams. ${message}`);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      items={teams}
      error={error}
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
