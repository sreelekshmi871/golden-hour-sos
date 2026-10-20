import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { DemoOtpPayload } from '../types';
import { emergencyAudio } from '../utils/audio';

interface DemoOtpToastProps {
  payload: DemoOtpPayload | null;
  onDismiss: () => void;
  onAutoFill?: (code: string) => void;
}

export const DemoOtpToast: React.FC<DemoOtpToastProps> = ({
  payload,
  onDismiss,
  onAutoFill,
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  useEffect(() => {
    if (!payload) return;

    // Play attention chime when demo OTP is dispatched
    try {
      emergencyAudio.playAlertChime();
    } catch {
      // Audio autoplay policy fallback
    }

    // Initialize countdown
    const initialSeconds = Math.max(0, Math.floor((payload.expiresAt - Date.now()) / 1000));
    setSecondsRemaining(initialSeconds > 0 ? initialSeconds : 300);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [payload]);

  if (!payload) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload.otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFill = () => {
    handleCopy();
    if (onAutoFill) {
      onAutoFill(payload.otp);
    }
    // Also dispatch a window event so any active OTP input can catch it
    window.dispatchEvent(new CustomEvent('goldenhour:fill-otp', { detail: { otp: payload.otp, phone: payload.phone } }));
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <aside 
      aria-label="Judges Demo OTP Notification"
      className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-lg animate-in slide-in-from-top-6 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-amber-500/80 rounded-2xl shadow-[0_10px_35px_rgba(245,158,11,0.35)] p-4 text-white relative overflow-hidden">
        {/* Ambient Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 animate-pulse" />

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-amber-400 uppercase font-mono">
                  JUDGES DEMO MODE • OTP DISPATCHED
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                  CREDITS BYPASSED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Phone: <span className="text-white font-bold">+91 {payload.phone}</span> ({payload.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'})
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* OTP Code Display Box */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 my-2.5">
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">
              6-Digit Code:
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-[0.25em] text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/30 shadow-inner select-all">
              {payload.otp}
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={handleFill}
              className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
              title="Auto-fill OTP into login form and verify"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Auto-Fill</span>
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-xs px-2.5 py-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer info: Expiration timer & judge explanation */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Expires in: <strong className="text-white">{timerStr}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Universal bypass code <strong className="text-cyan-400 font-mono">123456</strong> also works</span>
          </div>
          <div className="text-emerald-400 hidden sm:inline flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Simulated API</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
