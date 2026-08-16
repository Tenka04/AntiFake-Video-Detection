import { Bell, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <header className="h-16 border-b border-white/5 bg-surface/30 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center md:hidden">
        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">DeepCheck</span>
        </Link>
      </div>
      
      {/* Search - Desktop */}
      <div className="hidden md:flex items-center flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search videos..." 
            className="w-full bg-black/20 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-surface"></span>
        </button>
        <div className="h-8 w-px bg-white/10"></div>
        <button className="flex items-center gap-2 hover:bg-white/5 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 hidden sm:block">Admin</span>
        </button>
      </div>
    </header>
  );
}
