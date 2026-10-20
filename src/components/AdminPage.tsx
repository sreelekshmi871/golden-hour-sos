import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Hospital as HospitalIcon, 
  Radio, 
  Send, 
  Download, 
  Plus, 
  Activity, 
  Bed, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { Hospital, EmergencyAlert, MessageLogEntry } from '../types';

interface AdminPageProps {
  hospitals: Hospital[];
  alerts: EmergencyAlert[];
  onUpdateHospitalBeds: (id: string, icu: number, bays: number) => void;
  lang: 'en' | 'ta';
}

export const AdminPage: React.FC<AdminPageProps> = ({
  hospitals,
  alerts,
  onUpdateHospitalBeds,
  lang,
}) => {
  const [testRecipient, setTestRecipient] = useState('919677606088');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('all');

  const handleSendTestReport = async () => {
    setIsSendingTest(true);
    setTestStatus('Dispatching multichannel reports (WhatsApp, Telegram, SMS)...');
    try {
      const res = await fetch('/api/admin/send-test-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientPhone: testRecipient }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Test report dispatch failed');
      setTestStatus(`✓ Dispatch successful! Channels: ${data.channels?.join(', ') || 'WhatsApp, Telegram, SMS simulated'}`);
    } catch (err: any) {
      setTestStatus(`Report dispatch note: ${err.message || 'Logged to server audit table'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Case_ID', 'Timestamp', 'Incident_Time', 'Category', 'Severity', 'Patient_Text', 'Hospital_ID', 'ETA_Mins', 'Status', 'Bed_Reserved'];
    const rows = alerts.map(a => [
      a.id,
      a.timestamp,
      a.incidentTime,
      a.triage.category,
      a.triage.severity,
      `"${(a.patientDescription || '').replace(/"/g, '""')}"`,
      a.assignedHospitalId,
      a.etaMinutes,
      a.status,
      a.hospitalBedReserved ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GoldenHourSOS_Alerts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
              <span>ADMINISTRATIVE COMMAND & AUDIT</span>
              <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">
                ROOT CONSOLE
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Multichannel Dispatch Gateway (WhatsApp, Telegram, SMS) • Real-time ER Bed Management • DPDP Audit Logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Multichannel Notification Gateway Test Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Multichannel Emergency Dispatch Gateway
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Transmits real-time alert summary & live tracking link to phone (9677606088)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded">
            Gateways: WhatsApp Cloud • Telegram Bot • SMS
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono">
            <span className="text-slate-500">Target Phone:</span>
            <input
              type="text"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="flex-1 bg-transparent text-white font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleSendTestReport}
            disabled={isSendingTest}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? 'Broadcasting...' : 'Broadcast Test Report to Phone'}</span>
          </button>
        </div>

        {testStatus && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            {testStatus}
          </div>
        )}
      </div>

      {/* 12 Chennai Demo Hospitals Capacity Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <HospitalIcon className="w-4 h-4 text-rose-500" />
              <span>Participating Hospital ER Network ({hospitals.length} Centers)</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live capacity and surgical capability reporting across Greater Chennai
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Demo PIN for all stations: <strong className="text-white">1234</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white line-clamp-1">{hosp.shortName}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  {hosp.code || hosp.id}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1">{hosp.address}</div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-300">
                <span>ICU Beds: <strong className="text-emerald-400">{hosp.availableIcuBeds}</strong></span>
                <span>Trauma Bays: <strong className="text-sky-400">{hosp.availableTraumaBays}</strong></span>
                <span className={hosp.cathLabActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {hosp.cathLabActive ? 'CathLab ✓' : 'CathLab ✕'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
