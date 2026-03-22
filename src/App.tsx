import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  PlayCircle, 
  ChevronRight, 
  Wallet, 
  History, 
  Settings, 
  Share2,
  Trophy,
  Star,
  CheckCircle2,
  X,
  Camera
} from 'lucide-react';
import { Layout } from './components/Layout';
import { AdModal } from './components/AdModal';
import { ProfilePicModal } from './components/ProfilePicModal';
import { Login } from './components/Login';
import { useCoins } from './hooks/useCoins';
import { cn } from './utils/cn';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [currentAdReward, setCurrentAdReward] = useState(0);
  const { stats, watchAd, dailyCheckIn, redeem, completeTask, updateProfile, resetStats, login, signup, logout } = useCoins();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const handleWatchAd = () => {
    // Check daily limit before starting
    if (stats.adsWatched >= 20) {
      showToast("You've reached your daily ad limit. Come back tomorrow!", 'error');
      return;
    }

    setIsAdLoading(true);
    
    // Simulate ad loading delay
    setTimeout(() => {
      // 10% chance of "ad loading failure"
      if (Math.random() < 0.1) {
        setIsAdLoading(false);
        showToast("Failed to load ad. Please check your connection and try again.", 'error');
        return;
      }

      const reward = Math.floor(Math.random() * 50) + 10;
      setCurrentAdReward(reward);
      setIsAdLoading(false);
      setIsAdOpen(true);
    }, 1500);
  };

  const handleAdComplete = () => {
    const result = watchAd(currentAdReward);
    setIsAdOpen(false);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const handleTaskComplete = (id: string, reward: number, url?: string) => {
    if (id === 'rate' && !stats.completedTasks?.includes('rate')) {
      setShowRating(true);
      return;
    }
    if (url) {
      window.open(url, '_blank');
    }
    const result = completeTask(id, reward);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const handleLogout = () => {
    logout();
    setActiveTab('home');
    showToast('Logged out successfully', 'success');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This will permanently erase all your coins and progress.')) {
      resetStats();
      setActiveTab('home');
      showToast('Account deleted successfully', 'success');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Ad Vault',
      text: 'Join Ad Vault and start earning real rewards! Use my referral code: VAULT-YK26',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      // If the user cancelled the share, don't show an error
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      // Fallback to clipboard for any other error or if not supported
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        showToast('Link copied to clipboard!', 'success');
      } catch (clipboardErr) {
        console.error('Clipboard fallback failed:', clipboardErr);
        showToast('Failed to share or copy link', 'error');
      }
    }
  };

  const handleDailyCheckIn = () => {
    const result = dailyCheckIn();
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const renderHome = () => (
    <div className="p-4 space-y-6">
      {/* Hero Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-emerald-50/80 text-xs font-medium uppercase tracking-widest">Available Balance</p>
              <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-2">
                🪙 {stats.coins.toLocaleString()}
              </h2>
            </div>
            <button 
              onClick={() => setActiveTab('redeem')}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <Wallet size={20} className="text-white" />
            </button>
          </div>
          <div className="flex gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 border border-white/10">
              <p className="text-[10px] text-emerald-50/60 uppercase font-bold">Total Earned</p>
              <p className="text-lg font-bold text-white">{stats.totalEarned.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 border border-white/10">
              <p className="text-[10px] text-emerald-50/60 uppercase font-bold">Ads Watched</p>
              <p className="text-lg font-bold text-white">{stats.adsWatched}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleDailyCheckIn}
          className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col items-center gap-3 hover:bg-slate-800 transition-colors"
        >
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Calendar className="text-amber-400" size={24} />
          </div>
          <span className="text-sm font-bold">Daily Check-in</span>
        </button>
        <button 
          onClick={handleWatchAd}
          disabled={isAdLoading}
          className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col items-center gap-3 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            {isAdLoading ? (
              <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            ) : (
              <PlayCircle className="text-emerald-400" size={24} />
            )}
          </div>
          <span className="text-sm font-bold">{isAdLoading ? 'Loading Ad...' : 'Watch & Earn'}</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold">Top Offers</h3>
          <button className="text-emerald-400 text-xs font-bold uppercase tracking-wider">View All</button>
        </div>
        <div className="space-y-3">
          {[
            { 
              title: 'Super Video Ad', 
              reward: 50, 
              icon: isAdLoading ? () => <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /> : PlayCircle, 
              color: 'text-emerald-400', 
              action: handleWatchAd 
            },
            { title: 'Daily Bonus Streak', reward: 100, icon: TrendingUp, color: 'text-amber-400', action: handleDailyCheckIn },
            { title: 'Invite Friends', reward: 500, icon: Share2, color: 'text-cyan-400', action: () => setActiveTab('profile') },
          ].map((offer, i) => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={offer.action}
              className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between group hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center", offer.color)}>
                  <offer.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{offer.title}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Instant Reward</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">+{offer.reward}</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black">Earn Coins</h2>
        <p className="text-slate-400 text-sm">Complete simple tasks to fill your vault.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-lg font-bold">Video Ads</h3>
            </div>
            <p className="text-slate-400 text-sm">Watch short 15-second videos and earn coins instantly. Unlimited ads available!</p>
            <button 
              onClick={handleWatchAd}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <PlayCircle size={20} />
              Watch Ad Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'twitter', title: 'Follow on Twitter', reward: 200, url: 'https://twitter.com' },
            { id: 'telegram', title: 'Join Telegram', reward: 250, url: 'https://t.me' },
            { id: 'rate', title: 'Rate App', reward: 500 },
          ].map((task, i) => {
            const isCompleted = stats.completedTasks?.includes(task.id);
            return (
              <div key={i} className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {isCompleted ? 'Completed' : 'Available'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">+{task.reward} Coins</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleTaskComplete(task.id, task.reward, task.url)}
                  disabled={isCompleted}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-colors",
                    isCompleted 
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  )}
                >
                  {isCompleted ? 'Done' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2 py-4">
        <Trophy size={48} className="mx-auto text-amber-400" />
        <h2 className="text-2xl font-black">Leaderboard</h2>
        <p className="text-slate-400 text-sm">Top earners of the week</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {[
          { name: 'Alex J.', coins: 45200, rank: 1, avatar: 'A' },
          { name: 'Sarah W.', coins: 38150, rank: 2, avatar: 'S' },
          { name: 'Mike R.', coins: 32400, rank: 3, avatar: 'M' },
          { name: 'Emma D.', coins: 28900, rank: 4, avatar: 'E' },
          { name: 'Chris P.', coins: 25600, rank: 5, avatar: 'C' },
          { name: 'You', coins: stats.totalEarned, rank: 124, avatar: 'U', isUser: true },
        ].map((user, i) => (
          <div 
            key={i} 
            className={cn(
              "flex items-center justify-between p-4 border-b border-slate-800 last:border-0",
              user.isUser ? "bg-emerald-500/5" : ""
            )}
          >
            <div className="flex items-center gap-4">
              <span className={cn(
                "w-6 text-center font-mono font-bold",
                user.rank === 1 ? "text-amber-400" : 
                user.rank === 2 ? "text-slate-300" :
                user.rank === 3 ? "text-amber-600" : "text-slate-500"
              )}>
                {user.rank}
              </span>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                {user.avatar}
              </div>
              <div>
                <h4 className={cn("text-sm font-bold", user.isUser ? "text-emerald-400" : "")}>
                  {user.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Weekly Earner</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold">{user.coins.toLocaleString()}</span>
              <span className="text-xs">🪙</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRedeem = () => (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black">Redeem Rewards</h2>
        <p className="text-slate-400 text-sm">Convert your hard-earned coins into real value.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { title: 'PayPal Cash', amount: '$5.00', cost: 50000, color: 'from-blue-500 to-blue-700' },
          { title: 'Amazon Gift Card', amount: '$10.00', cost: 100000, color: 'from-orange-400 to-orange-600' },
          { title: 'Google Play Credit', amount: '$2.00', cost: 20000, color: 'from-emerald-500 to-emerald-700' },
          { title: 'Crypto (USDT)', amount: '10 USDT', cost: 110000, color: 'from-slate-700 to-slate-900' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
            <div className={cn("h-24 bg-gradient-to-br p-6 flex justify-between items-center", item.color)}>
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <span className="text-2xl font-black text-white/90">{item.amount}</span>
            </div>
            <div className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Required Coins</p>
                <p className="text-lg font-bold text-emerald-400">{item.cost.toLocaleString()} 🪙</p>
              </div>
              <button 
                onClick={() => {
                  const result = redeem(item.cost);
                  showToast(result.message, result.success ? 'success' : 'error');
                }}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold transition-all active:scale-95",
                  stats.coins >= item.cost 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-6 space-y-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl font-black text-white overflow-hidden">
              {stats.profilePic ? (
                <img src={stats.profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                'YK'
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowProfilePic(true)}
            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full border-4 border-slate-950 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg"
          >
            <Camera size={14} />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black">{stats.user?.name || 'Kousar Youkhainda'}</h2>
          <p className="text-slate-500 text-sm">{stats.user?.email || 'kousaryoukhainda@gmail.com'}</p>
          <p className="text-[10px] text-slate-600 uppercase font-bold mt-1 tracking-widest">Member since March 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Total Earned</p>
          <p className="text-xl font-black text-emerald-400">{stats.totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Current Streak</p>
          <p className="text-xl font-black text-amber-400">{stats.streak} Days</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {[
          { label: 'Withdrawal History', icon: History, action: () => setShowHistory(true) },
          { label: 'Referral Program', icon: Share2, badge: stats.referrals, action: () => setShowReferral(true) },
          { label: 'App Settings', icon: Settings, action: () => setShowSettings(true) },
          { label: 'Help & Support', icon: Star, action: () => setShowSupport(true) },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            className="w-full flex items-center justify-between p-5 border-b border-slate-800 last:border-0 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <item.icon size={20} className="text-slate-400" />
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge !== undefined && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={16} className="text-slate-600" />
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full py-4 text-slate-400 font-bold text-sm hover:bg-slate-800/50 rounded-2xl transition-colors"
        >
          Logout Account
        </button>
        <button 
          onClick={handleDeleteAccount}
          className="w-full py-4 text-rose-500 font-bold text-sm hover:bg-rose-500/5 rounded-2xl transition-colors"
        >
          Delete Account & Data
        </button>
      </div>
    </div>
  );

  if (!stats.isAuthenticated) {
    return <Login onLogin={login} onSignup={signup} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} coins={stats.coins} profilePic={stats.profilePic}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'home' && renderHome()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
          {activeTab === 'redeem' && renderRedeem()}
          {activeTab === 'profile' && renderProfile()}
        </motion.div>
      </AnimatePresence>

      <AdModal 
        isOpen={isAdOpen} 
        onClose={handleAdComplete} 
        reward={currentAdReward} 
      />

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Withdrawal History</h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {stats.redemptions?.length > 0 ? (
                  stats.redemptions.map((r: any, i: number) => (
                    <div key={i} className="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">PayPal Cashout</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{r.date}</p>
                      </div>
                      <span className="text-amber-400 font-bold text-sm">Pending</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <History size={32} className="mx-auto text-slate-700" />
                    <p className="text-slate-500 text-sm">No withdrawals yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Referral Modal */}
      <AnimatePresence>
        {showReferral && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Refer & Earn</h3>
                <button onClick={() => setShowReferral(false)} className="text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center space-y-4">
                <p className="text-sm text-slate-300">Share your code and get 500 coins for every friend who joins!</p>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-black text-xl text-emerald-400 tracking-wider">VAULT-YK26</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('VAULT-YK26');
                      showToast('Code copied to clipboard!', 'success');
                    }}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleShare}
                  className="bg-slate-800 p-3 rounded-2xl text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-6"
                >
                  <Share2 size={24} />
                  <span className="font-bold text-sm">Share Now</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">App Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-bold">Push Notifications</span>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    notificationsEnabled ? "bg-emerald-500" : "bg-slate-700"
                  )}>
                    <motion.div 
                      animate={{ x: notificationsEnabled ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </div>
                </button>
                <button 
                  onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-bold">Dark Mode</span>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    darkModeEnabled ? "bg-emerald-500" : "bg-slate-700"
                  )}>
                    <motion.div 
                      animate={{ x: darkModeEnabled ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </div>
                </button>
                <div className="p-4 bg-slate-800/50 rounded-2xl space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">App Version</p>
                  <p className="text-sm font-bold">v2.4.0-stable</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Help & Support</h3>
                <button onClick={() => setShowSupport(false)} className="text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Need help with your account or rewards? Our team is here for you 24/7.</p>
                <button 
                  onClick={() => {
                    showToast('Support request sent! We will contact you soon.', 'success');
                    setShowSupport(false);
                  }}
                  className="w-full bg-emerald-500 p-4 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Contact Support
                </button>
                <button 
                  onClick={() => {
                    showToast('Opening FAQ...', 'success');
                    setShowSupport(false);
                  }}
                  className="w-full bg-slate-800 p-4 rounded-2xl font-bold text-sm hover:bg-slate-700 transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <Star size={40} className="text-amber-400 fill-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Enjoying Ad Vault?</h3>
                <p className="text-slate-400 text-sm">Your feedback helps us grow. Rate us 5 stars to earn 500 coins!</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={32} className="text-amber-400 fill-amber-400 cursor-pointer hover:scale-110 transition-transform" />
                ))}
              </div>
              <button 
                onClick={() => {
                  setShowRating(false);
                  const result = completeTask('rate', 500);
                  showToast(result.message, result.success ? 'success' : 'error');
                }}
                className="w-full bg-emerald-500 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
              >
                Submit Rating
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Pic Modal */}
      <ProfilePicModal 
        isOpen={showProfilePic} 
        onClose={() => setShowProfilePic(false)} 
        onSelect={updateProfile} 
        currentPic={stats.profilePic} 
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none"
          >
            <div className={cn(
              "p-4 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur-md",
              message.type === 'success' 
                ? "bg-emerald-500/90 border-emerald-400 text-white" 
                : "bg-rose-500/90 border-rose-400 text-white"
            )}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <Star size={20} />}
              <span className="font-bold text-sm">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
