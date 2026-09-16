import { Video, Cpu, Activity, Play } from 'lucide-react';

export function SupportedGenerators() {
  const generators = [
    { name: 'Sora 2', company: 'OpenAI', icon: <Video className="w-6 h-6" /> },
    { name: 'Veo 3.1', company: 'Google', icon: <Cpu className="w-6 h-6" /> },
    { name: 'Gen-4.5', company: 'Runway', icon: <Activity className="w-6 h-6" /> },
    { name: 'Kling AI', company: 'Kuaishou', icon: <Play className="w-6 h-6" /> },
    { name: 'Seedance', company: 'ByteDance', icon: <Video className="w-6 h-6" /> },
    { name: 'Hailuo', company: 'MiniMax', icon: <Cpu className="w-6 h-6" /> },
  ];

  return (
    <div className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">We Help You Detect Videos From All Major AI Video Generators</h2>
        <p className="text-slate-600 dark:text-gray-400">Our AI video detector identifies footage from all major AI video generation models, including the latest releases:</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {generators.map((gen, index) => (
          <div key={index} className="bg-white/70 dark:bg-surface/30 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white dark:hover:bg-surface/50 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-black/40 flex items-center justify-center text-primary border border-slate-200 dark:border-white/5">
              {gen.icon}
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-medium">{gen.name}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-500">{gen.company}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {['Luma Ray3.14', 'Stable Video Diffusion', 'Descript', 'Pika 2.2', 'HeyGen'].map((name, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-surface/20 border border-slate-200/80 dark:border-white/5">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-slate-700 dark:text-gray-300">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
