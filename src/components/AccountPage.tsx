import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Phone, 
  Heart, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  Lock,
  LogOut
} from 'lucide-react';
import { User, EmergencyAlert } from '../types';

interface AccountPageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  alerts: EmergencyAlert[];
  lang: 'en' | 'ta';
  onViewCase: (caseCode: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  onUpdateUser,
  onLogout,
  alerts,
  lang,
  onViewCase,
}) => {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user.profile?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(user.profile?.allergies || 'None documented');
  const [contacts, setContacts] = useState(
    user.profile?.emergencyContacts || [
      { name: 'Dr. Ramesh (Spouse)', phone: '+91 98401 23456' },
    ]
  );
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Filter alerts belonging to user or recent
  const userAlerts = alerts.filter(a => !a.userId || a.userId === user.id);

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    if (contacts.length >= 3) {
      alert('Maximum 3 emergency contacts allowed.');
      return;
    }
    const updated = [...contacts, { name: newContactName.trim(), phone: newContactPhone.trim() }];
    setContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      name,
      phone,
      profile: {
        bloodGroup,
        allergies,
        emergencyContacts: contacts,
      },
    };
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedUser.profile, name, phone }),
      });
    } catch (e) {
      console.warn('Profile save sync:', e);
    }
    onUpdateUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownloadData = () => {
    const data = {
      user,
      profile: { bloodGroup, allergies, contacts },
      history: userAlerts,
      exportTimestamp: new Date().toISOString(),
      compliance: 'Digital Personal Data Protection (DPDP) Act, India',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GoldenHourSOS_Data_${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to permanently erase your profile and all emergency records? This follows DPDP Act Right to Erasure and cannot be undone.')) {
      fetch('/api/user/account', { method: 'DELETE' }).catch(console.warn);
      onLogout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{name || 'Emergency Patient'}</h2>
              <span className="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {phone || 'No phone verified'} • ID: {user.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadData}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title="Download personal health and audit telemetry (DPDP Act)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Data</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-mono flex items-center gap-1.5 border border-red-800/80 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Personal Health Record & Emergency Contacts (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  {lang === 'ta' ? 'அவசர சுயவிவரம் (மருத்துவ தகவல்கள்)' : 'Emergency Telemetry Profile'}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">AES-256 Encrypted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Primary Phone (+91)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono cursor-pointer"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-) [Universal Donor]</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Known Drug Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin, Sulfa drugs"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            {/* Emergency Contacts Section (up to 3) */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Emergency Contacts (Max 3):</span>
                <span className="text-slate-500">{contacts.length}/3 added</span>
              </div>

              <div className="space-y-2">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-white font-bold">{c.name}</span>
                      <span className="text-slate-400">({c.phone})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(i)}
                      className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {contacts.length < 3 && (
                <div className="flex gap-2 pt-1 text-xs">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Contact Name (e.g. Brother)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-36 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-mono cursor-pointer border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profile Updated
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>

          {/* DPDP Compliance & Privacy Notice */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-[11px] font-mono text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Digital Personal Data Protection (DPDP) Compliance</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Your sensitive medical data (Blood Group, Drug Allergies) is encrypted at rest using AES-256-GCM. Information is transmitted to the emergency hospital ER and ambulance paramedics solely upon your active SOS broadcast. Under India's DPDP Act, you retain full rights to inspect, download, or erase your account data at any moment.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-500">Need permanent profile deletion?</span>
              <button
                onClick={handleDeleteAccount}
                className="text-red-400 hover:text-red-300 text-[10px] font-bold underline cursor-pointer"
              >
                Erase Account & Telemetry
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Emergency Case History & Reports (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  {lang === 'ta' ? 'கேஸ் வரலாறு' : 'SOS Case History'}
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {userAlerts.length} Recorded
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {userAlerts.length > 0 ? (
                userAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        {alert.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {alert.status}
                      </span>
                    </div>

                    <div className="text-slate-300 font-sans font-bold line-clamp-1">
                      {alert.triage?.headline || 'Emergency Dispatch'}
                    </div>

                    <div className="text-slate-400 text-[11px] flex justify-between">
                      <span>Logged: {alert.incidentTime}</span>
                      <span>ETA: ~{alert.etaMinutes} mins</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewCase(alert.id)}
                        className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live Radar</span>
                      </button>

                      <a
                        href={`/api/alerts/${alert.id}/report.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 font-bold"
                      >
                        <FileText className="w-3 h-3" />
                        <span>PDF Report</span>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No emergency alerts logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
