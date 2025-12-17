import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, RefreshCcw, Wand2, Trash2, Undo2, LayoutDashboard, Table as TableIcon, Search } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import DataProfileDashboard from './components/DataProfileDashboard';
import QuickToolbar from './components/QuickToolbar';
import FindReplaceModal from './components/FindReplaceModal';
import ExportModal from './components/ExportModal';
import { DataSet, DataRow, AppState, DataProfile, ExportFormat } from './types';
import { cleanDataWithGemini, suggestCleaningRules, generateProfileSummary } from './services/geminiService';
import { exportToCSV, exportToJSON, downloadFile, generateDataProfile, trimWhitespace, removeDuplicates, convertToLowerCase, applyFindReplace } from './services/utils';

const App: React.FC = () => {
  // Navigation State
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  
  // Data State
  const [currentData, setCurrentData] = useState<DataSet | null>(null);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // History State
  const [history, setHistory] = useState<DataSet[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'profile' | 'data'>('profile');
  const [instruction, setInstruction] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (currentData) {
      setProfileLoading(true);
      setTimeout(async () => {
         const profile = generateDataProfile(currentData.data);
         setDataProfile(profile);
         if (!aiSummary) {
             const summary = await generateProfileSummary(profile);
             setAiSummary(summary);
         }
         setProfileLoading(false);
      }, 100);
    }
  }, [currentData]);

  // --- Handlers ---

  const handleDataLoaded = async (dataset: DataSet) => {
    setCurrentData(dataset);
    setHistory([dataset]);
    setAppState(AppState.REVIEW);
    setAiSummary(null);
    try {
      const suggestedRules = await suggestCleaningRules(dataset.data);
      setSuggestions(suggestedRules);
    } catch (e) {
      console.warn("Failed to get suggestions");
    }
  };

  const applyTransformation = (newData: DataRow[], description: string) => {
    if (!currentData) return;
    const newHeaders = newData.length > 0 ? Object.keys(newData[0]) : currentData.headers;
    const newDataset: DataSet = {
      fileName: currentData.fileName,
      data: newData,
      headers: newHeaders
    };
    setHistory(prev => [...prev, newDataset]);
    setCurrentData(newDataset);
    setActiveTab('data');
    setError(null);
  };

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

  const handleQuickAction = (actionId: string) => {
    if (!currentData) return;
    let newData: DataRow[] = [];
    let desc = "";
    switch(actionId) {
      case 'trim': newData = trimWhitespace(currentData.data); desc = "Trim Whitespace"; break;
      case 'dedupe': newData = removeDuplicates(currentData.data); desc = "Remove Duplicates"; break;
      case 'lowercase': newData = convertToLowerCase(currentData.data); desc = "Convert to Lowercase"; break;
    }
    if (newData.length > 0) applyTransformation(newData, desc);
  };

  const handleFindReplace = (column: string, find: string, replace: string, matchCase: boolean, useRegex: boolean) => {
     if (!currentData) return;
     const newData = applyFindReplace(currentData.data, column, find, replace, matchCase, useRegex);
     applyTransformation(newData, `Find '${find}' & Replace`);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
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

  const handleExport = (format: ExportFormat, filename: string) => {
    if (!currentData) return;
    
    // Ensure extension
    if (!filename.toLowerCase().endsWith(`.${format}`)) {
      filename += `.${format}`;
    }

    if (format === 'csv') {
      const csvContent = exportToCSV(currentData.data);
      downloadFile(csvContent, filename, 'text/csv');
    } else {
      const jsonContent = exportToJSON(currentData.data);
      downloadFile(jsonContent, filename, 'application/json');
    }
  };

  // --- Navigation Handlers ---
  
  const handleStartWorkspace = () => {
    setAppState(AppState.IDLE);
  };

  const handleSidebarNavigate = (view: string) => {
    if (view === 'import') {
      if (currentData) {
        if(confirm("This will clear your current workspace. Continue?")) {
           handleReset();
        }
      } else {
        setAppState(AppState.IDLE);
      }
    } else if (view === 'review' && currentData) {
      setAppState(AppState.REVIEW);
    }
  };

  // --- Render Logic ---

  if (appState === AppState.LANDING) {
    return <LandingPage onGetStarted={handleStartWorkspace} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar 
        appState={appState} 
        fileName={currentData?.fileName}
        rowCount={currentData?.data.length}
        onNavigate={handleSidebarNavigate}
        onExportClick={() => setShowExport(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Workspace: Upload State */}
        {appState === AppState.IDLE && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              <div className="mb-8">
                 <h2 className="text-3xl font-bold text-gray-900">Import Data</h2>
                 <p className="text-gray-500 mt-2">Upload a CSV or JSON file to begin cleaning.</p>
              </div>
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        )}

        {/* Workspace: Review State */}
        {appState === AppState.REVIEW && currentData && (
          <div className="flex flex-col h-full">
            
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
               <div className="flex items-center gap-4">
                  <h1 className="text-lg font-bold text-gray-800">{currentData.fileName}</h1>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md border border-gray-200">Read Only Mode Off</span>
               </div>
               
               <div className="flex items-center gap-3">
                 <button 
                   onClick={handleUndo}
                   disabled={history.length <= 1}
                   className={`p-2 rounded-lg transition-colors ${history.length > 1 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                   title="Undo last action"
                 >
                   <Undo2 size={20} />
                 </button>
                 <div className="h-6 w-px bg-gray-200 mx-1"></div>
                 <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                 >
                    <Trash2 size={16} />
                    Clear
                 </button>
               </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Tabs & Tools */}
                <div className="flex justify-between items-end">
                   <div className="flex bg-gray-100/80 p-1 rounded-xl">
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <div className="flex items-center gap-2"><LayoutDashboard size={16}/> Overview</div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('data')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'data' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <div className="flex items-center gap-2"><TableIcon size={16}/> Table View</div>
                      </button>
                   </div>

                   <button 
                    onClick={() => setShowFindReplace(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                   >
                    <Search size={16} /> Find & Replace
                   </button>
                </div>

                {/* Dashboard View */}
                <div className={activeTab === 'profile' ? 'block animate-in fade-in slide-in-from-bottom-2' : 'hidden'}>
                   <DataProfileDashboard 
                      profile={dataProfile} 
                      aiSummary={aiSummary} 
                      loading={profileLoading} 
                   />
                </div>

                {/* Data View */}
                <div className={`${activeTab === 'data' ? 'flex' : 'hidden'} flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2`}>
                   <DataPreview 
                      title="Dataset Preview" 
                      data={currentData.data} 
                      headers={currentData.headers} 
                   />
                </div>
              </div>
            </div>

            {/* AI Command Bar (Fixed Bottom) */}
            <div className="bg-white border-t border-gray-200 p-4 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
              <div className="max-w-4xl mx-auto flex flex-col gap-3">
                <QuickToolbar onAction={handleQuickAction} disabled={isCleaning} />
                
                {/* AI Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Sparkles className={`h-5 w-5 ${isCleaning ? 'text-blue-400 animate-pulse' : 'text-indigo-500'}`} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-11 pr-20 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    placeholder="Ask AI to clean, format, or filter your data..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleClean()}
                    disabled={isCleaning}
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                      onClick={handleClean}
                      disabled={isCleaning || !instruction}
                      className={`p-2 rounded-xl transition-all ${isCleaning || !instruction ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'}`}
                    >
                      {isCleaning ? <RefreshCcw size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    </button>
                  </div>
                </div>
                
                {suggestions.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setInstruction(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:border-blue-300 hover:text-blue-600 whitespace-nowrap transition-all"
                      >
                        <Wand2 size={12} /> {s}
                      </button>
                    ))}
                  </div>
                )}
                
                {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      {currentData && (
        <>
          <FindReplaceModal 
            isOpen={showFindReplace}
            onClose={() => setShowFindReplace(false)}
            onApply={handleFindReplace}
            headers={currentData.headers}
            data={currentData.data}
          />
          <ExportModal 
            isOpen={showExport}
            onClose={() => setShowExport(false)}
            onExport={handleExport}
            defaultFilename={currentData.fileName}
          />
        </>
      )}
    </div>
  );
};

export default App;