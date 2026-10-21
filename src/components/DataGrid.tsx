import { useState, useRef, useMemo } from 'react';
import { useReactTable } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/table-core';
import { flexRender } from '@tanstack/react-table';

import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Inbox,
} from 'lucide-react';

export interface ColumnConfig<T> {
  id: string;
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (info: any) => React.ReactNode;
  enableSorting?: boolean;
}

interface DataGridProps<T extends object> {
  data: T[];
  columns: ColumnConfig<T>[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  pageSize?: number;
}

export function DataGrid<T extends object>({
  data,
  columns: userColumns,
  isLoading = false,
  isError = false,
  errorMessage = 'An error occurred while loading data.',
  pageSize: initialPageSize = 50,
}: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  const columns = useMemo<ColumnDef<T, any>[]>(() => {
    return userColumns.map((col) => ({
      id: col.id,
      header: col.header,
      accessorKey: typeof col.accessorKey === 'string' ? (col.accessorKey as string) : undefined,
      accessorFn: typeof col.accessorKey === 'function' ? (col.accessorKey as any) : undefined,
      cell: col.cell ? (info) => col.cell!(info) : (info) => info.getValue(),
      enableSorting: col.enableSorting ?? true,
    }));
  }, [userColumns]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-xl bg-white text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="font-medium">Loading data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-red-200 bg-red-50 rounded-xl text-red-600">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-medium">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all rows..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColumnToggle(!showColumnToggle)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>Columns</span>
          </button>

          {showColumnToggle && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 space-y-1">
              <p className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase">Toggle Visibility</p>
              {table.getAllLeafColumns().map((column) => (
                <label
                  key={column.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{column.id}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        ref={tableContainerRef}
        className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-auto max-h-[600px] relative"
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  return (
                    <th key={header.id} className="px-10 py-3 font-semibold text-slate-700 select-none">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1.5 ${
                            isSortable ? 'cursor-pointer hover:text-blue-600' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (
                            <span>
                              {header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="text-center p-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-gray-300" />
                    <p className="font-medium">No records found.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                key={row.id}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b border-slate-200 hover:bg-blue-100/70 transition-colors flex items-center bg-white"
                >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 text-gray-800 flex-1 truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm text-sm">
        <div className="text-gray-600">
          Showing <span className="font-medium text-gray-900">{rows.length}</span> of{' '}
          <span className="font-medium text-gray-900">{data.length.toLocaleString()}</span> rows
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[20, 50, 100, 500].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-700 font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}