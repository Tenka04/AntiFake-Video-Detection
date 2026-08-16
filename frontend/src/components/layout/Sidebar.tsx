import { Activity, Clock, LayoutDashboard, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Analyze Video', path: '/analyze', icon: Activity },
  { name: 'History', path: '/history', icon: Clock },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-surface/50 border-r border-white/5 hidden md:flex flex-col backdrop-blur-xl">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-lg tracking-tight gradient-text">Video Detect</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "text-white bg-white/10" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-colors", 
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                )} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h4 className="font-medium text-sm text-white mb-1 relative z-10">Pro Plan</h4>
          <p className="text-xs text-gray-400 mb-3 relative z-10">14/100 videos analyzed</p>
          <div className="w-full bg-black/40 rounded-full h-1.5 mb-3 relative z-10">
            <div className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full" style={{ width: '14%' }}></div>
          </div>
          <button className="w-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors relative z-10">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
