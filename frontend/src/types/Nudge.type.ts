export interface Nudge {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  generatedAt: string;
}
