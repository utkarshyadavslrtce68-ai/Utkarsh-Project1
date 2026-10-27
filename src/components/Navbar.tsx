import React from 'react';
import { PenTool, LayoutGrid, CheckCircle2, BookOpen, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, theme, setTheme }) => {
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('lexicheck_theme', next);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b backdrop-blur-md bg-[var(--bg-card)] border-[var(--border-subtle)]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('editor')}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
          <PenTool className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            LexiCheck NLP
          </span>
          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            Web App
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'editor'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Editor & Checker
        </button>

        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'visualizer'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          NLP Algorithm Studio
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'benchmark'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Benchmarks
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'theory'
              ? 'bg-[var(--accent-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Theory & Viva
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
