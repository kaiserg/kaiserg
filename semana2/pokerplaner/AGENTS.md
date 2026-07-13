# Poker Planner Project

## Business Requirements

- An MVP of a Planning Poker estimation tool as a web app
- Two roles: **Organizer** and **Participant**. No authentication, just a name entered on join.
- The Organizer creates a session and gets a shareable session code/link
- Participants join a session by entering the code and their display name
- The Organizer adds tasks (title and optional description) to be estimated
- The Organizer selects the active task; participants vote on it using a fixed Fibonacci deck (1, 2, 3, 5, 8, 13, 21, ?)
- Votes are hidden while voting is in progress; each participant sees only that others "have voted"
- The Organizer reveals all votes at once; the app shows each vote plus the average
- The Organizer can reset votes for a re-vote, or save the result and move to the next task
- Estimated tasks show their final value in the task list
- No more functionality: no persistence across restarts, no history, no export, no timers. Keep it simple.
- The priority is a slick, professional, gorgeous UI/UX with very simple features
- The app should open with a dummy session pre-populated with sample tasks for easy demoing

## Technical Details

- Implemented as a modern NextJS app in a subdirectory `frontend`
- Real-time sync between organizer and participants via WebSockets (e.g. Socket.IO) or a simple polling fallback — pick the simplest reliable option
- Session state held in server memory only; no database, no persistence
- No user management for the MVP; a display name per participant is enough
- Use popular libraries
- As simple as possible but with an elegant UI

## Color Scheme

- Accent Yellow: `#ecad0a` - accent lines, highlights, revealed vote emphasis
- Blue Primary: `#209dd7` - links, key sections, selected voting card
- Purple Secondary: `#753991` - submit buttons, important actions (reveal, next task)
- Dark Navy: `#032147` - main headings
- Gray Text: `#888888` - supporting text, labels, "waiting for votes" states

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all criteria are met
3. Carry out extensive integration testing with Playwright or similar, simulating an organizer plus multiple participants voting concurrently, fixing defects
4. Only complete when the MVP is finished and tested, with the server running and ready for the user

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
