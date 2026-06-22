import React, { useState } from 'react';
import { Button } from './ui';

export function DataTable({ data, columns, onEdit, onDelete, onReorder }) {
  const [search, setSearch] = useState('');

  const filtered = data.filter((row) =>
    columns.some((col) => {
      const val = col.accessor(row);
      return String(val).toLowerCase().includes(search.toLowerCase());
    })
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">{col.label}</th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
            {filtered.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-900">
                    {col.render ? col.render(row) : col.accessor(row)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onReorder && (
                      <div className="flex flex-col gap-0.5 mr-1">
                        <button
                          onClick={() => onReorder(index, -1)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button
                          onClick={() => onReorder(index, 1)}
                          disabled={index === filtered.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                    )}
                    <button onClick={() => onEdit(row)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Edit
                    </button>
                    <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-700 font-medium text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
