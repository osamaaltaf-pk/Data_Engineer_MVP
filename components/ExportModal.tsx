import React, { useState } from 'react';
import { X, Download, FileJson, FileText, Check } from 'lucide-react';
import { ExportFormat } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, filename: string) => void;
  defaultFilename: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, defaultFilename }) => {
  const [filename, setFilename] = useState(defaultFilename.replace(/\.(csv|json)$/i, ''));
  const [format, setFormat] = useState<ExportFormat>('csv');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Download size={20} className="text-blue-600" />
            Export Data
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filename</label>
            <input 
              type="text" 
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('csv')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                  ${format === 'csv' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                <FileText size={24} className="mb-2" />
                <span className="text-sm font-medium">CSV</span>
                {format === 'csv' && <div className="absolute top-2 right-2 text-blue-600"><Check size={16} /></div>}
              </button>

              <button 
                onClick={() => setFormat('json')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                  ${format === 'json' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                <FileJson size={24} className="mb-2" />
                <span className="text-sm font-medium">JSON</span>
                {format === 'json' && <div className="absolute top-2 right-2 text-blue-600"><Check size={16} /></div>}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onExport(format, filename); onClose(); }}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Export File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;