import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, Github } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiStatus }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-xl shadow-glow-primary">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AutoEncoder Lab
            </span>
            <span className="ml-1.5 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-light font-semibold border border-primary/30">
              v1.0
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'landing'
                ? 'bg-white/10 text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'workspace'
                ? 'bg-white/10 text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Lab Workspace
          </button>
        </nav>

        {/* API Health Connection Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                apiStatus === 'connected' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                apiStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-slate-400">
              {apiStatus === 'connected' ? 'API Online' : 'API Offline'}
            </span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

      </div>
    </header>
  );
}
