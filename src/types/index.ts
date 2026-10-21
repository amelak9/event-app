export interface DataGridRow {
  id: string;
  title: string;
  category: 'Work' | 'Personal' | 'Urgent' | 'Health' | 'Finance';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  category: 'Work' | 'Personal' | 'Urgent' | 'Health' | 'Finance';
}