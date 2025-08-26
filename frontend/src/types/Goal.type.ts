
export type Goal = {
  _id: string;
  name: string;
  description?: string;
  progress: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  user_id: string;
  createdAt: string;
  updatedAt: string;
}