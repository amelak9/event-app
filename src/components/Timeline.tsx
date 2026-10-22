import { useState, useRef, useMemo, useCallback } from 'react';
import type { TimelineEvent } from '../types';
import { Calendar, Clock, Tag, ChevronRight, ChevronDown } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
      const dayKey = event.date; // YYYY-MM-DD
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(event);
    });
    return groups;
  }, [events]);

  const groupKeys = useMemo(() => Object.keys(groupedEvents).sort().reverse(), [groupedEvents]);

  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  const groupRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const itemRefs = useRef<Record<string, (HTMLDivElement | null)[]>>({});

  useMemo(() => {
    const initial: Record<string, boolean> = {};
    groupKeys.slice(0, 3).forEach((key) => {
      initial[key] = true;
    });
    setExpandedGroups((prev) => (Object.keys(prev).length === 0 ? initial : prev));
  }, [groupKeys]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const nextState = !prev[groupKey];
      setSrAnnouncement(`Group ${groupKey} ${nextState ? 'expanded' : 'collapsed'}`);
      return { ...prev, [groupKey]: nextState };
    });
  };

  const currentGroupKey = groupKeys[selectedGroupIndex] || '';
  const currentGroupEvents = groupedEvents[currentGroupKey] || [];

  const announceAndFocusItem = useCallback(
    (gIdx: number, iIdx: number) => {
      const gKey = groupKeys[gIdx];
      const evList = groupedEvents[gKey] || [];
      const ev = evList[iIdx];

      if (ev) {
        setSrAnnouncement(`Event ${iIdx + 1} of ${evList.length} in group ${gKey}: ${ev.title} at ${ev.time}`);
        itemRefs.current[gKey]?.[iIdx]?.focus();
      }
    },
    [groupKeys, groupedEvents]
  );

  const announceAndFocusGroup = useCallback(
    (gIdx: number) => {
      const gKey = groupKeys[gIdx];
      if (gKey) {
        const count = groupedEvents[gKey]?.length || 0;
        setSrAnnouncement(`Group ${gIdx + 1} of ${groupKeys.length}: ${gKey} with ${count} events`);
        groupRefs.current[gIdx]?.focus();
      }
    },
    [groupKeys, groupedEvents]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextGIdx = Math.min(selectedGroupIndex + 1, groupKeys.length - 1);
      setSelectedGroupIndex(nextGIdx);
      setSelectedItemIndex(0);
      announceAndFocusGroup(nextGIdx);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevGIdx = Math.max(selectedGroupIndex - 1, 0);
      setSelectedGroupIndex(prevGIdx);
      setSelectedItemIndex(0);
      announceAndFocusGroup(prevGIdx);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!expandedGroups[currentGroupKey]) {
        toggleGroup(currentGroupKey);
      }
      const nextIIdx = Math.min(selectedItemIndex + 1, currentGroupEvents.length - 1);
      setSelectedItemIndex(nextIIdx);
      announceAndFocusItem(selectedGroupIndex, nextIIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedItemIndex > 0) {
        const prevIIdx = selectedItemIndex - 1;
        setSelectedItemIndex(prevIIdx);
        announceAndFocusItem(selectedGroupIndex, prevIIdx);
      } else {
        announceAndFocusGroup(selectedGroupIndex);
      }
    }
  };

  return (
    <div className="space-y-6 focus:outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs">→</kbd> Switch Day Groups |{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs">↑</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs">↓</kbd> Navigate Events
          </span>
        </div>
        <span className="font-medium text-slate-500">
          Total: {events.length.toLocaleString()} events ({groupKeys.length} days)
        </span>
      </div>

      <div className="space-y-4" role="feed" aria-label="Timeline Events Grouped by Day">
        {groupKeys.map((groupKey, gIdx) => {
          const isExpanded = expandedGroups[groupKey] ?? false;
          const groupEvents = groupedEvents[groupKey];
          const isGroupFocused = gIdx === selectedGroupIndex;

          return (
            <div
              key={groupKey}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                isGroupFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <button
                ref={(el) => {
                  groupRefs.current[gIdx] = el;
                }}
                tabIndex={isGroupFocused ? 0 : -1}
                onClick={() => {
                  setSelectedGroupIndex(gIdx);
                  toggleGroup(groupKey);
                }}
                aria-expanded={isExpanded}
                aria-label={`Group ${groupKey}, ${groupEvents.length} events`}
                className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-semibold text-slate-800 text-sm border-b border-slate-200 transition-colors focus:outline-hidden"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{groupKey}</span>
                  <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-200/60 rounded-full">
                    {groupEvents.length} events
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {isExpanded && (
                <div
                  role="group"
                  aria-label={`Events for ${groupKey}`}
                  className="p-4 space-y-3 relative before:absolute before:top-6 before:bottom-6 before:left-8 before:w-0.5 before:bg-slate-200"
                >
                  {groupEvents.map((event, iIdx) => {
                    const isItemFocused = isGroupFocused && iIdx === selectedItemIndex;

                    return (
                      <div
                        key={event.id}
                        ref={(el) => {
                          if (!itemRefs.current[groupKey]) {
                            itemRefs.current[groupKey] = [];
                          }
                          itemRefs.current[groupKey][iIdx] = el;
                        }}
                        tabIndex={isItemFocused ? 0 : -1}
                        role="article"
                        aria-label={`${event.title} at ${event.time}, category ${event.category}`}
                        onClick={() => {
                          setSelectedGroupIndex(gIdx);
                          setSelectedItemIndex(iIdx);
                          announceAndFocusItem(gIdx, iIdx);
                        }}
                        className={`relative pl-8 pr-4 py-3 rounded-lg border transition-all cursor-pointer focus:outline-hidden ${
                          isItemFocused
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="absolute left-2.5 top-4 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center z-10" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 text-sm">{event.title}</h3>
                              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {event.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{event.description}</p>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-medium">
                              <Tag className="w-3 h-3 text-indigo-500" />
                              {event.category}
                            </span>
                            <span className="font-mono text-slate-600">{event.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}