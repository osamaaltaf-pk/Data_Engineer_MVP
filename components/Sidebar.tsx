import React from 'react';
import { Database, LayoutDashboard, FileSpreadsheet, History, Settings, Upload, CheckCircle2, Search, Download, GitMerge } from 'lucide-react';
import { AppState } from '../types';

interface SidebarProps {
  appState: AppState;
  fileName?: string;
  rowCount?: number;
  onNavigate: (view: string) => void;
  onExportClick: () => void;
  onMergeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ appState, fileName, rowCount, onNavigate, onExportClick, onMergeClick }) => {
  const isReview = appState === AppState.REVIEW;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-blue-600">
          <Database size={20} />
          <span className="font-bold text-gray-900 tracking-tight">CleanSlate</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Workspace</div>
        
        <button 
           onClick={() => onNavigate('import')}
           className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
             ${appState === AppState.IDLE ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Upload size={18} />
          Import Data
        </button>

        <button 
           disabled={!isReview}
           onClick={() => onNavigate('review')}
           className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
             ${isReview ? 'bg-blue-50 text-blue-700' : 'text-gray-400 cursor-not-allowed'}`}
        >
          <FileSpreadsheet size={18} />
          Data Editor
        </button>
        
        <button 
           disabled={!isReview}
           onClick={onMergeClick}
           className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
             ${isReview ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}`}
        >
          <GitMerge size={18} />
          Merge Data
        </button>
        
        <button 
           disabled={!isReview}
           onClick={onExportClick}
           className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
             ${isReview ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}`}
        >
          <Download size={18} />
          Export Data
        </button>
      </div>

      {/* Active File Stats */}
      {fileName && (
        <div className="px-4 py-4 mx-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
           <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-semibold text-gray-500 uppercase">Active Session</span>
           </div>
           <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>{fileName}</p>
           <p className="text-xs text-gray-500 mt-0.5">{rowCount?.toLocaleString()} rows</p>
        </div>
      )}

      {/* Feature List (Requested) */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Capabilities</div>
        <ul className="space-y-2.5 px-2">
          <li className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2 size={14} className="text-green-500" /> AI Natural Cleaning
          </li>
          <li className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2 size={14} className="text-green-500" /> Smart Profiling
          </li>
          <li className="flex items-center gap-2 text-xs text-gray-600">
            <Search size={14} className="text-blue-500" /> Bulk Find & Replace
          </li>
           <li className="flex items-center gap-2 text-xs text-gray-600">
            <GitMerge size={14} className="text-purple-500" /> Smart Merge
          </li>
        </ul>
      </div>

      {/* User / Settings */}
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            US
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">User Workspace</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <Settings size={16} className="text-gray-400" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;