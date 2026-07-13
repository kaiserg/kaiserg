import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Session, Participant, Task, VoteValue } from '../../lib/types';
import { demoTasks } from '../../lib/dummyData';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: SocketIOServer;
    };
  };
};

const sessions = new Map<string, Session>();

function makeId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function cloneDemoTasks(): Task[] {
  return demoTasks.map((task) => ({ ...task }));
}

function broadcastSession(io: SocketIOServer, code: string, session: Session) {
  io.to(code).emit('session-update', session);
}

function getSession(code?: string) {
  if (!code) return null;
  return sessions.get(code) ?? null;
}

function clearVotes(session: Session) {
  session.votesRevealed = false;
  session.participants.forEach((participant) => {
    participant.hasVoted = false;
    participant.vote = undefined;
  });
}

function computeAverageVote(session: Session): string {
  const numericVotes = session.participants
    .map((participant) => participant.vote)
    .filter((vote): vote is VoteValue => !!vote && vote !== '?')
    .map((vote) => parseInt(vote, 10))
    .filter((value) => !Number.isNaN(value));

  if (!numericVotes.length) {
    return '?';
  }

  const total = numericVotes.reduce((sum, value) => sum + value, 0);
  return String(Math.round((total / numericVotes.length) * 10) / 10);
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const server = res.socket.server as any;
    const io = new SocketIOServer(server, {
      path: '/api/socket',
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket) => {
      const currentSession = { code: '', participantId: '' };

      function emitError(message: string) {
        socket.emit('error-message', message);
      }

      socket.on('create-session', (payload, callback) => {
        const name = payload?.organizerName?.trim();
        const sessionName = payload?.sessionName?.trim() || 'Planning Poker';

        if (!name) {
          callback?.({ ok: false, message: 'Organizer name is required.' });
          return;
        }

        let code = makeCode();
        while (sessions.has(code)) {
          code = makeCode();
        }

        const organizerId = makeId('participant');
        const session: Session = {
          sessionId: makeId('session'),
          code,
          name: sessionName,
          organizerId,
          tasks: cloneDemoTasks(),
          participants: [
            {
              id: organizerId,
              name,
              hasVoted: false,
            },
          ],
          activeTaskId: cloneDemoTasks()[0]?.id ?? null,
          votesRevealed: false,
        };

        sessions.set(code, session);
        currentSession.code = code;
        currentSession.participantId = organizerId;
        socket.join(code);
        broadcastSession(io, code, session);
        callback?.({ ok: true, participantId: organizerId });
      });

      socket.on('join-session', (payload, callback) => {
        const code = payload?.code?.trim().toUpperCase();
        const name = payload?.name?.trim();
        const session = getSession(code);

        if (!code || !name) {
          callback?.({ ok: false, message: 'Session code and name are required.' });
          return;
        }

        if (!session) {
          callback?.({ ok: false, message: 'Session not found.' });
          return;
        }

        const participantId = makeId('participant');
        session.participants.push({
          id: participantId,
          name,
          hasVoted: false,
        });

        currentSession.code = code;
        currentSession.participantId = participantId;
        socket.join(code);
        broadcastSession(io, code, session);
        callback?.({ ok: true, participantId });
      });

      socket.on('add-task', (payload) => {
        const session = getSession(currentSession.code);
        if (!session || session.organizerId !== currentSession.participantId) {
          emitError('Only the organizer can add tasks.');
          return;
        }

        const title = payload?.title?.trim();
        const description = payload?.description?.trim();

        if (!title) {
          emitError('Task title is required.');
          return;
        }

        session.tasks.push({
          id: makeId('task'),
          title,
          description,
        });

        broadcastSession(io, currentSession.code, session);
      });

      socket.on('select-task', (payload) => {
        const session = getSession(currentSession.code);
        if (!session || session.organizerId !== currentSession.participantId) {
          emitError('Only the organizer can select the active task.');
          return;
        }

        if (!session.tasks.some((task) => task.id === payload?.taskId)) {
          emitError('Selected task does not exist.');
          return;
        }

        session.activeTaskId = payload.taskId;
        clearVotes(session);
        broadcastSession(io, currentSession.code, session);
      });

      socket.on('cast-vote', (payload) => {
        const session = getSession(currentSession.code);
        if (!session) {
          emitError('Session not found.');
          return;
        }

        const participant = session.participants.find((item) => item.id === currentSession.participantId);
        if (!participant) {
          emitError('Participant not found.');
          return;
        }

        const value = payload?.value;
        participant.vote = value;
        participant.hasVoted = true;
        broadcastSession(io, currentSession.code, session);
      });

      socket.on('reveal-votes', () => {
        const session = getSession(currentSession.code);
        if (!session || session.organizerId !== currentSession.participantId) {
          emitError('Only the organizer can reveal votes.');
          return;
        }

        session.votesRevealed = true;
        broadcastSession(io, currentSession.code, session);
      });

      socket.on('reset-votes', () => {
        const session = getSession(currentSession.code);
        if (!session || session.organizerId !== currentSession.participantId) {
          emitError('Only the organizer can reset voting.');
          return;
        }

        clearVotes(session);
        broadcastSession(io, currentSession.code, session);
      });

      socket.on('save-result', () => {
        const session = getSession(currentSession.code);
        if (!session || session.organizerId !== currentSession.participantId) {
          emitError('Only the organizer can save the result.');
          return;
        }

        const activeTask = session.tasks.find((task) => task.id === session.activeTaskId);
        if (!activeTask) {
          emitError('No active task is selected.');
          return;
        }

        activeTask.estimate = computeAverageVote(session);
        const nextTask = session.tasks.find((task) => task.id !== activeTask.id && task.estimate === undefined);
        session.activeTaskId = nextTask?.id ?? null;
        clearVotes(session);
        broadcastSession(io, currentSession.code, session);
      });

      socket.on('disconnect', () => {
        // Keep session state in memory without removing past participants.
      });
    });

    res.socket.server.io = io;
  }

  res.status(200).end();
}
