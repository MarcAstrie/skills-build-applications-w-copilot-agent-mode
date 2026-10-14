import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Activity input is required');
  }

  const body = input as Record<string, unknown>;
  const userId = String(body.userId ?? '');
  const teamId = String(body.teamId ?? '');
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const minutesRaw = body.minutes;

  if (!userId || !teamId || !type || typeof minutesRaw !== 'number' || !Number.isFinite(minutesRaw) || minutesRaw <= 0) {
    throw badRequest('userId, teamId, type, and minutes are required');
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw badRequest('userId must be a valid ObjectId');
  }

  if (!mongoose.isValidObjectId(teamId)) {
    throw badRequest('teamId must be a valid ObjectId');
  }

  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) {
    throw badRequest('User and team must both exist');
  }

  const minutes = Number(minutesRaw);
  const points = Math.max(1, Math.round(minutes));
  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Team input is required');
  }

  const body = input as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  const rawMembers = Array.isArray(body.members) ? body.members : [];

  if (!name) {
    throw badRequest('Team name is required');
  }
  if (!mascot) {
    throw badRequest('Team mascot is required');
  }

  const members = [] as mongoose.Types.ObjectId[];
  for (const member of rawMembers) {
    if (typeof member !== 'string' || !mongoose.isValidObjectId(member)) {
      throw badRequest('Team members must be valid user IDs');
    }
    const user = await User.findById(member);
    if (!user) {
      throw badRequest('Each team member must reference an existing user');
    }
    members.push(user._id as mongoose.Types.ObjectId);
  }

  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  if (!totals.length) {
    return [];
  }

  const teamIds = totals.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }).lean();
  const teamNameById = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals.map((entry, index) => ({
    teamName: teamNameById.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const preferredFocus = typeof user.fitnessGoal === 'string' && user.fitnessGoal.trim() ? user.fitnessGoal.trim().toLowerCase() : (recentActivities[0]?.type ?? '').toLowerCase();
  const focusNames = new Set(['endurance', 'strength', 'mobility', 'balance', 'recovery']);

  const workouts = await Workout.find().lean();

  const scored = workouts
    .map((workout) => {
      const focus = typeof workout.focus === 'string' ? workout.focus.toLowerCase() : '';
      let score = 0;

      if (focus === preferredFocus) score += 100;
      if (preferredFocus && focus.includes(preferredFocus)) score += 50;
      if (focusNames.has(focus) && focusNames.has(preferredFocus) && focus === preferredFocus) score += 25;
      if (recentActivities.some((activity) => activity.type && focus.includes(activity.type.toLowerCase()))) score += 10;
      if (recentActivities.some((activity) => activity.type && activity.type.toLowerCase() === focus)) score += 25;

      return { ...workout, score };
    })
    .sort((left, right) => right.score - left.score || Number(left.minutes ?? 0) - Number(right.minutes ?? 0));

  const suggestions = scored.slice(0, 3).map((workout) => {
    const title = String(workout.title ?? 'Workout');
    const focus = String(workout.focus ?? 'general');
    const minutes = Number(workout.minutes ?? 0);
    const difficulty = String(workout.difficulty ?? 'moderate');
    const reasonBase = recentActivities.length
      ? `Based on your recent ${recentActivities[0].type} activity and ${user.fitnessGoal || 'fitness goal'}`
      : `Based on your ${user.fitnessGoal || 'fitness'} goal`;

    return {
      title,
      focus,
      minutes,
      difficulty,
      reason: `${reasonBase} for ${focus.toLowerCase()} training.`,
    };
  });

  return suggestions;
}

export { User };
