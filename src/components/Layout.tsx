import React from 'react';
import { Home, Trophy, Gift, User, PlayCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  coins: number;
  profilePic: string | null;
}

export function Layout({ children, activeTab, setActiveTab, coins, profilePic }: LayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tasks', icon: PlayCircle, label: 'Earn' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranking' },
    { id: 'redeem', icon: Gift, label: 'Redeem' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={16} className="text-slate-500" />
            )}
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Ad Vault
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          <span className="text-emerald-400 font-bold">🪙</span>
          <span className="font-mono text-sm font-bold tracking-tight">
            {coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-2 py-3 flex justify-around items-center z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 px-4 py-1 rounded-2xl",
                isActive ? "text-emerald-400 bg-emerald-400/10" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
