import { FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAnalysisHistory } from '../services/api';
import type { VideoHistoryItem } from '../services/api';

export function HistoryPage() {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAnalysisHistory().then((data) => {
      setHistory(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analysis History</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-1">Review previously analyzed videos and their results.</p>
      </div>

      <div className="bg-white/60 dark:bg-surface/30 border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-xs min-h-[500px] flex flex-col shadow-xs">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-sm font-medium text-slate-500 dark:text-gray-400 bg-slate-100/70 dark:bg-black/20">
                  <th className="py-4 px-6">Video Name</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Result</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{item.filename}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-gray-400 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 capitalize">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-gray-300">
                      {item.result || '--'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-sm text-primary hover:text-primary/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-black/40 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5">
              <FolderOpen className="w-10 h-10 text-slate-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No analyses yet</h3>
            <p className="text-slate-500 dark:text-gray-500 max-w-sm">
              Your analyzed videos will appear here. Head over to the Analyze page to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
