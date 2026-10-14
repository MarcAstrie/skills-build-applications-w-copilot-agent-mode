import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
};

export default function Activities() {
  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      dataKey="activities"
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
