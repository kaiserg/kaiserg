import { Task } from './types';

export const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement join flow',
    description: 'Allow organizers and participants to create or join a session.',
  },
  {
    id: 'task-2',
    title: 'Build voting deck',
    description: 'Show hidden voting cards and reveal results only when the organizer wants.',
  },
  {
    id: 'task-3',
    title: 'Show estimates in the task list',
    description: 'Once a vote is saved, display the final estimate on the task.',
  },
];
