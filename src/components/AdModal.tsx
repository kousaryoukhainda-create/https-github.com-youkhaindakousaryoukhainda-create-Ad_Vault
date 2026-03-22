import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Coins, Timer, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { ImaAdPlayer } from './ImaAdPlayer';

interface AdModalProps {
  isOpen: boolean;
  onClose: (reward: number) => void;
  reward: number;
}

export function AdModal({ isOpen, onClose, reward }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClose, setCanClose] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [useSimulation, setUseSimulation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(15);
      setCanClose(false);
      setAdError(null);
      setUseSimulation(false);

      // Simulation timer (fallback)
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleAdComplete = () => {
    setCanClose(true);
    setTimeLeft(0);
  };

  const handleAdError = (error: string) => {
    console.error('Ad failed to load:', error);
    setAdError(error);
    setUseSimulation(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
        >
          <div className="relative w-full max-w-md aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            {/* Ad Content */}
            <div className="flex-1 relative overflow-hidden">
              {!useSimulation ? (
                <ImaAdPlayer onAdComplete={handleAdComplete} onAdError={handleAdError} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-950">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <Play size={48} className="text-emerald-400 fill-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Ad Vault Premium</h3>
                    <p className="text-slate-400 text-sm">Watch this short video to earn your reward!</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                    <Coins size={20} className="text-emerald-400" />
                    <span className="font-bold text-emerald-400">+{reward} Coins</span>
                  </div>

                  {adError && (
                    <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-wider mt-4">
                      <AlertCircle size={12} />
                      <span>Ad failed to load. Using backup reward system.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close Button (Shown only when ad is complete) */}
            <div className="absolute top-4 right-4 z-20">
              {canClose && (
                <button
                  onClick={() => onClose(reward)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Progress Bar (Only for Simulation) */}
            {useSimulation && (
              <div className="h-1 bg-slate-800 w-full">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 15, ease: 'linear' }}
                  className="h-full bg-emerald-400"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
