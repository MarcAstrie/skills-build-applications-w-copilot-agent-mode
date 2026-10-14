import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<WorkoutResponse>('/api/workouts/suggestions/mona@example.com')
      .then(({ suggestions: result }) => {
        if (!Array.isArray(result)) throw new Error('The workout suggestions response was invalid.');
        if (active) setSuggestions(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : 'An unexpected error occurred.';
        setError(`Unable to load workout suggestions. ${message}`);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      items={suggestions}
      error={error}
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
