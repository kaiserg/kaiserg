# Poker Planner

A simple Planning Poker MVP built as a Next.js frontend app with in-memory session state and real-time updates via Socket.IO.

## Structure

- `frontend/` - Next.js app
  - `app/` - page and UI components
  - `pages/api/socket.ts` - Socket.IO server endpoint
  - `lib/` - shared types and demo data
  - `tests/` - Playwright end-to-end tests

## Run

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` and click through to the demo session.

## Test

```bash
cd frontend
npm run test:e2e
```

## Notes

- No persistence across restarts; session state is stored in server memory only
- Voting is hidden until the organizer reveals results
- The app ships with a sample demo session to make it easy to try immediately
