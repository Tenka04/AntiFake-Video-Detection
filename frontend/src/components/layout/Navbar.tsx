import { Bell, Moon, Search, Sun, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-surface/30 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-colors">
      <div className="flex items-center md:hidden">
        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">DeepCheck</span>
        </Link>
      </div>
      
      {/* Search - Desktop */}
      <div className="hidden md:flex items-center flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400" />
          <input 
            type="text" 
            placeholder="Search videos..." 
            className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Light / Dark Theme Button */}
        <button 
          onClick={toggleTheme}
          title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-all shadow-xs cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              <span className="font-medium text-amber-400">Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-in spin-in-90 duration-300" />
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Dark Theme</span>
            </>
          )}
        </button>

        <button className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-surface"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
        <button className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center border border-slate-300 dark:border-white/10">
            <User className="w-4 h-4 text-slate-600 dark:text-gray-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-gray-300 hidden sm:block">Admin</span>
        </button>
      </div>
    </header>
  );
}
