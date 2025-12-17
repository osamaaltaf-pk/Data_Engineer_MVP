import React from 'react';
import { Database, Zap, Github } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Database className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          CleanSlate
        </h1>
        <span className="text-xs font-medium text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded ml-2">MVP</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
          <Zap size={14} className="text-amber-500 fill-current" />
          <span>Powered by Gemini 2.5</span>
        </div>
        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
          <Github size={20} />
        </a>
      </div>
    </header>
  );
};

export default Header;
