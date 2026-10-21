import { useMemo, useState } from 'react';
import { generateDataGridRows, generateTimelineEvents } from './utils/mockData';
import type { DataGridRow, TimelineEvent } from './types';

export default function App() {
  const initialGridRows = useMemo(() => {
    console.time('Generate 100k Grid Rows');
    const data = generateDataGridRows(100000);
    console.timeEnd('Generate 100k Grid Rows');
    return data;
  }, []);

  const initialTimelineEvents = useMemo(() => {
    console.time('Generate 10k Timeline Events');
    const data = generateTimelineEvents(10000);
    console.timeEnd('Generate 10k Timeline Events');
    return data;
  }, []);

  const [gridData, setGridData] = useState<DataGridRow[]>(initialGridRows);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [activeTab, setActiveTab] = useState<'grid' | 'timeline'>('grid');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Demo</h1>
          <p className="text-sm text-gray-500">
            Showcasing DataGrid (100k rows) & Timeline (10k events)
          </p>
        </div>

        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          onClick={() => alert('Form modal!')}
        >
          + Add New Event
        </button>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'grid'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            DataGrid ({gridData.length.toLocaleString()} rows)
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Timeline ({timelineEvents.length.toLocaleString()} events)
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[400px]">
          {activeTab === 'grid' ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">DataGrid Placeholder</h2>
              <p className="text-gray-600">DataGrid placeholder content</p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-2">Timeline Placeholder</h2>
              <p className="text-gray-600">Timeline placeholder content</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}