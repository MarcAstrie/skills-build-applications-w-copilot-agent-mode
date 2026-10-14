import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then(({ leaderboard: result }) => {
        if (!Array.isArray(result)) throw new Error('The leaderboard response was invalid.');
        if (active) setLeaderboard(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : 'An unexpected error occurred.';
        setError(`Unable to load leaderboard. ${message}`);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      items={leaderboard}
      error={error}
      emptyMessage="No leaderboard rankings are available yet."
      renderItem={(entry) => (
        <>
          <strong>#{entry.rank} {entry.teamName}</strong> — {entry.totalPoints} points
        </>
      )}
    />
  );
}
