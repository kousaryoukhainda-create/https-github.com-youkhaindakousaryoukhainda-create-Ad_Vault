import { useState, useEffect } from 'react';

export interface UserStats {
  coins: number;
  totalEarned: number;
  adsWatched: number;
  lastCheckIn: string | null;
  streak: number;
  referrals: number;
  completedTasks: string[];
  redemptions: { amount: number; date: string }[];
  profilePic: string | null;
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    referralCode?: string;
  } | null;
}

const INITIAL_STATS: UserStats = {
  coins: 0,
  totalEarned: 0,
  adsWatched: 0,
  lastCheckIn: null,
  streak: 0,
  referrals: 0,
  completedTasks: [],
  redemptions: [],
  profilePic: null,
  isAuthenticated: false,
  user: null,
};

export function useCoins() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  // Load initial state (check if someone was already logged in)
  useEffect(() => {
    const lastUser = localStorage.getItem('advault_last_user');
    if (lastUser) {
      const saved = localStorage.getItem(`advault_stats_${lastUser}`);
      if (saved) {
        setStats(JSON.parse(saved));
      }
    }
  }, []);

  // Save state whenever it changes, but only if authenticated
  useEffect(() => {
    if (stats.isAuthenticated && stats.user?.email) {
      localStorage.setItem(`advault_stats_${stats.user.email}`, JSON.stringify(stats));
      localStorage.setItem('advault_last_user', stats.user.email);
    }
  }, [stats]);

  const login = (email: string, password?: string) => {
    // Check if user exists in our "database"
    const users = JSON.parse(localStorage.getItem('advault_users') || '{}');
    const userRecord = users[email];

    if (!userRecord) {
      return { success: false, message: "No account found with this email. Please sign up first." };
    }

    // If password is provided (not Google login), check it
    if (password && userRecord.password !== password) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    // Load user's specific stats
    const savedStats = localStorage.getItem(`advault_stats_${email}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      setStats({
        ...INITIAL_STATS,
        isAuthenticated: true,
        user: { name: userRecord.name, email, referralCode: userRecord.referralCode }
      });
    }
    
    localStorage.setItem('advault_last_user', email);
    return { success: true, message: "Welcome back!" };
  };

  const signup = (name: string, email: string, password?: string, referralCode?: string) => {
    const users = JSON.parse(localStorage.getItem('advault_users') || '{}');
    
    if (users[email]) {
      return { success: false, message: "An account with this email already exists. Try logging in." };
    }

    // Save new user to "database"
    users[email] = { name, email, password, referralCode };
    localStorage.setItem('advault_users', JSON.stringify(users));

    // Initialize stats for new user
    const newStats: UserStats = {
      ...INITIAL_STATS,
      isAuthenticated: true,
      user: { name, email, referralCode },
      coins: referralCode ? 500 : 0,
      totalEarned: referralCode ? 500 : 0,
    };

    setStats(newStats);
    localStorage.setItem(`advault_stats_${email}`, JSON.stringify(newStats));
    localStorage.setItem('advault_last_user', email);

    return { success: true, message: "Account created successfully! Welcome to Ad Vault." };
  };

  const logout = () => {
    setStats(INITIAL_STATS);
    localStorage.removeItem('advault_last_user');
  };

  const addCoins = (amount: number) => {
    setStats(prev => ({
      ...prev,
      coins: prev.coins + amount,
      totalEarned: prev.totalEarned + amount,
    }));
  };

  const watchAd = (rewardAmount?: number) => {
    // Daily limit of 20 ads
    if (stats.adsWatched >= 20) {
      return { success: false, message: "You've reached your daily ad limit. Come back tomorrow for more rewards!" };
    }

    const reward = rewardAmount ?? (Math.floor(Math.random() * 50) + 10); // 10-60 coins
    setStats(prev => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      adsWatched: prev.adsWatched + 1,
    }));
    return { success: true, reward, message: `Earned ${reward} coins!` };
  };

  const dailyCheckIn = () => {
    const today = new Date().toDateString();
    if (stats.lastCheckIn === today) {
      return { success: false, message: "You've already claimed your daily reward. Come back tomorrow for more!" };
    }

    const reward = 100 + (stats.streak * 10);
    setStats(prev => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      lastCheckIn: today,
      streak: prev.streak + 1,
    }));
    return { success: true, reward, message: `Check-in successful! +${reward} coins` };
  };

  const redeem = (amount: number) => {
    if (stats.coins < amount) {
      return { success: false, message: `You need ${amount - stats.coins} more coins to redeem this reward. Keep watching ads to earn more!` };
    }
    setStats(prev => ({
      ...prev,
      coins: prev.coins - amount,
      redemptions: [...(prev.redemptions || []), { amount, date: new Date().toLocaleDateString() }]
    }));
    return { success: true, message: 'Redemption request submitted! We will process it within 24 hours.' };
  };

  const completeTask = (id: string, reward: number) => {
    if (stats.completedTasks?.includes(id)) {
      return { success: false, message: "You've already earned the reward for this task." };
    }

    setStats(prev => ({
      ...prev,
      coins: prev.coins + reward,
      totalEarned: prev.totalEarned + reward,
      completedTasks: [...(prev.completedTasks || []), id]
    }));

    return { success: true, message: `Task completed! +${reward} coins added to your vault.` };
  };

  const updateProfile = (profilePic: string) => {
    setStats(prev => ({
      ...prev,
      profilePic
    }));
  };

  const resetStats = () => {
    setStats(INITIAL_STATS);
    localStorage.removeItem('advault_stats');
  };

  return { stats, addCoins, watchAd, dailyCheckIn, redeem, completeTask, updateProfile, resetStats, login, signup, logout };
}
