import React from 'react';
import { 
  Activity, 
  Hospital, 
  Navigation, 
  Award, 
  PhoneCall, 
  ShieldAlert, 
  Clock,
  Sparkles,
  Search,
  User as UserIcon,
  Lock,
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: 'sos' | 'dashboard' | 'map' | 'tracker' | 'pitch' | 'login' | 'account' | 'admin';
  setCurrentTab: (tab: 'sos' | 'dashboard' | 'map' | 'tracker' | 'pitch' | 'login' | 'account' | 'admin') => void;
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
  activeAlertsCount: number;
  onSimulateDemo: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  activeAlertsCount,
  onSimulateDemo,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-rose-950/50 shadow-xl">
      {/* Golden Hour Urgency Sub-bar */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 px-4 py-1 text-xs text-rose-200 flex items-center justify-between border-b border-rose-900/40">
        <div className="flex items-center gap-2 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold tracking-wider text-white uppercase">
            {lang === 'ta' ? 'கோல்டன் ஹவர் நெறிமுறை இயங்குகிறது' : 'GOLDEN HOUR PROTOCOL ACTIVE'}
          </span>
          <span className="hidden sm:inline text-rose-300/80">| 60-Minute Survival Window System</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onSimulateDemo}
            className="flex items-center gap-1.5 text-[11px] bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-100 px-2 py-0.5 rounded transition cursor-pointer"
            title="Load demo emergency case (Guindy chest pain with real-time dispatch)"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="font-semibold">{lang === 'ta' ? 'டெமோ கேஸ்' : '1-Click Demo'}</span>
          </button>
          <a
            href="tel:108"
            className="flex items-center gap-1 text-[11px] bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-0.5 rounded shadow-sm transition"
          >
            <PhoneCall className="w-3 h-3 animate-bounce" />
            <span>108 / 112 SOS</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('sos')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-rose-900/50 group-hover:scale-105 transition">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center">
                GOLDEN <span className="text-rose-500 ml-1">HOUR</span>
                <span className="ml-1.5 text-xs font-mono uppercase bg-rose-600/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">SOS</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Right patient. Right hospital. Right time.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setCurrentTab('sos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
              currentTab === 'sos'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>{lang === 'ta' ? 'அவசர SOS' : 'Citizen SOS'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer relative shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Hospital className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">{lang === 'ta' ? 'மருத்துவமனை ER' : 'Hospital ER'}</span>
            <span className="sm:hidden">ER</span>
            {activeAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
              currentTab === 'map'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Navigation className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">{lang === 'ta' ? 'ரூட் மேப்' : 'Live Route'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
              currentTab === 'tracker'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                : 'text-cyan-400/90 hover:text-cyan-200 hover:bg-cyan-950/30'
            }`}
            title="Public Case Tracking Portal (/case/:code)"
          >
            <Search className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">{lang === 'ta' ? 'டிராக்கர்' : 'Tracker'}</span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                currentTab === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('pitch')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
              currentTab === 'pitch'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'text-amber-400/90 hover:text-amber-200 hover:bg-amber-950/30 border border-amber-500/30'
            }`}
            title="Pitch presentation, demo flow, and judge answers"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span className="hidden lg:inline">{lang === 'ta' ? 'நடுவர் குறிப்பு' : 'Pitch & Judge Q&A'}</span>
          </button>
        </nav>

        {/* User Status / Login Button & Language Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setCurrentTab('account')}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-white hover:bg-slate-800 transition cursor-pointer"
                title="Open Profile & Medical Records"
              >
                <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[10px]">
                  {currentUser.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name || 'Account'}</span>
              </button>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 p-1 rounded transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'ta' ? 'உள்நுழைக' : 'Sign In'}</span>
            </button>
          )}

          {/* Language selector */}
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLang('en')}
              className={`text-xs px-1.5 py-1 rounded font-bold transition cursor-pointer ${
                lang === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`text-xs px-1.5 py-1 rounded font-bold transition cursor-pointer ${
                lang === 'ta' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
