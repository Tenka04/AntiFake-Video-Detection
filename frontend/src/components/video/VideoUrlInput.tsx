import { Link, Video } from 'lucide-react';
import { useState } from 'react';

interface VideoUrlInputProps {
  onSubmit: (url: string) => void;
}

export function VideoUrlInput({ onSubmit }: VideoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a video URL');
      return;
    }
    
    try {
      new URL(url);
      setError('');
      onSubmit(url);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  return (
    <div className="w-full bg-white/70 dark:bg-surface/30 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-4 mb-6 text-slate-700 dark:text-gray-300">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-surface border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-xs">
          <Link className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Paste Video URL</h3>
          <p className="text-sm text-slate-500 dark:text-gray-500">Provide a direct link to a video file or YouTube URL</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500">
            <Video className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full bg-slate-100/70 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
        
        {error && <p className="text-danger text-sm">{error}</p>}
        
        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer"
        >
          Load Video
        </button>
      </form>
    </div>
  );
}
