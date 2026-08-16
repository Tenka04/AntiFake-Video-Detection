import { FileVideo, Trash2, Video } from 'lucide-react';

interface VideoPreviewProps {
  file?: File;
  url?: string;
  onRemove: () => void;
}

export function VideoPreview({ file, url, onRemove }: VideoPreviewProps) {
  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Video Thumbnail Placeholder */}
        <div className="w-full md:w-48 h-32 bg-black/50 rounded-xl border border-white/5 flex items-center justify-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-50"></div>
          <Video className="w-10 h-10 text-gray-500 relative z-10" />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-medium z-10">
            00:00
          </div>
        </div>
        
        {/* File Details */}
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <FileVideo className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-white font-medium truncate max-w-xs md:max-w-md">
                  {file ? file.name : url?.split('/').pop() || 'Video URL'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {file ? formatSize(file.size) : 'External Source'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onRemove}
              className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Remove video"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button 
              onClick={onRemove}
              className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            >
              Change Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
