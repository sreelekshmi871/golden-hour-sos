import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Phone, 
  Mail, 
  Hospital, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  Sparkles, 
  PhoneCall, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
  demoMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  lang,
  setLang,
  demoMode = true,
}) => {
  const [activeRole, setActiveRole] = useState<'patient' | 'hospital' | 'admin'>('patient');
  const [patientAuthMethod, setPatientAuthMethod] = useState<'otp' | 'password'>('otp');
  const [patientMode, setPatientMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form states
  const [phone, setPhone] = useState('9000000001');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hospital staff states
  const [hospitalCode, setHospitalCode] = useState('APOLLO-THOUSAND-LIGHTS');
  const [staffPin, setStaffPin] = useState('1234');

  // Admin states
  const [adminUsername, setAdminUsername] = useState('admin@goldenhour.org');
  const [adminPassword, setAdminPassword] = useState('GoldenHourAdmin2026!');
  const [adminPin, setAdminPin] = useState('9999');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Listen to auto-fill events from the top DemoOtpToast
  React.useEffect(() => {
    const handleAutoFill = (e: any) => {
      if (e.detail?.otp) {
        setOtp(e.detail.otp);
        setDemoOtpCode(e.detail.otp);
        setOtpSent(true);
        if (e.detail.phone) setPhone(e.detail.phone);
        setSuccessMessage(lang === 'ta' ? 'டெமோ OTP தானாக நிரப்பப்பட்டது' : 'Demo OTP auto-filled into form');
      }
    };
    window.addEventListener('goldenhour:fill-otp', handleAutoFill);
    return () => window.removeEventListener('goldenhour:fill-otp', handleAutoFill);
  }, [lang]);

  // Request Phone OTP (with Judges Demo Support)
  const handleRequestOtp = async () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (!phone || cleanDigits.length < 10) {
      setErrorMessage(lang === 'ta' ? 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanDigits.slice(-10), demo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch OTP');

      setOtpSent(true);
      setSuccessMessage(
        lang === 'ta'
          ? 'OTP அனுப்பப்பட்டது (டெமோ பயன்முறை - கிரெடிட்கள் சேமிக்கப்பட்டன)'
          : 'Verification code transmitted (Judges Demo Mode - Credits Bypassed)'
      );
      if (data.demoOtp) {
        setDemoOtpCode(data.demoOtp);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrorMessage(lang === 'ta' ? 'OTP குறியீட்டை உள்ளிடவும்' : 'Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Patient Email/Password Login or Signup
  const handlePatientPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = patientMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Hospital Staff Login
  const handleHospitalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/hospital-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalCode, pin: staffPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid hospital credentials');

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Hospital login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword, adminPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin verification failed');

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Top Banner: Guest SOS Action & 108 Emergency Call */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between gap-2">
        <button
          onClick={onContinueAsGuest}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 transition cursor-pointer border border-rose-500/40"
        >
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>{lang === 'ta' ? 'விருந்தினராக தொடரவும் (SOS)' : 'Continue as Guest, go to SOS'}</span>
        </button>

        <a
          href="tel:108"
          className="py-3 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-800/80 font-bold text-xs flex items-center gap-1 shadow-md transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>108</span>
        </a>
      </div>

      {/* Main Glassmorphism Authentication Card */}
      <div className="w-full max-w-md bg-[#112C5E]/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Subtle glowing ambient pulse in background */}
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

        {/* Card Header & Language Toggle */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {lang === 'ta' ? 'அங்கீகாரம் & உள்நுழைவு' : 'Unified Portal Access'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">Golden Hour Emergency Network</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setLang('en')}
              className={`text-[10px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                lang === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`text-[10px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                lang === 'ta' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Role Navigation Sliding Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-5 text-xs font-mono">
          <button
            onClick={() => { setActiveRole('patient'); setErrorMessage(''); }}
            className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
              activeRole === 'patient'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'நோயாளி' : 'Patient'}</span>
          </button>

          <button
            onClick={() => { setActiveRole('hospital'); setErrorMessage(''); }}
            className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
              activeRole === 'hospital'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'மருத்துவமனை' : 'Hospital'}</span>
          </button>

          <button
            onClick={() => { setActiveRole('admin'); setErrorMessage(''); }}
            className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
              activeRole === 'admin'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'நிர்வாகி' : 'Admin'}</span>
          </button>
        </div>

        {/* Status Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. PATIENT / FAMILY LOGIN TAB */}
        {activeRole === 'patient' && (
          <div className="space-y-4">
            {/* Toggle between OTP and Password */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 text-xs">
              <span className="text-slate-400 font-mono">
                {lang === 'ta' ? 'உள்நுழைவு முறை:' : 'Sign In Method:'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPatientAuthMethod('otp')}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition cursor-pointer ${
                    patientAuthMethod === 'otp'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  📱 Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => setPatientAuthMethod('password')}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold transition cursor-pointer ${
                    patientAuthMethod === 'password'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  ✉️ Email + Password
                </button>
              </div>
            </div>

            {/* A. Phone OTP Flow */}
            {patientAuthMethod === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                {/* Demo OTP Helper Banner for Judges */}
                {demoOtpCode && (
                  <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-600/80 text-amber-200 text-xs font-mono shadow-lg space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="font-bold text-amber-300">JUDGES DEMO OTP:</span>
                        <span className="text-sm font-black bg-slate-950 px-2 py-0.5 rounded border border-amber-500/50 text-white tracking-widest">
                          {demoOtpCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtpCode)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px] transition cursor-pointer shadow"
                      >
                        ⚡ Auto-Fill
                      </button>
                    </div>
                    <div className="text-[10px] text-amber-300/80 flex items-center justify-between">
                      <span>SMS credits bypassed. Printed to server log & screen.</span>
                      <span className="text-slate-400">Bypass PIN: <strong>123456</strong></span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    {lang === 'ta' ? 'மொபைல் எண் (+91)' : 'Mobile Phone Number (+91)'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9000000001"
                        className="w-full bg-slate-950/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isLoading}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono rounded-xl border border-slate-700 transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      {lang === 'ta' ? '6-இலக்க OTP குறியீடு' : '6-Digit Verification Code'}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-950/90 border border-cyan-500/80 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !otpSent}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? 'Verifying...' : (lang === 'ta' ? 'உள்நுழைக' : 'Verify & Sign In')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* B. Email & Password Flow */}
            {patientAuthMethod === 'password' && (
              <form onSubmit={handlePatientPasswordSubmit} className="space-y-3.5">
                {patientMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. S. Ramanathan"
                      className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full bg-slate-950/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <button
                    type="button"
                    onClick={() => setPatientMode(patientMode === 'signup' ? 'login' : 'signup')}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    {patientMode === 'signup' ? 'Already have account? Sign in' : 'Create new account'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? 'Processing...' : (patientMode === 'signup' ? 'Create Account' : 'Sign In')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. HOSPITAL STAFF LOGIN TAB */}
        {activeRole === 'hospital' && (
          <form onSubmit={handleHospitalLogin} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
              Demo Hospital PIN: <strong>1234</strong> (Pre-configured for all 12 Chennai demo hospitals)
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {lang === 'ta' ? 'மருத்துவமனை குறியீடு' : 'Hospital Station Identifier'}
              </label>
              <select
                value={hospitalCode}
                onChange={(e) => setHospitalCode(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="APOLLO-THOUSAND-LIGHTS">Apex Greams (Thousand Lights)</option>
                <option value="MIOT-MANAPAKKAM">Metropolitan Trauma Hub (Manapakkam)</option>
                <option value="SIMS-VADAPALANI">City Stroke Center (Vadapalani)</option>
                <option value="FORTIS-ADYAR">Coastal Cardiac (Adyar)</option>
                <option value="KAUVERY-ALWARPET">Central Resus Bay (Alwarpet)</option>
                <option value="STANLEY-ROYAPURAM">Stanley Burns & Trauma (Royapuram)</option>
                <option value="RGGGH-CENTRAL">Central Apex Trauma (Chennai Central)</option>
                <option value="SRMC-PORUR">West Tertiary Neuro (Porur)</option>
                <option value="AMBATTUR-LIFELINE">Ambattur Lifeline (Ambattur SIDCO)</option>
                <option value="TAMBARAM-APEX">Tambaram South ER (Tambaram)</option>
                <option value="SHOLINGANALLUR-OMR">OMR Cyber ER (Sholinganallur)</option>
                <option value="POONAMALLEE-METRO">Gateway Emergency (Poonamallee)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {lang === 'ta' ? 'பணியாளர் PIN குறியீடு' : 'Station Secret PIN'}
              </label>
              <input
                type="password"
                maxLength={8}
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                placeholder="1234"
                className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white tracking-widest focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Authenticating Station...' : 'Access ER Command Desk'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 3. ADMIN LOGIN TAB */}
        {activeRole === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-[11px] font-mono text-amber-300">
              Demo Admin Credentials prefilled. Admin PIN: <strong>9999</strong>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Admin Username / Email</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Master Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">2-Step Security PIN (ADMIN_PIN)</label>
              <input
                type="password"
                maxLength={4}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="9999"
                className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white tracking-widest focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Verifying Admin Key...' : 'Unlock Admin Console'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
