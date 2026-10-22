import { useMemo, useState } from 'react';
import { generateDataGridRows, generateTimelineEvents } from './utils/mockData';
import type { DataGridRow, TimelineEvent } from './types';
import { DataGrid, type ColumnConfig } from './components/DataGrid';
import { Timeline } from './components/Timeline';
import { AddEventModal } from './components/AddEventModal';
import { Plus, Pencil } from 'lucide-react';

export default function App() {
  const initialGridRows = useMemo(() => generateDataGridRows(100000), []);
  const initialTimelineEvents = useMemo(() => generateTimelineEvents(10000), []);

  const [gridData, setGridData] = useState<DataGridRow[]>(initialGridRows);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [activeTab, setActiveTab] = useState<'grid' | 'timeline'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{
    gridRow: DataGridRow;
    timelineEvent?: TimelineEvent;
  } | null>(null);

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row: DataGridRow) => {
    const relatedTimelineEvent = timelineEvents.find((e) => e.id === row.id);
    setEditingEvent({ gridRow: row, timelineEvent: relatedTimelineEvent });
    setIsModalOpen(true);
  };

  const handleSaveEvent = ({
    gridRow,
    timelineEvent,
  }: {
    gridRow: DataGridRow;
    timelineEvent: TimelineEvent;
  }) => {
    if (editingEvent) {
      setGridData((prev) => prev.map((item) => (item.id === gridRow.id ? gridRow : item)));
      setTimelineEvents((prev) =>
        prev.map((item) => (item.id === timelineEvent.id ? timelineEvent : item))
      );
    } else {
      setGridData((prev) => [gridRow, ...prev]);
      setTimelineEvents((prev) => [timelineEvent, ...prev]);
    }
  };

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
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

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
          <span className="font-semibold text-slate-900">
            ${Number(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'id',
        enableSorting: false,
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Edit event"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          );
        },
      },
    ],
    [timelineEvents]
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">High-Perf A11y Dashboard</h1>
          <p className="text-sm text-slate-500">
            Featuring 100k Row Virtualized DataGrid & 10k Event Keyboard-Navigable Timeline
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
          onClick={handleOpenAddModal}
        >
          <Plus className="w-4 h-4" />
          Add New Event
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
          <Timeline events={timelineEvents} />
        )}
      </main>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialData={editingEvent}
      />
    </div>
  );
}