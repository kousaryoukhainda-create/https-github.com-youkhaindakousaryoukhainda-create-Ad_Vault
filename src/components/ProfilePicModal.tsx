import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Image as ImageIcon, Check, User } from 'lucide-react';
import { cn } from '../utils/cn';

interface ProfilePicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: string) => void;
  currentPic: string | null;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Cali',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Eden',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
];

export function ProfilePicModal({ isOpen, onClose, onSelect, currentPic }: ProfilePicModalProps) {
  const [mode, setMode] = useState<'selection' | 'camera'>('selection');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode('selection');
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onSelect(dataUrl);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-xl font-bold">Customize Profile</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {mode === 'selection' ? (
                <>
                  {/* Current Preview */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-emerald-500/30 overflow-hidden flex items-center justify-center relative group">
                      {currentPic ? (
                        <img src={currentPic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={64} className="text-slate-600" />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">Your current profile picture</p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={startCamera}
                      className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors border border-slate-700"
                    >
                      <Camera className="text-emerald-400" size={24} />
                      <span className="text-xs font-bold">Take Photo</span>
                    </button>
                    <label className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors border border-slate-700 cursor-pointer">
                      <ImageIcon className="text-cyan-400" size={24} />
                      <span className="text-xs font-bold">Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              onSelect(reader.result as string);
                              onClose();
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Avatar Selection */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Choose an Avatar</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATARS.map((avatar, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onSelect(avatar);
                            onClose();
                          }}
                          className={cn(
                            "aspect-square rounded-2xl bg-slate-800 border-2 transition-all hover:scale-105 active:scale-95 overflow-hidden",
                            currentPic === avatar ? "border-emerald-500" : "border-transparent hover:border-slate-600"
                          )}
                        >
                          <img src={avatar} alt={`Avatar ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-square rounded-3xl bg-black overflow-hidden relative border border-slate-800">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        stopCamera();
                        setMode('selection');
                      }}
                      className="flex-1 bg-slate-800 py-4 rounded-2xl font-bold text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={capturePhoto}
                      className="flex-[2] bg-emerald-500 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Camera size={20} />
                      Capture
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
