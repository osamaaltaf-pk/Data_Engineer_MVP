import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseCSV } from '../services/utils';
import { DataSet } from '../types';

interface FileUploadProps {
  onDataLoaded: (dataset: DataSet) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      let parsedData: any[] = [];
      
      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        parsedData = parseCSV(text);
      } else {
        // Fallback or assume simple CSV/Text
        parsedData = parseCSV(text);
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error("File appears empty or invalid format.");
      }

      // Extract headers from the first row keys
      const headers = Object.keys(parsedData[0]);

      onDataLoaded({
        fileName: file.name,
        data: parsedData,
        headers
      });

    } catch (err) {
      setError("Failed to parse file. Please ensure it is a valid JSON or CSV.");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer bg-white
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input 
        id="file-input" 
        type="file" 
        className="hidden" 
        accept=".csv,.json,.txt"
        onChange={onFileChange}
      />
      
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload your raw data</h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">
        Drag and drop your CSV or JSON file here, or click to browse.
      </p>

      <div className="flex gap-3 text-sm text-gray-400">
        <span className="flex items-center gap-1"><FileText size={14} /> CSV</span>
        <span className="flex items-center gap-1"><FileText size={14} /> JSON</span>
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
