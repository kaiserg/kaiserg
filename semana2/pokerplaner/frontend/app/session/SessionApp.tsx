'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Participant, Session, Task, VoteValue } from '../../lib/types';

const deck: VoteValue[] = ['1', '2', '3', '5', '8', '13', '21', '?'];

type ServerSessionPayload = {
  ok: boolean;
  participantId?: string;
  message?: string;
};

const initialForm = { name: '', code: '', sessionName: '' };

function getDisplayVote(participant: Participant, votesRevealed: boolean) {
  if (!participant.hasVoted) return 'waiting';
  if (votesRevealed) return participant.vote ?? '-';
  return 'voted';
}

export default function SessionApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  useEffect(() => {
    const socketClient = io({ path: '/api/socket' });
    setSocket(socketClient);

    socketClient.on('session-update', (newSession: Session) => {
      setSession(newSession);
      setError(null);
    });

    socketClient.on('error-message', (message: string) => {
      setError(message);
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const activeTask = useMemo(() => {
    return session?.tasks.find((task) => task.id === session.activeTaskId) ?? null;
  }, [session]);

  const averageVote = useMemo(() => {
    if (!session) return '?';
    const numeric = session.participants
      .map((p) => p.vote)
      .filter((vote): vote is VoteValue => !!vote && vote !== '?')
      .map((vote) => parseInt(vote, 10))
      .filter((n) => !Number.isNaN(n));

    if (!numeric.length) return '?';
    return String(Math.round((numeric.reduce((a, b) => a + b, 0) / numeric.length) * 10) / 10);
  }, [session]);

  const handleChange = useCallback((field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const createSession = useCallback(() => {
    if (!socket) return;
    socket.emit('create-session', {
      organizerName: form.name,
      sessionName: form.sessionName,
    }, (response: ServerSessionPayload) => {
      if (!response.ok) {
        setError(response.message ?? 'Create session failed.');
        return;
      }
      setParticipantId(response.participantId ?? null);
      setIsOrganizer(true);
      setError(null);
    });
  }, [form.name, form.sessionName, socket]);

  const joinSession = useCallback(() => {
    if (!socket) return;
    socket.emit('join-session', {
      code: form.code,
      name: form.name,
    }, (response: ServerSessionPayload) => {
      if (!response.ok) {
        setError(response.message ?? 'Join session failed.');
        return;
      }
      setParticipantId(response.participantId ?? null);
      setIsOrganizer(false);
      setError(null);
    });
  }, [form.code, form.name, socket]);

  const castVote = useCallback((value: VoteValue) => {
    socket?.emit('cast-vote', { value });
  }, [socket]);

  const revealVotes = useCallback(() => {
    socket?.emit('reveal-votes');
  }, [socket]);

  const resetVotes = useCallback(() => {
    socket?.emit('reset-votes');
  }, [socket]);

  const saveResult = useCallback(() => {
    socket?.emit('save-result');
  }, [socket]);

  const selectTask = useCallback((taskId: string) => {
    socket?.emit('select-task', { taskId });
  }, [socket]);

  const addTask = useCallback(() => {
    if (!taskTitle.trim()) {
      setError('Task title is required.');
      return;
    }
    socket?.emit('add-task', {
      title: taskTitle,
      description: taskDescription,
    });
    setTaskTitle('');
    setTaskDescription('');
  }, [socket, taskDescription, taskTitle]);

  if (!session) {
    return (
      <main>
        <section style={{ maxWidth: 520, margin: '0 auto' }}>
          <h1>Poker Planner</h1>
          <p>Start or join a Planning Poker session with demo tasks.</p>
          <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
            <label>
              Your name
              <input
                placeholder="Your name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                style={{ width: '100%', marginTop: 8, padding: 12 }}
              />
            </label>
            <label>
              Session name
              <input
                placeholder="Session name"
                type="text"
                value={form.sessionName}
                onChange={(event) => handleChange('sessionName', event.target.value)}
                style={{ width: '100%', marginTop: 8, padding: 12 }}
              />
            </label>
            <button
              type="button"
              onClick={createSession}
              style={{ padding: '14px 18px', background: '#753991', color: '#fff', border: 'none', borderRadius: 10 }}
            >
              Create session
            </button>
            <div style={{ borderTop: '1px solid #ddd', paddingTop: 16 }}>
              <label>
                Session code
                <input
                  placeholder="Session code"
                  type="text"
                  value={form.code}
                  onChange={(event) => handleChange('code', event.target.value)}
                  style={{ width: '100%', marginTop: 8, padding: 12 }}
                />
              </label>
              <button
                type="button"
                onClick={joinSession}
                style={{ marginTop: 12, padding: '14px 18px', background: '#209dd7', color: '#fff', border: 'none', borderRadius: 10 }}
              >
                Join session
              </button>
            </div>
            {error && <p style={{ color: '#c0392b' }}>{error}</p>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section style={{ display: 'grid', gap: 24 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div>
            <p style={{ margin: 0, color: '#888888' }}>Session code</p>
            <h1 data-testid="session-code" style={{ margin: '8px 0' }}>{session.code}</h1>
            <p style={{ margin: 0, color: '#888888' }}>{session.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#888888' }}>
              Role: {isOrganizer ? 'Organizer' : 'Participant'}
            </p>
            <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{session.participants.find((p) => p.id === participantId)?.name}</p>
          </div>
        </header>

        <div style={{ display: 'grid', gap: 24 }}>
          <section style={{ display: 'grid', gap: 16, padding: 24, borderRadius: 24, background: '#ffffff', boxShadow: '0 20px 60px rgba(9, 30, 66, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <p style={{ margin: 0, color: '#888888' }}>Active task</p>
                <h2 style={{ margin: '8px 0' }}>{activeTask?.title ?? 'No task selected'}</h2>
                <p style={{ margin: 0, color: '#888888' }}>{activeTask?.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#888888' }}>Average</p>
                <p style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{session.votesRevealed ? averageVote : '-'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {deck.map((value) => {
                const active = session.participants.some((p) => p.id === participantId && p.vote === value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => castVote(value)}
                    style={{
                      flex: '1 1 80px',
                      minWidth: 80,
                      padding: '18px 0',
                      borderRadius: 18,
                      border: active ? '2px solid #209dd7' : '2px solid transparent',
                      background: '#f7f8fc',
                      color: '#032147',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {isOrganizer && (
                <>
                  <button type="button" onClick={revealVotes} style={{ padding: '14px 18px', background: '#ecad0a', color: '#032147', border: 'none', borderRadius: 14 }}>
                    Reveal votes
                  </button>
                  <button type="button" onClick={resetVotes} style={{ padding: '14px 18px', background: '#753991', color: '#fff', border: 'none', borderRadius: 14 }}>
                    Reset votes
                  </button>
                  <button type="button" onClick={saveResult} style={{ padding: '14px 18px', background: '#209dd7', color: '#fff', border: 'none', borderRadius: 14 }}>
                    Save result
                  </button>
                </>
              )}
              {!isOrganizer && <p style={{ color: '#888888', margin: 0 }}>Wait for the organizer to reveal results.</p>}
            </div>
          </section>

          <section style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gap: 12, padding: 24, borderRadius: 24, background: '#ffffff', boxShadow: '0 20px 60px rgba(9, 30, 66, 0.08)' }}>
              <h2 style={{ margin: 0 }}>Participants</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {session.participants.map((participant) => (
                  <div key={participant.id} data-testid={`participant-${participant.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: 12, borderRadius: 16, background: '#f7f8fc' }}>
                    <span data-testid="participant-name">{participant.name}</span>
                    <span data-testid="participant-vote" style={{ color: '#888888' }}>
                      {getDisplayVote(participant, session.votesRevealed)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16, padding: 24, borderRadius: 24, background: '#ffffff', boxShadow: '0 20px 60px rgba(9, 30, 66, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Tasks</h2>
                {isOrganizer && <span style={{ color: '#209dd7' }}>Organizer mode</span>}
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {session.tasks.map((task) => {
                  const active = task.id === session.activeTaskId;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => isOrganizer && selectTask(task.id)}
                      style={{
                        textAlign: 'left',
                        padding: 16,
                        borderRadius: 18,
                        background: active ? '#e7f4ff' : '#f7f8fc',
                        border: active ? '2px solid #209dd7' : '1px solid #e6e8ef',
                        cursor: isOrganizer ? 'pointer' : 'default',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700 }}>{task.title}</p>
                          <p style={{ margin: '8px 0 0', color: '#888888' }}>{task.description}</p>
                        </div>
                        <span style={{ color: '#209dd7', fontWeight: 700 }}>{task.estimate ?? '–'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {isOrganizer && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <input
                    type="text"
                    placeholder="New task title"
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid #d9dbe9' }}
                  />
                  <textarea
                    placeholder="Optional description"
                    value={taskDescription}
                    onChange={(event) => setTaskDescription(event.target.value)}
                    style={{ width: '100%', minHeight: 96, padding: 12, borderRadius: 14, border: '1px solid #d9dbe9' }}
                  />
                  <button
                    type="button"
                    onClick={addTask}
                    style={{ padding: '14px 18px', background: '#209dd7', color: '#fff', border: 'none', borderRadius: 14 }}
                  >
                    Add task
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      </section>
    </main>
  );
}
