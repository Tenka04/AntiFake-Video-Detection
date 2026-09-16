import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';

export function DashboardPage() {
  const [stats, setStats] = useState({
    analyzed: '--',
    aiDetected: '--',
    authentic: '--',
    pending: '--'
  });

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const statCards = [
    { label: 'Videos Analyzed', value: stats.analyzed, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'AI Videos Detected', value: stats.aiDetected, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Authentic Videos', value: stats.authentic, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending Reviews', value: stats.pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Video Detection Dashboard</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Overview of your video analysis activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white/70 dark:bg-surface/40 backdrop-blur-md border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 flex flex-col hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-slate-500 dark:text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/60 dark:bg-surface/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 backdrop-blur-xs h-96 flex flex-col shadow-xs">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-black/40 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
            <Clock className="w-8 h-8 text-slate-400 dark:text-gray-600" />
          </div>
          <p className="text-slate-600 dark:text-gray-400 font-medium">No recent activity</p>
          <p className="text-sm text-slate-400 dark:text-gray-600 mt-1">Videos you analyze will appear here.</p>
        </div>
      </div>
    </div>
  );
}
