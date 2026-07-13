export type VoteValue = '1' | '2' | '3' | '5' | '8' | '13' | '21' | '?';

export type Task = {
  id: string;
  title: string;
  description?: string;
  estimate?: string;
};

export type Participant = {
  id: string;
  name: string;
  vote?: VoteValue;
  hasVoted: boolean;
};

export type Session = {
  sessionId: string;
  code: string;
  name: string;
  organizerId: string;
  tasks: Task[];
  participants: Participant[];
  activeTaskId: string | null;
  votesRevealed: boolean;
};
