import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
      dataKey="suggestions"
      emptyMessage="No workout suggestions are available."
      renderItem={(workout) => (
        <>
          <strong>{workout.title}</strong>
          {workout.focus && <span> · Focus: {workout.focus}</span>}
          {workout.minutes !== undefined && <span> · {workout.minutes} minutes</span>}
          {workout.difficulty && <span> · {workout.difficulty}</span>}
          {workout.reason && <div className="text-muted">{workout.reason}</div>}
        </>
      )}
    />
  );
}
