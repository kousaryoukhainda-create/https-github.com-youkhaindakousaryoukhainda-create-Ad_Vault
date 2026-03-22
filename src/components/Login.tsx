import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface LoginProps {
  onLogin: (email: string, password?: string) => { success: boolean; message: string };
  onSignup: (name: string, email: string, password?: string, referralCode?: string) => { success: boolean; message: string };
}

export function Login({ onLogin, onSignup }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'signup' && (!name || name.length < 2)) {
      newErrors.name = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'We need a valid email address to secure your account.';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'For your security, use a password with at least 6 characters.';
    }

    if (referralCode && !referralCode.startsWith('VAULT-')) {
      newErrors.referralCode = "Referral codes must start with 'VAULT-' (e.g., VAULT-YK26).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setErrors({});

    // Simulate API call
    setTimeout(() => {
      let result;
      if (mode === 'login') {
        result = onLogin(email, password);
      } else {
        result = onSignup(name, email, password, referralCode);
      }

      if (!result.success) {
        setErrors({ auth: result.message });
        setIsLoading(false);
      } else {
        // Success is handled by state change in useCoins (isAuthenticated becomes true)
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate Google Login delay
    setTimeout(() => {
      const email = 'kousaryoukhainda@gmail.com';
      const name = 'Kousar Youkhainda';
      
      // Try login first
      let result = onLogin(email);
      
      if (!result.success) {
        // If login fails (user doesn't exist), sign them up
        result = onSignup(name, email);
      }

      if (!result.success) {
        setErrors({ auth: result.message });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-12"
          >
            <Shield size={32} className="text-white" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Ad Vault
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {mode === 'login' ? 'Welcome back to your vault' : 'Start your earning journey'}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/50 border border-slate-800/50 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-6 shadow-2xl">
          {errors.auth && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-bold">
              {errors.auth}
            </div>
          )}
          <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button 
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                mode === 'login' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              LOGIN
            </button>
            <button 
              onClick={() => {
                setMode('signup');
                setErrors({});
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                mode === 'signup' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input 
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={cn(
                    "w-full bg-slate-950 border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-colors placeholder:text-slate-700",
                    errors.name ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                  )}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input 
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={cn(
                  "w-full bg-slate-950 border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-colors placeholder:text-slate-700",
                  errors.email ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                )}
              />
              {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                className={cn(
                  "w-full bg-slate-950 border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-colors placeholder:text-slate-700",
                  errors.password ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                )}
              />
              {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Referral Code (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="Bonus 500 coins"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase());
                    if (errors.referralCode) setErrors(prev => ({ ...prev, referralCode: '' }));
                  }}
                  className={cn(
                    "w-full bg-slate-950 border rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none transition-colors placeholder:text-slate-700",
                    errors.referralCode ? "border-rose-500" : "border-slate-800 focus:border-emerald-500"
                  )}
                />
                {errors.referralCode && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.referralCode}</p>}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-xl shadow-emerald-500/20 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Login to Account' : 'Create Account'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-slate-900/50 px-4 text-slate-600">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">
          By continuing, you agree to our <span className="text-slate-400">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
