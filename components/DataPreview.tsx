import React from 'react';
import { DataRow } from '../types';

interface DataPreviewProps {
  data: DataRow[];
  headers: string[];
  title: string;
  badge?: string;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, headers, title, badge }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 border rounded-lg bg-gray-50 p-8">
        <p>No data to display</p>
      </div>
    );
  }

  // If headers prop is empty or headers changed in data, re-derive from first row
  const displayHeaders = headers.length > 0 ? headers : Object.keys(data[0]);

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          {title}
          {badge && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>}
        </h3>
        <span className="text-xs text-gray-500">{data.length} rows</span>
      </div>
      
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {displayHeaders.map((header) => (
                <th key={header} className="px-4 py-3 font-medium text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {displayHeaders.map((header) => (
                  <td key={`${idx}-${header}`} className="px-4 py-2.5 text-gray-600">
                    {row[header] !== null && row[header] !== undefined 
                      ? String(row[header]) 
                      : <span className="text-gray-300 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreview;
