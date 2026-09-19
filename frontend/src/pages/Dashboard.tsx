import { Activity, AlertTriangle, CheckCircle, Clock, Play, Plus, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardStats } from '../services/api';
import { AnimatedCounter } from '../components/AnimatedCounter';

const mockChartData = [
  { name: 'Mon', videos: 12 },
  { name: 'Tue', videos: 19 },
  { name: 'Wed', videos: 15 },
  { name: 'Thu', videos: 22 },
  { name: 'Fri', videos: 30 },
  { name: 'Sat', videos: 25 },
  { name: 'Sun', videos: 18 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function DashboardPage() {
  const [stats, setStats] = useState({
    analyzed: 0,
    aiDetected: 0,
    authentic: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((data) => {
      // Assuming getDashboardStats returns raw numbers, or we parse them
      setStats({
        analyzed: parseInt(data.analyzed.toString().replace(/\D/g,'')) || 124,
        aiDetected: parseInt(data.aiDetected.toString().replace(/\D/g,'')) || 42,
        authentic: parseInt(data.authentic.toString().replace(/\D/g,'')) || 82,
        pending: parseInt(data.pending.toString().replace(/\D/g,'')) || 3
      });
      setIsLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Videos Analyzed', value: stats.analyzed, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'AI Videos Detected', value: stats.aiDetected, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Authentic Videos', value: stats.authentic, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending Reviews', value: stats.pending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Video Detection Dashboard</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Overview of your video analysis activity.</p>
        </div>
        <Link to="/analyze" className="glass-button px-4 py-2 rounded-xl flex items-center space-x-2 text-slate-900 dark:text-white font-medium hover:scale-105 transition-transform">
          <Plus className="w-5 h-5 text-primary" />
          <span>New Analysis</span>
        </Link>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative glass-card rounded-2xl p-6 flex flex-col cursor-pointer overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="glow-effect">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">
                {isLoading ? '--' : <AnimatedCounter value={stat.value} />}
              </div>
              <div className="text-sm font-medium text-slate-500 dark:text-gray-400 relative z-10">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-6 h-96 flex flex-col shadow-xs group">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Activity Overview</h2>
            <div className="text-sm text-slate-500 dark:text-gray-400">Past 7 days</div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--border-subtle)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="videos" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVideos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center mb-6 border border-white/20 backdrop-blur-md relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-20"></div>
              <Video className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Analyze?</h2>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-8 max-w-[200px]">
              Upload a video to check its authenticity using our advanced AI.
            </p>
            <Link to="/analyze" className="glass-button px-6 py-3 rounded-xl flex items-center space-x-2 text-primary font-semibold hover:bg-primary/20 transition-colors w-full justify-center">
              <Play className="w-5 h-5" />
              <span>Start Analysis</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
