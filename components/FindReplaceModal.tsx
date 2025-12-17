import React, { useState, useEffect } from 'react';
import { X, Search, Replace, AlertCircle } from 'lucide-react';
import { countMatches } from '../services/utils';
import { DataRow } from '../types';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (column: string, find: string, replace: string, matchCase: boolean, useRegex: boolean) => void;
  headers: string[];
  data: DataRow[];
}

const FindReplaceModal: React.FC<FindReplaceModalProps> = ({ isOpen, onClose, onApply, headers, data }) => {
  const [column, setColumn] = useState('__all__');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const count = countMatches(data, column, find, matchCase, useRegex);
      setMatchCount(count);
    }
  }, [find, column, matchCase, useRegex, data, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(column, find, replace, matchCase, useRegex);
    onClose();
    // Reset fields
    setFind('');
    setReplace('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Search size={18} className="text-blue-600" />
            Find & Replace
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Column Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Search In</label>
            <select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="__all__">All Columns</option>
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Find Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Find</label>
            <div className="relative">
              <input
                type="text"
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder="Value to find..."
                className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Replace Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Replace With</label>
            <div className="relative">
              <input
                type="text"
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replacement value..."
                className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Replace size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4 pt-1">
             <label className="flex items-center gap-2 cursor-pointer select-none">
               <input 
                 type="checkbox" 
                 checked={matchCase}
                 onChange={(e) => setMatchCase(e.target.checked)}
                 className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
               />
               <span className="text-sm text-gray-600">Match Case</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer select-none">
               <input 
                 type="checkbox" 
                 checked={useRegex}
                 onChange={(e) => setUseRegex(e.target.checked)}
                 className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
               />
               <span className="text-sm text-gray-600">Regex</span>
             </label>
          </div>

          {/* Match Status */}
          <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${matchCount > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <AlertCircle size={16} />
            {find ? (
               <span>Found <strong>{matchCount}</strong> cell{matchCount !== 1 ? 's' : ''} matching criteria.</span>
            ) : (
               <span>Enter text to search.</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!find || matchCount === 0}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Replace All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindReplaceModal;
