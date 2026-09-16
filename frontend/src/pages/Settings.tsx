import { Database, Moon, Server, Settings2, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-1">Configure your AI Video Detection preferences, theme, and API connections.</p>
      </div>

      <div className="grid gap-8">
        {/* Appearance / Theme Settings */}
        <section className="bg-white/60 dark:bg-surface/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Appearance & Theme</h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Choose your preferred visual theme for the application interface.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/30 shadow-xs'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/20 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Light Theme</div>
                <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Bright, high-contrast interface</div>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/30 shadow-xs'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/20 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Dark Theme</div>
                <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Sleek, dark modern interface</div>
              </div>
            </button>
          </div>
        </section>

        {/* API Connection Settings */}
        <section className="bg-white/60 dark:bg-surface/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">API Connection</h2>
          </div>
          
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-surface border border-slate-300 dark:border-white/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-medium">AI Detection API</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-500 mt-0.5">Connect to your backend model</p>
                </div>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-surface border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                Not Connected
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 mb-2">Backend Endpoint URL</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="https://api.yourdomain.com/v1" 
                    disabled
                    className="flex-1 bg-slate-100/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-400 dark:text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <button disabled className="px-6 py-2.5 bg-slate-200 dark:bg-surface text-slate-400 dark:text-gray-500 border border-slate-300 dark:border-white/5 rounded-xl font-medium cursor-not-allowed">
                    Save
                  </button>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-600 mt-2">
                  Configure this using the VITE_API_BASE_URL environment variable.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 mb-2">API Key (Optional)</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••" 
                  disabled
                  className="w-full max-w-md bg-slate-100/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-400 dark:text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white/60 dark:bg-surface/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
              <Settings2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Detection Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-200/80 dark:border-white/5">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Strict Mode</h4>
                <p className="text-sm text-slate-500 dark:text-gray-500">Higher sensitivity for AI artifacts, may increase false positives.</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input type="checkbox" disabled className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-200/80 dark:border-white/5">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium">Save History</h4>
                <p className="text-sm text-slate-500 dark:text-gray-500">Store analysis results securely in the backend.</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input type="checkbox" disabled defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
