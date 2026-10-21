import { useMemo, useState } from 'react';
import { generateDataGridRows, generateTimelineEvents } from './utils/mockData';
import type { DataGridRow, TimelineEvent } from './types';
import { DataGrid, type ColumnConfig } from './components/DataGrid';

export default function App() {
  const initialGridRows = useMemo(() => generateDataGridRows(100000), []);
  const initialTimelineEvents = useMemo(() => generateTimelineEvents(10000), []);

  const [gridData] = useState<DataGridRow[]>(initialGridRows);
  const [timelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [activeTab, setActiveTab] = useState<'grid' | 'timeline'>('grid');

  // Explicit status styling map for Tailwind scanner
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
    }
  };

  // Column Configuration for DataGrid
  const gridColumns = useMemo<ColumnConfig<DataGridRow>[]>(
    () => [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      { id: 'title', header: 'Title', accessorKey: 'title' },
      {
        id: 'category',
        header: 'Category',
        accessorKey: 'category',
        cell: (info) => (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
            {info.getValue()}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => getStatusBadge(info.getValue() as string),
      },
      { id: 'date', header: 'Date', accessorKey: 'date' },
      {
        id: 'amount',
        header: 'Amount',
        accessorKey: 'amount',
        cell: (info) => (
          <span className="font-semibold text-gray-900">
            ${Number(info.getValue()).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Demo</h1>
          <p className="text-sm text-slate-500">
            Showcasing DataGrid (100k rows) & Timeline (10k events)
          </p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
          onClick={() => alert('Modal form!')}
        >
          + Add New Event
        </button>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'grid'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            DataGrid ({gridData.length.toLocaleString()} rows)
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Timeline ({timelineEvents.length.toLocaleString()} events)
          </button>
        </div>

        {activeTab === 'grid' ? (
          <DataGrid data={gridData} columns={gridColumns} pageSize={50} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-semibold mb-2">Timeline Placeholder</h2>
            <p className="text-slate-600">
              Timeline placeholder content
            </p>
          </div>
        )}
      </main>
    </div>
  );
}