import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Play, 
  Square, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ShieldAlert,
  Flame,
  Activity
} from 'lucide-react';
import { FirstAidStep, TriageResult } from '../types';
import { emergencyAudio } from '../utils/audio';

interface FirstAidPanelProps {
  triage: TriageResult;
  lang: 'en' | 'ta';
}

export const FirstAidPanel: React.FC<FirstAidPanelProps> = ({ triage, lang }) => {
  const [isPlayingCpr, setIsPlayingCpr] = useState(false);
  const [cprBeat, setCprBeat] = useState(0);
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);
  const [cprTimerSeconds, setCprTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && cprTimerSeconds > 0) {
      interval = setInterval(() => {
        setCprTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            emergencyAudio.playAlertChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, cprTimerSeconds]);

  const toggleCprMetronome = () => {
    if (isPlayingCpr) {
      emergencyAudio.stopCprMetronome();
      setIsPlayingCpr(false);
      setCprBeat(0);
      setIsTimerRunning(false);
    } else {
      setIsPlayingCpr(true);
      setIsTimerRunning(true);
      setCprTimerSeconds(120);
      emergencyAudio.startCprMetronome((beat) => {
        setCprBeat(beat);
      });
    }
  };

  const speakStep = (step: FirstAidStep) => {
    if (speakingStep === step.step) {
      emergencyAudio.stopSpeaking();
      setSpeakingStep(null);
      return;
    }
    setSpeakingStep(step.step);
    const textToSpeak = lang === 'ta' && step.tamilInstruction 
      ? step.tamilInstruction 
      : step.audioPrompt || step.instruction;
    emergencyAudio.speak(textToSpeak, lang);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              {lang === 'ta' ? 'உடனடி உயிர் காக்கும் முதலுதவி' : 'Immediate Life-Saving First Aid'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ta' 
              ? 'ஆம்புலன்ஸ் வரும் வரை இந்த வழிமுறைகளை தீவிரமாக பின்பற்றவும்' 
              : 'Execute these pre-hospital interventions while the dispatch team is en route'}
          </p>
        </div>

        {/* CPR Metronome Launcher if cardiac or flagged */}
        {(triage.cprRequired || triage.category === 'cardiac') && (
          <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-500/50 rounded-xl p-2 px-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPlayingCpr ? 'bg-rose-600 animate-pulse' : 'bg-slate-800'}`}>
              <Heart className={`w-5 h-5 ${isPlayingCpr ? 'text-white fill-white scale-110' : 'text-rose-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">CPR Metronome</span>
                <span className="text-[10px] bg-rose-900/60 text-rose-300 font-mono px-1 rounded">110 BPM</span>
              </div>
              <span className="text-[10px] text-rose-300/80 font-mono">
                {isPlayingCpr ? `Beat: ${cprBeat}/30 compressions` : 'Hands-only rhythm'}
              </span>
            </div>
            <button
              onClick={toggleCprMetronome}
              className={`ml-2 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                isPlayingCpr 
                  ? 'bg-rose-500 text-white hover:bg-rose-600' 
                  : 'bg-rose-600/30 text-rose-200 hover:bg-rose-600/50 border border-rose-500/40'
              }`}
            >
              {isPlayingCpr ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Beat</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Critical Medical Warning */}
      {triage.preHospitalMedicationWarning && (
        <div className="mb-4 bg-amber-950/40 border border-amber-600/60 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              {lang === 'ta' ? 'முக்கிய எச்சரிக்கை' : 'Pre-Hospital Contraindication Warning'}
            </div>
            <p className="text-xs text-amber-200/90 mt-0.5">
              {triage.preHospitalMedicationWarning}
            </p>
          </div>
        </div>
      )}

      {/* Step by step cards */}
      <div className="space-y-3">
        {triage.firstAidSteps.map((step, idx) => (
          <div 
            key={idx}
            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500 text-rose-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.step || idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {step.instruction}
                  </p>
                  {step.tamilInstruction && (
                    <p className="text-xs text-emerald-400/90 font-medium mt-1.5 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40">
                      {step.tamilInstruction}
                    </p>
                  )}
                  {step.criticalWarning && (
                    <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      {step.criticalWarning}
                    </p>
                  )}
                </div>
              </div>

              {/* Audio button */}
              <button
                onClick={() => speakStep(step)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition shrink-0 ${
                  speakingStep === step.step
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={lang === 'ta' ? 'குரல் வழிகாட்டுதல்' : 'Listen to instructions'}
              >
                {speakingStep === step.step ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="hidden sm:inline text-[11px]">
                  {speakingStep === step.step ? 'Stop' : 'Listen'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vitals checklist */}
      {triage.vitalSignsToMonitor && triage.vitalSignsToMonitor.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang === 'ta' ? 'கண்காணிக்க வேண்டிய உயிரணு அறிகுறிகள்:' : 'Target Vitals to Continuously Monitor:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {triage.vitalSignsToMonitor.map((vital, i) => (
              <span key={i} className="text-xs bg-sky-950/50 border border-sky-800/60 text-sky-300 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                {vital}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
