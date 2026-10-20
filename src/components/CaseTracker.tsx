import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  MapPin, 
  Clock, 
  Hospital as HospitalIcon, 
  PhoneCall, 
  Activity, 
  Bed, 
  CheckCircle2, 
  Radio, 
  Share2, 
  ArrowRight,
  AlertTriangle,
  Siren,
  Sparkles,
  ExternalLink,
  FileText
} from 'lucide-react';
import { EmergencyAlert, Hospital } from '../types';
import { EmergencyMap } from './EmergencyMap';
import { CaseFlowTimeline } from './CaseFlowTimeline';

interface CaseTrackerProps {
  alerts: EmergencyAlert[];
  hospitals: Hospital[];
  currentAlertId?: string;
  lang: 'en' | 'ta';
  onBackToApp?: () => void;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({
  alerts,
  hospitals,
  currentAlertId,
  lang,
  onBackToApp,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    currentAlertId || alerts[0]?.id || ''
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const activeCase = alerts.find(a => a.id.toLowerCase() === selectedCaseId.toLowerCase()) || alerts[0];
  const assignedHospital = hospitals.find(h => h.id === activeCase?.assignedHospitalId) || hospitals[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = alerts.find(a => 
      a.id.toLowerCase().includes(searchInput.trim().toLowerCase())
    );
    if (found) {
      setSelectedCaseId(found.id);
    } else {
      alert(`No active emergency case found matching "${searchInput}".`);
    }
  };

  const handleCopyShareLink = () => {
    if (!activeCase) return;
    const url = `${window.location.origin}/#/case/${activeCase.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const googleMapsUrl = assignedHospital && activeCase
    ? `https://www.google.com/maps/dir/?api=1&origin=${activeCase.userLocation.lat},${activeCase.userLocation.lng}&destination=${assignedHospital.coordinates?.lat ?? assignedHospital.lat},${assignedHospital.coordinates?.lng ?? assignedHospital.lng}&travelmode=driving`
    : `https://www.google.com/maps`;

  const whatsappDirectUrl = activeCase ? `https://wa.me/919677606088?text=${encodeURIComponent(
    `🚨 GOLDEN HOUR LIVE CASE TRACKING\n` +
    `Case ID: ${activeCase.id}\n` +
    `Status: ${activeCase.status}\n` +
    `Destination Hospital: ${assignedHospital?.name}\n` +
    `ETA: ~${activeCase.etaMinutes} mins\n` +
    `Live Tracking Link: ${window.location.origin}/#/case/${activeCase.id}`
  )}` : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Search & Tracker Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{lang === 'ta' ? 'அவசர கேஸ் நேரடி கண்காணிப்பு' : 'Live Emergency Case Tracker'}</span>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                  PUBLIC PORTAL
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {lang === 'ta'
                ? 'நிகழ்நேர ஆம்புலன்ஸ் ஜிபிஎஸ் மற்றும் மருத்துவமனை தயார்நிலை கண்காணிப்பு'
                : 'Real-time telemetry, ambulance GPS route, and ER bay status for family & dispatchers'}
            </p>
          </div>

          {/* Case Code Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter SOS Code (e.g. SOS-1082)..."
                className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56 sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer font-mono"
            >
              Track
            </button>
          </form>
        </div>

        {/* Quick Case Switcher Pills if multiple */}
        {alerts.length > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <span className="text-slate-400 shrink-0">Recent Cases:</span>
            {alerts.slice(0, 5).map(alert => (
              <button
                key={alert.id}
                onClick={() => setSelectedCaseId(alert.id)}
                className={`px-2.5 py-1 rounded-lg border transition shrink-0 cursor-pointer ${
                  activeCase?.id === alert.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {alert.id} ({alert.triage.category})
              </button>
            ))}
          </div>
        )}
      </div>

      {activeCase ? (
        <div className="space-y-6">
          {/* Status Pipeline Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Case Identifier</div>
              <div className="text-lg font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>{activeCase.id}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Logged {activeCase.incidentTime}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Ambulance ETA</div>
              <div className="text-lg font-black font-mono text-amber-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4" />
                <span>~{activeCase.etaMinutes} MINS</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Vehicle {activeCase.ambulanceId}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Assigned Hospital</div>
              <div className="text-sm font-bold text-emerald-400 line-clamp-1 mt-0.5">
                {assignedHospital?.shortName || 'Apex Emergency'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">{assignedHospital?.availableIcuBeds} ICU Beds Available</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase">ER Preparation Status</div>
              <div className="text-sm font-bold text-cyan-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeCase.hospitalBedReserved ? 'Trauma Bay Pre-Booked' : 'Pre-Alert Active'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Status: {activeCase.status}</div>
            </div>
          </div>

          {/* Real-time Case Flow Timeline */}
          <CaseFlowTimeline alert={activeCase} lang={lang} />

          {/* Live Leaflet Map Centrepiece for Case Tracking */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  {lang === 'ta' ? 'நேரடி ஆம்புலன்ஸ் ஜிபிஎஸ் மேப்' : 'Live Ambulance Route & Telemetry'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 px-3 py-1 rounded-lg font-mono transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 transition font-mono"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>WhatsApp 9677606088</span>
                </a>

                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 transition cursor-pointer font-mono"
                >
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={`/api/alerts/${activeCase.id}/report.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 px-3 py-1 rounded-lg font-mono transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </a>
              </div>
            </div>

            {/* Embedded 2D Leaflet Map */}
            <EmergencyMap
              userLocation={activeCase.userLocation}
              selectedHospital={assignedHospital}
              allHospitals={hospitals}
              alert={activeCase}
              lang={lang}
              compact={false}
              height="420px"
            />
          </div>

          {/* Details Grid: Clinical Summary + Audit Log */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Clinical Triage Assessment</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{activeCase.triage.headline}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeCase.triage.reasoning}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px]">Patient Complaint:</span>
                  <p className="text-slate-200 text-[11px] mt-0.5 line-clamp-2">
                    {activeCase.patientDescription || 'Emergency call broadcast'}
                  </p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px]">Dispatch Priority:</span>
                  <p className="text-red-400 font-bold text-[11px] mt-0.5">
                    {activeCase.triage.dispatchPriorityCode || 'CODE RED STAT'}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Activity Log */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Live Dispatch Audit Log</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
                {activeCase.activityLog?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-amber-400 shrink-0">[{item.time}]</span>
                    <span className="text-slate-200">{item.event}</span>
                    <span className="text-slate-500 ml-auto shrink-0 text-[10px]">({item.actor})</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Need instant dispatch assistance?</span>
                <a
                  href="tel:108"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-mono"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 108</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs font-mono">
          No emergency cases available for tracking. Broadcast an SOS or click "1-Click Demo" in the top bar.
        </div>
      )}
    </div>
  );
};
