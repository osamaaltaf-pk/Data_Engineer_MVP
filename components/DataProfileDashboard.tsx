import React from 'react';
import { DataProfile } from '../types';
import { Activity, ShieldCheck, AlertTriangle, FileBarChart } from 'lucide-react';

interface Props {
  profile: DataProfile | null;
  aiSummary: string | null;
  loading: boolean;
}

const DataProfileDashboard: React.FC<Props> = ({ profile, aiSummary, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-blue-600" size={20} />
        <h3 className="font-semibold text-gray-800">Data Health Profile</h3>
      </div>

      {/* AI Summary Section */}
      {aiSummary && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-800 flex gap-3 items-start">
           <div className="mt-0.5"><FileBarChart size={16} /></div>
           <div>
             <span className="font-semibold block mb-1">AI Insight</span>
             {aiSummary}
           </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Completeness</p>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-2xl font-bold ${profile.completenessScore > 90 ? 'text-green-600' : profile.completenessScore > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {profile.completenessScore}%
             </span>
             {profile.completenessScore > 90 ? <ShieldCheck size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-yellow-500" />}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Total Rows</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{profile.totalRows.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Columns</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{profile.totalColumns}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Missing Values</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
             {profile.columns.reduce((acc, col) => acc + col.missingCount, 0)}
          </p>
        </div>
      </div>

      {/* Column Breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
           <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
             <tr>
               <th className="px-3 py-2">Column</th>
               <th className="px-3 py-2">Type</th>
               <th className="px-3 py-2">Missing</th>
               <th className="px-3 py-2">Unique</th>
               <th className="px-3 py-2 w-1/3">Health</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {profile.columns.map((col) => {
               const missingPct = (col.missingCount / profile.totalRows) * 100;
               return (
                 <tr key={col.name} className="hover:bg-gray-50">
                   <td className="px-3 py-2 font-medium text-gray-700">{col.name}</td>
                   <td className="px-3 py-2 text-gray-500 font-mono text-xs">{col.type}</td>
                   <td className="px-3 py-2 text-gray-500">{col.missingCount} <span className="text-xs text-gray-400">({Math.round(missingPct)}%)</span></td>
                   <td className="px-3 py-2 text-gray-500">{col.uniqueCount}</td>
                   <td className="px-3 py-2">
                     <div className="w-full bg-gray-200 rounded-full h-1.5">
                       <div 
                         className={`h-1.5 rounded-full ${missingPct > 50 ? 'bg-red-500' : missingPct > 0 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                         style={{ width: `${100 - missingPct}%` }}
                       ></div>
                     </div>
                   </td>
                 </tr>
               );
             })}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataProfileDashboard;
