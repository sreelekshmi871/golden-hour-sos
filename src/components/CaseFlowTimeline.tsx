import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Hospital as HospitalIcon, 
  Car, 
  Sparkles,
  Check
} from 'lucide-react';
import { EmergencyAlert } from '../types';

interface CaseFlowTimelineProps {
  alert: EmergencyAlert | null;
  lang: 'en' | 'ta';
}

interface StepDef {
  key: string;
  labelEn: string;
  labelTa: string;
  icon: any;
}

const STEPS: StepDef[] = [
  { key: 'sos', labelEn: 'SOS Broadcast', labelTa: 'SOS அனுப்பப்பட்டது', icon: ShieldAlert },
  { key: 'triage', labelEn: 'AI Clinical Triage', labelTa: 'AI அவசர வகைப்பாடு', icon: Sparkles },
  { key: 'match', labelEn: 'Hospital Matched', labelTa: 'மருத்துவமனை தேர்வு', icon: HospitalIcon },
  { key: 'prealert', labelEn: 'Pre-Alert Sent', labelTa: 'முன்-தகவல் சென்றது', icon: Activity },
  { key: 'accepted', labelEn: 'Hospital Accepted', labelTa: 'மருத்துவமனை தயார்', icon: CheckCircle2 },
  { key: 'enroute', labelEn: 'Ambulance En Route', labelTa: 'ஆம்புலன்ஸ் பயணத்தில்', icon: Car },
  { key: 'arrived', labelEn: 'ER Bay Arrival', labelTa: 'அவசர சிகிச்சை அடைந்தது', icon: Check },
];

export const CaseFlowTimeline: React.FC<CaseFlowTimelineProps> = ({ alert, lang }) => {
  // Determine current active step index
  let activeIndex = 3; // Default after dispatch
  if (alert) {
    if (alert.status === 'ARRIVED') activeIndex = 6;
    else if (alert.status === 'EN_ROUTE') activeIndex = 5;
    else if (alert.status === 'ACCEPTED' || alert.hospitalBedReserved) activeIndex = 4;
    else if (alert.status === 'DISPATCHED') activeIndex = 3;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            {lang === 'ta' ? 'அவசர நெறிமுறை நேரடி காலக்கோடு' : 'Live Golden Hour Protocol Pipeline'}
          </h4>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
          Real-time Socket.IO Sync
        </span>
      </div>

      {/* Horizontal / Wrapped Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-xl border transition flex flex-col items-center text-center relative ${
                isCurrent
                  ? 'bg-rose-950/40 border-rose-500 text-rose-300 ring-1 ring-rose-500/50 shadow-lg shadow-rose-950/40'
                  : isDone
                  ? 'bg-slate-950/60 border-emerald-800/80 text-emerald-400'
                  : 'bg-slate-950/30 border-slate-800 text-slate-500'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition ${
                  isCurrent
                    ? 'bg-rose-600 text-white animate-pulse'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <span className="text-[11px] font-bold font-mono line-clamp-1">
                {lang === 'ta' ? step.labelTa : step.labelEn}
              </span>

              <span className="text-[9px] font-mono mt-0.5 opacity-80">
                {isDone ? '✓ Completed' : isCurrent ? '⚡ Active' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
