import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-900 dark:text-gray-100 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-white/5 text-center text-sm text-slate-500 dark:text-gray-500">
          <p>AI Video Detection • Frontend Prototype</p>
          <p className="text-xs mt-1 opacity-70">AI detection results are dependent on the connected detection model.</p>
        </footer>
      </div>
    </div>
  );
}
