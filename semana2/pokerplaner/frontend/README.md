# Poker Planner Frontend

## Overview

This is the frontend for the Planning Poker MVP. It is a Next.js app that uses `socket.io` for real-time session updates.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm run dev
   ```

3. Open the app in the browser at `http://localhost:3000`.

## Features

- Create or join a session without authentication
- Organizer can add tasks, select the active task, reveal votes, reset voting, and save results
- Participant votes are hidden until the organizer reveals them
- Session state is held in server memory only

## Test

Run the Playwright E2E test:

```bash
npm run test:e2e
```

## Notes

The project uses a dummy session with sample tasks for quick demoing.
