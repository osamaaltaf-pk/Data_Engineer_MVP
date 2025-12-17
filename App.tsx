import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Download, RefreshCcw, Wand2, Trash2, Undo2, LayoutDashboard, Table as TableIcon, Search } from 'lucide-react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import DataProfileDashboard from './components/DataProfileDashboard';
import QuickToolbar from './components/QuickToolbar';
import FindReplaceModal from './components/FindReplaceModal';
import { DataSet, DataRow, AppState, DataProfile } from './types';
import { cleanDataWithGemini, suggestCleaningRules, generateProfileSummary } from './services/geminiService';
import { exportToCSV, downloadFile, generateDataProfile, trimWhitespace, removeDuplicates, convertToLowerCase, applyFindReplace } from './services/utils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Data State
  const [currentData, setCurrentData] = useState<DataSet | null>(null);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // History State for Undo
  const [history, setHistory] = useState<DataSet[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'profile' | 'data'>('profile');
  const [instruction, setInstruction] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);

  // Scroll ref for chat interface
  const inputRef = useRef<HTMLInputElement>(null);

  // Update profile whenever data changes
  useEffect(() => {
    if (currentData) {
      setProfileLoading(true);
      // Brief timeout to allow UI to render before heavy calculation if dataset is large
      setTimeout(async () => {
         const profile = generateDataProfile(currentData.data);
         setDataProfile(profile);
         // Only generate AI summary if it's the first load or explicitly requested to save tokens/latency
         if (!aiSummary) {
             const summary = await generateProfileSummary(profile);
             setAiSummary(summary);
         }
         setProfileLoading(false);
      }, 100);
    }
  }, [currentData]);

  // Handle file load
  const handleDataLoaded = async (dataset: DataSet) => {
    setCurrentData(dataset);
    setHistory([dataset]); // Initialize history
    setAppState(AppState.REVIEW);
    setAiSummary(null); // Reset summary so it regenerates
    
    // Generate AI suggestions
    try {
      const suggestedRules = await suggestCleaningRules(dataset.data);
      setSuggestions(suggestedRules);
    } catch (e) {
      console.warn("Failed to get suggestions");
    }
  };

  // Generic function to apply a transformation and save to history
  const applyTransformation = (newData: DataRow[], description: string) => {
    if (!currentData) return;

    const newHeaders = newData.length > 0 ? Object.keys(newData[0]) : currentData.headers;
    const newDataset: DataSet = {
      fileName: currentData.fileName, // Keep original name
      data: newData,
      headers: newHeaders
    };

    setHistory(prev => [...prev, newDataset]);
    setCurrentData(newDataset);
    setActiveTab('data'); // Switch to data view to see changes
    setError(null);
  };

  // Handle AI clean action
  const handleClean = async () => {
    if (!currentData || !instruction.trim()) return;

    setIsCleaning(true);
    setError(null);
    try {
      const resultData = await cleanDataWithGemini(currentData.data, instruction);
      applyTransformation(resultData, instruction);
      setInstruction('');
    } catch (err) {
      setError("Failed to process data. Please try a simpler instruction.");
    } finally {
      setIsCleaning(false);
    }
  };

  // Handle Quick Actions
  const handleQuickAction = (actionId: string) => {
    if (!currentData) return;
    
    let newData: DataRow[] = [];
    let desc = "";

    switch(actionId) {
      case 'trim':
        newData = trimWhitespace(currentData.data);
        desc = "Trim Whitespace";
        break;
      case 'dedupe':
        newData = removeDuplicates(currentData.data);
        desc = "Remove Duplicates";
        break;
      case 'lowercase':
        newData = convertToLowerCase(currentData.data);
        desc = "Convert to Lowercase";
        break;
    }
    
    if (newData.length > 0) {
      applyTransformation(newData, desc);
    }
  };

  const handleFindReplace = (column: string, find: string, replace: string, matchCase: boolean, useRegex: boolean) => {
     if (!currentData) return;
     const newData = applyFindReplace(currentData.data, column, find, replace, matchCase, useRegex);
     applyTransformation(newData, `Find '${find}' & Replace`);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentData(previousState);
  };

  const handleReset = () => {
    setCurrentData(null);
    setDataProfile(null);
    setHistory([]);
    setAppState(AppState.IDLE);
    setSuggestions([]);
    setInstruction('');
  };

  const handleDownload = () => {
    if (!currentData) return;
    const csvContent = exportToCSV(currentData.data);
    downloadFile(csvContent, `clean_${currentData.fileName.replace('.json', '.csv')}`, 'text/csv');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <main className="flex-1 overflow-hidden flex flex-col relative">
        {appState === AppState.IDLE && (
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                   <Sparkles size={16} /> New: AI Data Profiling
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  Tame your <span className="text-blue-600">messy data</span> in seconds.
                </h2>
                <p className="text-lg text-gray-600">
                  Upload CSVs or JSONs and let the AI agent clean, structure, and analyze them automatically.
                </p>
              </div>
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        )}

        {appState === AppState.REVIEW && currentData && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0 z-20">
               <div className="flex items-center gap-4">
                  <button 
                    onClick={handleReset}
                    className="text-gray-500 hover:text-red-600 flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    <Trash2 size={16} /> Clear Project
                  </button>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 max-w-[200px] truncate">{currentData.fileName}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{currentData.data.length} rows</span>
                  </div>
               </div>
               
               <div className="flex gap-3">
                 <button 
                   onClick={handleUndo}
                   disabled={history.length <= 1}
                   className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                     ${history.length > 1 
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' 
                        : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'}`}
                 >
                   <Undo2 size={16} /> Undo
                 </button>
                 <button 
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                 >
                   <Download size={16} /> Export
                 </button>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 custom-scrollbar">
              <div className="max-w-6xl mx-auto flex flex-col gap-6">
                
                {/* View Toggles */}
                <div className="flex justify-between items-end border-b border-gray-200 pb-1">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-colors relative
                        ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                      {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
                    </button>
                    <button 
                      onClick={() => setActiveTab('data')}
                      className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-colors relative
                        ${activeTab === 'data' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <TableIcon size={18} />
                      Data View
                      {activeTab === 'data' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowFindReplace(true)}
                    className="flex items-center gap-2 mb-2 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Search size={14} /> Find & Replace
                  </button>
                </div>

                {/* Dashboard View */}
                <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
                   <DataProfileDashboard 
                      profile={dataProfile} 
                      aiSummary={aiSummary} 
                      loading={profileLoading} 
                   />
                </div>

                {/* Data Grid View */}
                <div className={`${activeTab === 'data' ? 'flex' : 'hidden'} flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden`}>
                   <DataPreview 
                      title="Current Dataset" 
                      data={currentData.data} 
                      headers={currentData.headers} 
                   />
                </div>

              </div>
            </div>

            {/* Bottom Interaction Bar */}
            <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
              <div className="max-w-4xl mx-auto flex flex-col gap-3">
                
                {/* Quick Toolbar */}
                <QuickToolbar onAction={handleQuickAction} disabled={isCleaning} />

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setInstruction(s)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100 hover:bg-purple-100 whitespace-nowrap transition-colors"
                      >
                        <Wand2 size={12} /> {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* AI Input */}
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Sparkles className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm shadow-sm transition-all"
                      placeholder="Ask the AI agent to clean, filter, or transform..."
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleClean()}
                      disabled={isCleaning}
                    />
                  </div>
                  <button
                    onClick={handleClean}
                    disabled={isCleaning || !instruction}
                    className={`flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all
                      ${isCleaning || !instruction 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isCleaning ? (
                      <RefreshCcw className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        Run <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                
                {error && (
                  <p className="text-xs text-red-500 ml-1">{error}</p>
                )}
              </div>
            </div>
            
            {/* Find Replace Modal */}
            {currentData && (
              <FindReplaceModal 
                isOpen={showFindReplace}
                onClose={() => setShowFindReplace(false)}
                onApply={handleFindReplace}
                headers={currentData.headers}
                data={currentData.data}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
