import { Database, Server, Settings2 } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your AI Video Detection preferences and API connections.</p>
      </div>

      <div className="grid gap-8">
        {/* API Connection Settings */}
        <section className="bg-surface/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">API Connection</h2>
          </div>
          
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">AI Detection API</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Connect to your backend model</p>
                </div>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-surface border border-white/10 text-gray-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                Not Connected
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Backend Endpoint URL</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="https://api.yourdomain.com/v1" 
                    disabled
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <button disabled className="px-6 py-2.5 bg-surface text-gray-500 border border-white/5 rounded-xl font-medium cursor-not-allowed">
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Configure this using the VITE_API_BASE_URL environment variable.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">API Key (Optional)</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••" 
                  disabled
                  className="w-full max-w-md bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-surface/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
              <Settings2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Detection Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <h4 className="text-white font-medium">Strict Mode</h4>
                <p className="text-sm text-gray-500">Higher sensitivity for AI artifacts, may increase false positives.</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input type="checkbox" disabled className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <h4 className="text-white font-medium">Save History</h4>
                <p className="text-sm text-gray-500">Store analysis results securely in the backend.</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input type="checkbox" disabled defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
