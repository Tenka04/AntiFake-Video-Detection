import { Upload, Cpu, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      title: 'Upload Your Video',
      description: 'Drag & drop or upload common video file formats (MP4, MOV, AVI, WEBM) or paste a YouTube link.',
      icon: <Upload className="w-8 h-8 text-blue-400" />,
      color: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Run Video Analysis',
      description: 'Our engine analyzes frame-by-frame visual signals, temporal patterns, compression artifacts, and synthetic media characteristics.',
      icon: <Cpu className="w-8 h-8 text-purple-400" />,
      color: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Review the Result',
      description: 'Get a clear AI-likelihood score percentage, classification score, and a breakdown of exactly why it was flagged.',
      icon: <CheckCircle className="w-8 h-8 text-green-400" />,
      color: 'bg-green-500/10 border-green-500/20'
    }
  ];

  return (
    <div className="py-16 border-t border-white/5 mt-8">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">How to Use the AI Video Detector</h2>
        <p className="text-gray-400">Identify manipulated and deepfake videos in 3 simple steps</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-center text-center">
            {/* Connector Line (hidden on mobile) */}
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/10 to-transparent border-t border-dashed border-white/20 z-0"></div>
            )}
            
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 z-10 border ${step.color} shadow-lg backdrop-blur-sm`}>
              {step.icon}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              <span className="text-primary mr-2">{idx + 1}.</span> 
              {step.title}
            </h3>
            
            <p className="text-gray-400 leading-relaxed max-w-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
