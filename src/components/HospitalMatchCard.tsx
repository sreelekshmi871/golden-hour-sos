import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HeartHandshake, 
  Phone, 
  Send, 
  Zap, 
  AlertCircle,
  Activity,
  Bed,
  Stethoscope,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Hospital, TriageResult } from '../types';
import { HospitalMatchResult } from '../data/hospitals';

interface HospitalMatchCardProps {
  hospitals: (Hospital | HospitalMatchResult)[];
  selectedHospitalId: string | null;
  onSelectHospital: (hospital: Hospital) => void;
  triage: TriageResult | null;
  lang: 'en' | 'ta';
}

export const HospitalMatchCard: React.FC<HospitalMatchCardProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  triage,
  lang,
}) => {
  const topHospital = hospitals[0] as HospitalMatchResult;
  const skipExplanation = topHospital?.whyNearestSkipped;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-rose-500" />
            {lang === 'ta' ? 'பரிந்துரைக்கப்பட்ட மருத்துவமனைகள்' : 'Algorithmic Hospital Matching'}
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ta' 
              ? 'தூரமும் வசதியும் கணக்கிடப்பட்டு வரிசைப்படுத்தப்பட்டுள்ளது'
              : 'Ranked by Golden Hour road ETA, bed availability, and specialized clinical readiness'}
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
          {hospitals.length} {lang === 'ta' ? 'அருகில் உள்ளன' : 'Hospitals Active'}
        </span>
      </div>

      {/* KEY DIFFERENTIATOR: Why Nearest Hospital was Skipped banner */}
      {skipExplanation && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/70 text-amber-200 text-xs font-mono flex items-start gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-amber-300">
              {lang === 'ta' ? 'அருகிலுள்ள மருத்துவமனை ஏன் தவிர்க்கப்பட்டது:' : 'WHY NEAREST HOSPITAL WAS SKIPPED:'}
            </span>
            <p className="text-amber-100 text-[11px] mt-0.5 leading-relaxed">
              {skipExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Hospital Cards */}
      <div className="grid grid-cols-1 gap-3">
        {hospitals.slice(0, 4).map((hospital: any, idx) => {
          const isSelected = selectedHospitalId === hospital.id;
          const isTopPick = idx === 0;

          return (
            <div
              key={hospital.id}
              onClick={() => onSelectHospital(hospital)}
              className={`relative rounded-xl border p-4 transition cursor-pointer ${
                isSelected
                  ? 'bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-950/50 ring-1 ring-rose-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Top pick badge */}
              {isTopPick && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 font-mono uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-current" />
                  {lang === 'ta' ? 'சிறந்த மருத்துவமனை' : 'Best Clinical Match'}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-rose-400 font-mono text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white hover:text-rose-400 transition">
                      {hospital.name}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {hospital.level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{hospital.address}</span>
                  </p>

                  {/* Why This Hospital Reason */}
                  {hospital.whyThisHospital && (
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 pt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{hospital.whyThisHospital}</span>
                    </div>
                  )}
                </div>

                {/* Score and ETA Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono">
                      {lang === 'ta' ? 'பொருத்தம்' : 'Match Score'}
                    </div>
                    <div className="text-lg font-black font-mono text-emerald-400">
                      {hospital.matchScore}%
                    </div>
                  </div>

                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[75px]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>ETA</span>
                    </div>
                    <div className="text-sm font-extrabold text-amber-400 font-mono">
                      ~{hospital.estimatedDriveTimeMins} min
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {hospital.distanceKm} km
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time clinical readiness pills */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                {/* ICU Beds */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] ${
                  hospital.availableIcuBeds > 0 
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300' 
                    : 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                }`}>
                  <Bed className="w-3 h-3" />
                  <span>
                    {hospital.availableIcuBeds > 0 
                      ? `${hospital.availableIcuBeds} ICU Beds Available` 
                      : 'ICU Beds Full'}
                  </span>
                </div>

                {/* Trauma Bay */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800/70 border border-slate-700 text-slate-300">
                  <Activity className="w-3 h-3 text-sky-400" />
                  <span>{hospital.availableTraumaBays} Trauma Bays</span>
                </div>

                {/* Cath Lab */}
                {triage?.category === 'cardiac' && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] ${
                    hospital.cathLabActive 
                      ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300' 
                      : 'bg-rose-950/50 border border-rose-900 text-rose-400'
                  }`}>
                    {hospital.cathLabActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>24/7 Cath Lab {hospital.cathLabActive ? 'Ready' : 'Occupied'}</span>
                  </div>
                )}

                {/* CT / MRI */}
                {triage?.category === 'stroke' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] bg-indigo-950/60 border border-indigo-800/60 text-indigo-300">
                    <CheckCircle className="w-3 h-3" />
                    <span>Emergency CT Angio Ready</span>
                  </div>
                )}

                {/* On-duty specialists */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono ml-auto">
                  <Stethoscope className="w-3 h-3 text-rose-400" />
                  <span>{hospital.specialists?.filter((s: any) => s.status === 'on_duty').length || 2} On-Duty Specialists</span>
                </div>
              </div>

              {/* Action buttons inside card */}
              <div className="mt-3 flex items-center justify-between pt-2">
                <a
                  href={`tel:${hospital.emergencyHotline}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>ER Hotline: {hospital.emergencyHotline}</span>
                </a>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHospital(hospital);
                  }}
                  className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>{isSelected ? (lang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்டது' : 'Selected Target') : (lang === 'ta' ? 'தேர்ந்தெடு' : 'Route Here')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
