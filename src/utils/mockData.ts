import type { DataGridRow, TimelineEvent } from '../types';

const CATEGORIES: DataGridRow['category'][] = ['Work', 'Personal', 'Urgent', 'Health', 'Finance'];
const STATUSES: DataGridRow['status'][] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

const TITLES = [
  'Team Sync Meeting', 'Review Pull Request', 'Quarterly Planning', 'Doctor Appointment',
  'Client Presentation', 'Database Migration', 'Update Documentation', 'System Maintenance',
  'Budget Review', 'Design System Workshop', 'Sprint Retrospective', 'Code Refactoring'
];

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateDataGridRows = (count = 100000): DataGridRow[] => {
  const rows: DataGridRow[] = new Array(count);
  const startDate = new Date(2025, 0, 1).getTime();
  const endDate = new Date(2026, 11, 31).getTime();
  const timeSpan = endDate - startDate;

  for (let i = 0; i < count; i++) {
    const randomTime = startDate + (i * 1337) % timeSpan;
    const randomDate = new Date(randomTime);

    rows[i] = {
      id: `grid-row-${i + 1}`,
      title: `${TITLES[i % TITLES.length]} #${i + 1}`,
      category: CATEGORIES[i % CATEGORIES.length],
      status: STATUSES[i % STATUSES.length],
      date: formatDate(randomDate),
      amount: Math.floor((i * 17) % 5000) + 10,
    };
  }

  return rows;
};

export const generateTimelineEvents = (count = 10000): TimelineEvent[] => {
  const events: TimelineEvent[] = new Array(count);
  const startDate = new Date(2026, 0, 1).getTime();
  const daysSpan = 180; 

  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(i / (count / daysSpan));
    const eventDate = new Date(startDate + dayOffset * 24 * 60 * 60 * 1000);
    
    const hours = String((i % 12) + 8).padStart(2, '0');
    const minutes = (i % 4) * 15 === 0 ? '00' : String((i % 4) * 15);

    events[i] = {
      id: `evt-${i + 1}`,
      title: `${TITLES[i % TITLES.length]}`,
      date: formatDate(eventDate),
      time: `${hours}:${minutes}`,
      description: `Detailed task description for event reference #${i + 1}`,
      category: CATEGORIES[i % CATEGORIES.length],
    };
  }

  return events;
};