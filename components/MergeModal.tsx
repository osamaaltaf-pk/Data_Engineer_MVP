import React, { useState } from 'react';
import { X, GitMerge, Upload, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DataRow, DataSet, MergeStrategy } from '../types';
import { parseCSV } from '../services/utils';
import { suggestMergeStrategy } from '../services/geminiService';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: DataSet;
  onMerge: (mergedData: DataRow[], log: string) => void;
}

const MergeModal: React.FC<MergeModalProps> = ({ isOpen, onClose, currentData, onMerge }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [secondaryData, setSecondaryData] = useState<DataSet | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategy, setStrategy] = useState<MergeStrategy>({
    joinType: 'left',
    primaryKey: '',
    secondaryKey: '',
    confidence: 0,
    reasoning: ''
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const text = await file.text();
        let parsed: DataRow[] = [];
        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(text);
        } else {
          parsed = parseCSV(text);
        }
        
        if (parsed.length > 0) {
          const ds: DataSet = {
            fileName: file.name,
            data: parsed,
            headers: Object.keys(parsed[0])
          };
          setSecondaryData(ds);
          analyzeMerge(ds);
        }
      } catch (err) {
        setError("Failed to parse file.");
      }
    }
  };

  const analyzeMerge = async (secondary: DataSet) => {
    setStep(2);
    setIsAnalyzing(true);
    try {
      const suggestion = await suggestMergeStrategy(
        currentData.headers,
        currentData.data,
        secondary.headers,
        secondary.data
      );
      setStrategy(suggestion);
      setIsAnalyzing(false);
    } catch (e) {
      setIsAnalyzing(false);
      setError("AI Analysis failed. Please configure manually.");
    }
  };

  const executeMerge = () => {
    // We pass the strategy back to parent to execute via utils
    // Or strictly, we usually just pass the config. 
    // But for this modal, we'll let parent handle the heavy lifting? 
    // No, better to import joinDatasets here or in parent. 
    // Let's pass the config to parent handler to keep logic centralized or do it here.
    // Parent `onMerge` expects data. Let's do it in App.tsx or use the utils here.
    // We'll defer execution to App.tsx to keep this component UI focused, 
    // but we need to pass the secondary data too.
    // Actually, `onMerge` signature in props: `(mergedData: DataRow[])`. 
    // So we must compute it.
    
    // We need to import joinDatasets dynamically or pass it. 
    // To avoid circular dependency or huge imports, assuming joinDatasets is in utils.
    // Ideally we import `joinDatasets` here.
    import('../services/utils').then(({ joinDatasets }) => {
        if (!secondaryData) return;
        const result = joinDatasets(currentData.data, secondaryData.data, strategy);
        const log = `Merged with ${secondaryData.fileName} using ${strategy.joinType} join on ${strategy.primaryKey} = ${strategy.secondaryKey}`;
        onMerge(result, log);
        onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <GitMerge size={20} className="text-purple-600" />
            Smart Merge Assistant
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-purple-600" size={32} />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Secondary Dataset</h4>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Select a CSV or JSON file to merge with <strong>{currentData.fileName}</strong>.
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer transition-colors shadow-lg shadow-purple-200">
                <Upload size={18} />
                <span>Select File</span>
                <input type="file" className="hidden" accept=".csv,.json" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {/* Step 2: Analysis & Config */}
          {step === 2 && (
            <div>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
                  <p className="text-gray-600 font-medium">Analyzing schemas & finding common keys...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* AI Insight */}
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex gap-3">
                    <div className="bg-white p-2 rounded-full h-fit shadow-sm">
                        <GitMerge size={16} className="text-purple-600" />
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-purple-900">AI Recommendation</h5>
                        <p className="text-sm text-purple-800 mt-1">{strategy.reasoning}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Primary Key ({currentData.fileName})</label>
                        <select 
                          className="w-full p-2 border rounded-lg text-sm"
                          value={strategy.primaryKey}
                          onChange={(e) => setStrategy({...strategy, primaryKey: e.target.value})}
                        >
                           {currentData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Secondary Key ({secondaryData?.fileName})</label>
                        <select 
                          className="w-full p-2 border rounded-lg text-sm"
                          value={strategy.secondaryKey}
                          onChange={(e) => setStrategy({...strategy, secondaryKey: e.target.value})}
                        >
                           {secondaryData?.headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Join Type</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['inner', 'left', 'outer'].map(type => (
                            <button
                              key={type}
                              onClick={() => setStrategy({...strategy, joinType: type as any})}
                              className={`p-3 border rounded-lg text-sm font-medium capitalize transition-all
                                ${strategy.joinType === type 
                                    ? 'border-purple-600 bg-purple-50 text-purple-700' 
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                {type} Join
                            </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex justify-end pt-4">
                     <button 
                        onClick={executeMerge}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-purple-200 transition-all"
                     >
                        Merge Datasets <ArrowRight size={18} />
                     </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergeModal;