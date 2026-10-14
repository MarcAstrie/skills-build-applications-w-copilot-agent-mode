# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the React app thin and declarative: route-level components fetch the API, render accessible loading/empty/error states, and rely on shared Bootstrap styling instead of business logic in the UI.
- Logic tier decision: Put validation, relationship checks, aggregate queries, and recommendation logic in the Express service layer so the route files stay minimal and each /api endpoint becomes a thin adapter over a single service function.
- Data tier decision: Use Mongoose schemas with required fields, ObjectId references, and default values for teams and activities so the database enforces the domain contract and tests cover model integrity before API behavior.
- Activity tracking approach: Accept userId and teamId, validate both exist, reject malformed IDs with a deliberate 4xx, compute points from minutes and activity type, and store occurredAt for ordering and reporting.
- Team management approach: Require a team name at creation time, default the members array to an empty list, and keep team membership as ObjectId references so teams can be listed or aggregated without duplicating user records.
- Leaderboard approach: Aggregate activity totals by team, sort descending by total points, then assign ranks starting at 1 so the UI can render a stable ordered leaderboard without client-side sorting.
- Workout suggestions approach: Match a user by email, inspect their recent activity and fitnessGoal, and return the best-fit workout recommendations with a brief reason explaining the match while returning a 4xx for unknown users.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — verifies the Mongoose schemas and seed script enforce required fields, default arrays, and idempotent seeded data. Failures here indicate broken schema contracts before API logic is even exercised.
- API command: `npm run test:api --prefix octofit-tracker/backend` — exercises the Express endpoints for activity creation, team creation, leaderboard ranking, and workout suggestions. Failures here isolate service and route behavior, especially invalid input handling and aggregate logic.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — checks that the React app renders API-backed views, handles loading/empty/error states, and requests workout suggestions for the correct user. Failures here indicate UI contract gaps rather than backend data issues.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — confirms the TypeScript service and model layer compiles cleanly after schema and API changes.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — confirms the React app and TypeScript components compile cleanly after data-fetching and accessibility changes.
