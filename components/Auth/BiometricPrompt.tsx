
import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, ShieldCheck, X, Smartphone, CheckCircle2, Lock } from 'lucide-react';
import { User } from '../../types';

interface BiometricPromptProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({ user, onSuccess, onCancel }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  const startScan = () => {
    setStatus('scanning');
    // Simulate biometric processing time
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }, 2000);
  };

  useEffect(() => {
    // Auto-start scan on mount
    const timer = setTimeout(startScan, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
      
      <div className="bg-white w-full max-w-[320px] rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 relative">
            {status === 'idle' || status === 'scanning' ? (
              <div className="relative">
                <Fingerprint size={40} className={status === 'scanning' ? 'animate-pulse' : ''} />
                {status === 'scanning' && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-25" />
                )}
              </div>
            ) : status === 'success' ? (
              <CheckCircle2 size={40} className="text-green-500 animate-in zoom-in-50 duration-300" />
            ) : (
              <Smartphone size={40} className="text-red-500" />
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {status === 'idle' && 'Biometric Login'}
            {status === 'scanning' && 'Authenticating...'}
            {status === 'success' && 'Welcome Back!'}
            {status === 'error' && 'Try Again'}
          </h2>
          
          <p className="text-sm text-gray-500 mb-8 px-2">
            {status === 'success' 
              ? `Verified as ${user.name}` 
              : 'Confirm your identity to quickly access your medications.'}
          </p>

          <div className="w-full space-y-3">
            {status === 'scanning' ? (
              <div className="py-4 flex justify-center">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                 </div>
              </div>
            ) : (
              <button 
                onClick={onCancel}
                className="w-full py-4 text-xs font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                Use Password Instead
              </button>
            )}
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <ShieldCheck size={12} className="text-green-500" />
            Secure Biometric Encryption
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricPrompt;
