import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
};

type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<ActivityResponse>('/api/activities')
      .then(({ activities: result }) => {
        if (!Array.isArray(result)) throw new Error('The activities response was invalid.');
        if (active) setActivities(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : 'An unexpected error occurred.';
        setError(`Unable to load activities. ${message}`);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      items={activities}
      error={error}
      emptyMessage="No activities have been recorded yet."
      renderItem={(activity) => (
        <>
          <strong>{activity.type}</strong> — {activity.minutes} minutes, {activity.points} points
          {activity.occurredAt && <span className="text-muted"> · {new Date(activity.occurredAt).toLocaleString()}</span>}
        </>
      )}
    />
  );
}
