import { UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../lib/utils';

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function VideoDropzone({ onFileSelect }: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert("Please upload a valid video file.");
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300",
        isDragging 
          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]" 
          : "border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-surface/30 hover:bg-slate-100/80 dark:hover:bg-surface/50 hover:border-primary/50"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload video file"
      />
      
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-surface border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <UploadCloud className={cn("w-8 h-8", isDragging ? "text-primary" : "text-slate-400 dark:text-gray-400")} />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {isDragging ? "Drop your video here" : "Drag & Drop your video here"}
      </h3>
      <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">
        or click to browse from your device
      </p>
      
      <div className="flex gap-2 text-xs font-medium text-slate-500 dark:text-gray-500">
        <span className="px-2 py-1 rounded bg-slate-200/70 dark:bg-black/30 border border-slate-300 dark:border-white/5">MP4</span>
        <span className="px-2 py-1 rounded bg-slate-200/70 dark:bg-black/30 border border-slate-300 dark:border-white/5">MOV</span>
        <span className="px-2 py-1 rounded bg-slate-200/70 dark:bg-black/30 border border-slate-300 dark:border-white/5">AVI</span>
        <span className="px-2 py-1 rounded bg-slate-200/70 dark:bg-black/30 border border-slate-300 dark:border-white/5">WEBM</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-gray-500 mt-4">Maximum file size: 500 MB</p>
    </div>
  );
}
