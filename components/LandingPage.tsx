import React from 'react';
import { Database, Sparkles, BarChart3, ArrowRight, GitMerge, FileJson, Wand2 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-y-auto">
      {/* Navigation */}
      <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg">
             <Database className="w-5 h-5 text-white" />
           </div>
           <span className="text-xl font-bold text-gray-900 tracking-tight">CleanSlate AI</span>
        </div>
        <div className="flex gap-4">
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 hidden md:block">Features</button>
          <button 
            onClick={onGetStarted}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Launch Workspace
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={12} />
          Powered by Gemini 2.5 Flash
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Data cleaning, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">reimagined with AI</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Automate your data hygiene. Upload messy CSVs or JSONs and let our AI agent detect types, fix errors, and merge datasets instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <button 
            onClick={onGetStarted}
            className="group bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-8 py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Start Cleaning for Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 md:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to ship clean data</h2>
             <p className="text-gray-500 max-w-2xl mx-auto">From smart profiling to complex joins, we handle the boring parts of data engineering.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Profiling</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Detect missing values, outliers, and mixed types automatically upon upload.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Wand2 className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Natural Language</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Use commands like "Normalize dates" or "Remove rows without emails".
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <GitMerge className="text-purple-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Merge</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI suggests the best join keys (Inner, Left, Outer) to combine multiple files.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <FileJson className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Metadata Export</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Download as CSV or JSON with a full audit log of every transformation applied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 text-center text-gray-400 text-sm bg-white mt-auto">
        <p>© 2025 CleanSlate AI. Built for the modern data stack.</p>
      </footer>
    </div>
  );
};

export default LandingPage;