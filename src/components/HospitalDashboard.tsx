import React, { useState } from 'react';
import { 
  Hospital, 
  Activity, 
  Clock, 
  Bed, 
  Heart, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Radio, 
  Send, 
  Plus, 
  Minus,
  Sparkles, 
  Stethoscope, 
  Volume2,
  Share2,
  Check,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { EmergencyAlert, Hospital as HospitalType } from '../types';
import { emergencyAudio } from '../utils/audio';
import { EmergencyMap } from './EmergencyMap';
import { CaseFlowTimeline } from './CaseFlowTimeline';

interface HospitalDashboardProps {
  alerts: EmergencyAlert[];
  hospitals: HospitalType[];
  selectedHospitalId: string;
  setSelectedHospitalId: (id: string) => void;
  onUpdateAlertAction: (alertId: string, action: string, note?: string) => void;
  onUpdateHospitalBeds: (hospitalId: string, icuBeds: number, bays: number) => void;
  lang: 'en' | 'ta';
  onSimulateIncoming?: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  alerts,
  hospitals,
  selectedHospitalId,
  setSelectedHospitalId,
  onUpdateAlertAction,
  onUpdateHospitalBeds,
  lang,
  onSimulateIncoming,
}) => {
  const [activeAlertId, setActiveAlertId] = useState<string>(alerts[0]?.id || '');
  const [noteText, setNoteText] = useState('');
  const [showOtherHospitalsToggle, setShowOtherHospitalsToggle] = useState(false);

  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  
  // Filter alerts targeted to this hospital
  const hospitalAlerts = alerts.filter(a => a.assignedHospitalId === currentHospital?.id);
  const activeAlert = hospitalAlerts.find(a => a.id === activeAlertId) || hospitalAlerts[0] || alerts[0];

  // Stats computation
  const incomingCount = hospitalAlerts.filter(a => a.status === 'DISPATCHED' || a.status === 'EN_ROUTE').length;
  const acceptedCount = hospitalAlerts.filter(a => a.status === 'ACCEPTED' || a.hospitalBedReserved).length;
  const divertedCount = hospitalAlerts.filter(a => a.status === 'DIVERTED').length;

  const handleSoundChime = () => {
    emergencyAudio.playAlertChime();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !activeAlert) return;
    onUpdateAlertAction(activeAlert.id, 'add_note', noteText.trim());
    setNoteText('');
  };

  const handleAcceptAndPrepare = () => {
    if (!activeAlert) return;
    onUpdateAlertAction(activeAlert.id, 'accept_and_prepare', 'Trauma Bay 1 pre-booked and clinical specialist team mobilized.');
  };

  const handleDivertCase = () => {
    if (!activeAlert) return;
    if (confirm('Divert incoming emergency case to the next-best partner hospital in the network?')) {
      onUpdateAlertAction(activeAlert.id, 'divert', 'Diverted due to temporary emergency surge/OT capacity saturation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hospital Console Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Hospital className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {currentHospital?.name || 'Emergency Command Center'}
                </h2>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                  LIVE ER DESK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentHospital?.address} • Station Code: {currentHospital?.code || currentHospital?.id}
              </p>
            </div>
          </div>

          {/* Hospital Switcher & Simulation */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.shortName} ({h.availableIcuBeds} ICU / {h.availableTraumaBays} Bays)
                </option>
              ))}
            </select>

            {onSimulateIncoming && (
              <button
                onClick={onSimulateIncoming}
                className="px-3 py-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500 text-rose-200 text-xs font-mono font-bold transition cursor-pointer"
                title="Simulate incoming STEMI patient"
              >
                + Sim Incoming
              </button>
            )}

            <button
              onClick={handleSoundChime}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Test Emergency Bay Chime"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Live ER Stats Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Available ICU Beds</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {currentHospital?.availableIcuBeds || 0} <span className="text-xs text-slate-500 font-normal">/ {currentHospital?.totalBeds}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => currentHospital && onUpdateHospitalBeds(currentHospital.id, currentHospital.availableIcuBeds + 1, currentHospital.availableTraumaBays)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => currentHospital && onUpdateHospitalBeds(currentHospital.id, Math.max(0, currentHospital.availableIcuBeds - 1), currentHospital.availableTraumaBays)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Trauma Bays Ready</div>
              <div className="text-xl font-bold text-sky-400 font-mono">
                {currentHospital?.availableTraumaBays || 0}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => currentHospital && onUpdateHospitalBeds(currentHospital.id, currentHospital.availableIcuBeds, currentHospital.availableTraumaBays + 1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => currentHospital && onUpdateHospitalBeds(currentHospital.id, currentHospital.availableIcuBeds, Math.max(0, currentHospital.availableTraumaBays - 1))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">24/7 Primary Cath Lab</div>
            <div className={`text-base font-bold font-mono ${currentHospital?.cathLabActive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentHospital?.cathLabActive ? 'OPERATIONAL' : 'BUSY / OCCUPIED'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Door-to-Balloon Standby</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Active Inbound Pre-Alerts</div>
            <div className="text-xl font-bold text-rose-500 font-mono flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              {incomingCount} Incoming
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Accepted: {acceptedCount} • Diverted: {divertedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed (Left 4 cols) + Active Inbound Patient Radar (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hospital Feed List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Inbound Pre-Alerts Feed</span>
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
              {hospitalAlerts.length} Cases
            </span>
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {hospitalAlerts.length > 0 ? (
              hospitalAlerts.map((alert) => {
                const isSelected = alert.id === activeAlert?.id;
                const isCritical = alert.triage.severity === 'CRITICAL';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setActiveAlertId(alert.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500 ring-1 ring-rose-500/50 shadow-lg'
                        : alert.status === 'DIVERTED'
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                        {alert.id}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        alert.status === 'DIVERTED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : alert.status === 'ACCEPTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mt-1.5 line-clamp-1">
                      {alert.triage.headline}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {alert.patientDescription}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ETA: ~{alert.etaMinutes} min
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                        alert.hospitalBedReserved ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.hospitalBedReserved ? 'Bay Pre-Reserved' : 'Pending Action'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs font-mono text-slate-400">
                No active pre-alerts for this station.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Route Map Only & Emergency Management */}
        <div className="lg:col-span-8 space-y-4">
          {activeAlert ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-600 text-white">
                      {activeAlert.triage.category.toUpperCase()} EMERGENCY
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Case: {activeAlert.id} • Logged: {activeAlert.incidentTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {activeAlert.triage.headline}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: <span className="text-slate-300">{activeAlert.userLocation.address}</span>
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/60 text-right">
                  <div className="text-[10px] text-rose-400 font-mono uppercase">Ambulance ETA</div>
                  <div className="text-2xl font-black text-rose-500 font-mono animate-pulse">
                    ~{activeAlert.etaMinutes} MINS
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Ambulance {activeAlert.ambulanceId}
                  </div>
                </div>
              </div>

              {/* Case Flow Pipeline */}
              <CaseFlowTimeline alert={activeAlert} lang={lang} />

              {/* LIVE ROUTE MAP ONLY (showing ONLY this hospital & inbound patient route) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Incoming Patient Live Tactical GPS Radar
                    </span>
                  </div>
                  <button
                    onClick={() => setShowOtherHospitalsToggle(!showOtherHospitalsToggle)}
                    className="text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showOtherHospitalsToggle ? 'Showing all hospitals' : 'Filter: This station only'}
                  </button>
                </div>

                <EmergencyMap
                  userLocation={activeAlert.userLocation}
                  selectedHospital={currentHospital}
                  allHospitals={hospitals}
                  alert={activeAlert}
                  lang={lang}
                  filterCurrentHospitalOnly={!showOtherHospitalsToggle}
                  compact
                  height="340px"
                />
              </div>

              {/* Actions Strip: Accept & Prepare / Divert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAcceptAndPrepare}
                  className={`py-3 px-4 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    activeAlert.hospitalBedReserved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950/60'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeAlert.hospitalBedReserved ? '✓ Trauma Bay Pre-Booked & Team Mobilized' : 'Accept & Prepare Bay'}</span>
                </button>

                <button
                  onClick={handleDivertCase}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-amber-900/60 border border-slate-700 hover:border-amber-600 text-amber-300 font-bold text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer"
                  title="Divert to next-best hospital in the network"
                >
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Divert Case (Re-match Next Center)</span>
                </button>
              </div>

              {/* Add Clinical Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter pre-arrival clinical instruction (e.g. Prepare 2 units O-Negative, standby for primary PCI)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Note</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500 text-xs font-mono">
              Select an inbound alert or click "+ Sim Incoming" to test live pre-hospital synchronization.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
