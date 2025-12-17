import React from 'react';
import { Database, Sparkles, Wand2, BarChart3, ShieldCheck, ArrowRight, Upload } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg">
             <Database className="w-5 h-5 text-white" />
           </div>
           <span className="text-xl font-bold text-gray-900 tracking-tight">CleanSlate AI</span>
        </div>
        <div className="flex gap-4">
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Features</button>
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Pricing</button>
          <button 
            onClick={onGetStarted}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Launch Workspace
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={12} />
          Powered by Gemini 2.5 Flash
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Data cleaning, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">reimagined with AI</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Stop spending hours fixing typos, formatting dates, and removing duplicates. 
          Upload your messy CSV or JSON and let our AI agent handle the grunt work instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <button 
            onClick={onGetStarted}
            className="group bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-8 py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Start Cleaning for Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 text-lg font-medium px-8 py-4 rounded-xl border border-gray-200 shadow-sm transition-all flex items-center justify-center gap-2">
             <Upload size={20} className="text-gray-400" />
             View Demo Data
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 md:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Profiling</h3>
              <p className="text-gray-500 leading-relaxed">
                Instantly understand your data's health. Detect missing values, outliers, and type inconsistencies automatically upon upload.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Wand2 className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Natural Language Cleaning</h3>
              <p className="text-gray-500 leading-relaxed">
                Just ask. "Remove rows where email is missing" or "Standardize dates to YYYY-MM-DD". No complex formulas required.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Export</h3>
              <p className="text-gray-500 leading-relaxed">
                Export your clean data to CSV or JSON. We preserve your original file integrity while giving you a polished output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 text-center text-gray-400 text-sm bg-white">
        <p>© 2025 CleanSlate AI. Built for the modern data stack.</p>
      </footer>
    </div>
  );
};

export default LandingPage;