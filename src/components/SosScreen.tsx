import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertOctagon, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Heart, 
  Car, 
  Brain, 
  Wind, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ShieldAlert, 
  Loader2, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  Share2,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink
} from 'lucide-react';
import { EmergencyAlert, Hospital, TriageResult, User as UserType } from '../types';
import { FirstAidPanel } from './FirstAidPanel';
import { HospitalMatchCard } from './HospitalMatchCard';
import { emergencyAudio } from '../utils/audio';
import { Hero3D } from './Hero3D';
import { EmergencyMap } from './EmergencyMap';
import { CaseFlowTimeline } from './CaseFlowTimeline';

interface SosScreenProps {
  onTriageSubmit: (text: string) => Promise<TriageResult>;
  onDispatchAlert: (
    triage: TriageResult,
    hospital: Hospital,
    location: { lat: number; lng: number; address: string },
    description: string,
    patientMeta?: { name?: string; age?: string; phone?: string; emergencyContact?: string; consent?: boolean }
  ) => void;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  setSelectedHospital: (h: Hospital) => void;
  userLocation: { lat: number; lng: number; address: string };
  setUserLocation: (loc: { lat: number; lng: number; address: string }) => void;
  currentAlert: EmergencyAlert | null;
  lang: 'en' | 'ta';
  currentUser?: UserType | null;
}

export const SosScreen: React.FC<SosScreenProps> = ({
  onTriageSubmit,
  onDispatchAlert,
  hospitals,
  selectedHospital,
  setSelectedHospital,
  userLocation,
  setUserLocation,
  currentAlert,
  lang,
  currentUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(currentAlert?.triage || null);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(!!currentAlert);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Optional Patient Fields (SOS works in 1 tap without filling)
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.profile?.emergencyContacts?.[0]?.phone || '');
  const [consentChecked, setConsentChecked] = useState(true);

  // Voice that speaks (SpeechSynthesis State)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [handsFreeMode, setHandsFreeMode] = useState(false);

  // Preset emergency scenarios
  const presets = [
    {
      id: 'cardiac',
      title: lang === 'ta' ? 'மாரடைப்பு / நெஞ்சு வலி' : 'Chest Pain / Heart Attack',
      desc: 'Severe crushing chest pain radiating to left arm and jaw, heavy sweating, acute STEMI suspicion.',
      icon: Heart,
      color: 'from-red-600 to-rose-700',
    },
    {
      id: 'accident',
      title: lang === 'ta' ? 'சாலை விபத்து / பலத்த காயம்' : 'Road Accident / Bleeding',
      desc: 'High-speed motorbike accident on highway, severe hemorrhage, head trauma, bystander calling.',
      icon: Car,
      color: 'from-amber-600 to-red-700',
    },
    {
      id: 'stroke',
      title: lang === 'ta' ? 'பக்கவாதம் / பேச்சு தடுமாற்றம்' : 'Stroke Signs (FAST)',
      desc: 'Sudden facial droop, right arm weakness, slurred speech started within last 20 minutes.',
      icon: Brain,
      color: 'from-purple-600 to-indigo-700',
    },
    {
      id: 'bleeding',
      title: lang === 'ta' ? 'கடுமையான ரத்தப்போக்கு' : 'Severe Bleeding / Trauma',
      desc: 'Deep laceration with arterial spurting blood, patient becoming pale and dizzy.',
      icon: AlertOctagon,
      color: 'from-rose-600 to-red-800',
    },
    {
      id: 'respiratory',
      title: lang === 'ta' ? 'மூச்சுத் திணறல்' : 'Breathing Difficulty',
      desc: 'Acute choking, severe gasping for air, cyanosis around lips, unable to speak.',
      icon: Wind,
      color: 'from-blue-600 to-sky-700',
    },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recog.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, [lang]);

  // Voice that speaks triage results aloud
  const speakTriageAloud = (triage: TriageResult, stepIdx = 0) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (stepIdx === 0) {
      textToSpeak = lang === 'ta'
        ? `அவசர எச்சரிக்கை: ${triage.headline}. தீவிரத்தன்மை: ${triage.severity}. மருத்துவமனை: ${selectedHospital?.shortName || ''}, சென்றடையும் நேரம் சுமார் ${selectedHospital?.estimatedDriveTimeMins || 8} நிமிடங்கள். முதல் உதவி: ${triage.firstAidSteps[0]?.tamilInstruction || triage.firstAidSteps[0]?.instruction}`
        : `Emergency Alert: ${triage.headline}. Severity: ${triage.severity}. Matched Hospital: ${selectedHospital?.shortName || ''}, ETA approximately ${selectedHospital?.estimatedDriveTimeMins || 8} minutes. Step 1: ${triage.firstAidSteps[0]?.instruction}.`;
    } else if (triage.firstAidSteps[stepIdx]) {
      const step = triage.firstAidSteps[stepIdx];
      textToSpeak = lang === 'ta'
        ? `படி ${step.step}: ${step.tamilInstruction || step.instruction}`
        : `Step ${step.step}: ${step.instruction}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;

    // Detect Tamil voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(v => v.lang === 'ta-IN' || v.lang.startsWith('ta'));
    if (lang === 'ta' && tamilVoice) {
      utterance.voice = tamilVoice;
    } else {
      utterance.lang = lang === 'ta' ? 'en-IN' : 'en-US';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleNextStepSpeak = () => {
    if (!triageResult) return;
    const nextIdx = (currentStepIndex + 1) % (triageResult.firstAidSteps.length || 1);
    setCurrentStepIndex(nextIdx);
    speakTriageAloud(triageResult, nextIdx);
  };

  const handleRepeatStepSpeak = () => {
    if (!triageResult) return;
    speakTriageAloud(triageResult, currentStepIndex);
  };

  const handleToggleSpeechPlayback = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (triageResult) {
      speakTriageAloud(triageResult, currentStepIndex);
    }
  };

  // Toggle voice dictation
  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported on this browser. You can type or tap the quick scenario chips below.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      emergencyAudio.playHeartbeatThump();
      setInputText('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start:', err);
      }
    }
  };

  // Triage trigger
  const handleTriageRequest = async (text: string) => {
    if (!text.trim()) return;
    setIsTriaging(true);
    emergencyAudio.playAlertChime();
    try {
      const result = await onTriageSubmit(text);
      setTriageResult(result);
      setCurrentStepIndex(0);
      speakTriageAloud(result, 0);
    } catch (err) {
      console.warn('Triage error:', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setInputText(preset.desc);
    handleTriageRequest(preset.desc);
  };

  const handleTriggerDispatch = () => {
    if (!triageResult || !selectedHospital) return;
    onDispatchAlert(
      triageResult,
      selectedHospital,
      userLocation,
      inputText || triageResult.headline,
      {
        name: patientName || undefined,
        age: patientAge || undefined,
        phone: patientPhone || undefined,
        emergencyContact: emergencyContact || undefined,
        consent: consentChecked,
      }
    );
    setDispatchConfirmed(true);
  };

  const whatsappDirectUrl = `https://wa.me/919677606088?text=${encodeURIComponent(
    `🚨 EMERGENCY SOS - GOLDEN HOUR ALERT\n` +
    `Case: ${currentAlert?.id || 'Incoming'}\n` +
    `Problem: ${inputText || triageResult?.headline || 'Medical Emergency'}\n` +
    `Patient Location: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}\n` +
    `Hospital: ${selectedHospital?.name}\n` +
    `ETA: ~${selectedHospital?.estimatedDriveTimeMins || 8} mins`
  )}`;

  return (
    <div className="space-y-6">
      {/* Step 1: Main SOS Distress Screen */}
      <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* 3D Hero Visualizer (Medical Cross + Heartbeat) */}
          <Hero3D lang={lang} />

          {/* Huge Pulsing Red SOS Button */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={() => {
                emergencyAudio.playHeartbeatThump();
                if (inputText.trim()) {
                  handleTriageRequest(inputText);
                } else {
                  handleSelectPreset(presets[0]);
                }
              }}
              className="sos-btn pulse-intense w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 text-white font-black text-2xl sm:text-3xl tracking-widest shadow-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transform hover:scale-105 active:scale-95 transition select-none border-4 border-white/90"
              title="One-Tap Emergency SOS"
            >
              <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
              <span>SOS</span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-normal text-rose-100 uppercase opacity-90">
                {lang === 'ta' ? 'உடனடி உதவி' : 'TAP FOR HELP'}
              </span>
            </button>
            <p className="text-xs text-rose-300 font-mono mt-3 text-center">
              {lang === 'ta' ? 'அவசர உதவிக்கு ஒரே தட்டல் • 108 உடன் ஒருங்கிணைக்கப்பட்டது' : 'One tap connects AI Triage, 108 Dispatch & Bed Readiness'}
            </p>
          </div>

          {/* Central Voice & Text Input Box */}
          <div className="pt-2">
            <div className="relative max-w-2xl mx-auto bg-slate-950/95 border-2 border-slate-800 focus-within:border-rose-500 rounded-2xl p-2 sm:p-3.5 shadow-2xl transition">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  lang === 'ta' 
                    ? 'நோயாளிக்கு என்ன ஆனது? (எ.கா: திடீர் நெஞ்சு வலி, மூச்சு விட முடியல, விபத்து)...'
                    : 'Describe what happened (e.g., Severe crushing chest pain radiating to left jaw, bike accident with bleeding)...'
                }
                rows={3}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none resize-none font-mono"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                {/* Voice input mic button */}
                <button
                  onClick={toggleVoiceRecording}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/60'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Speak in Tamil or English"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-400" />}
                  <span>{isListening ? (lang === 'ta' ? 'கேட்கிறது...' : 'Listening...') : (lang === 'ta' ? 'குரலில் பேசு' : 'Voice SOS')}</span>
                </button>

                {/* Submit Triage button */}
                <button
                  onClick={() => handleTriageRequest(inputText)}
                  disabled={isTriaging || !inputText.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-rose-900/40 disabled:opacity-50 transition cursor-pointer"
                >
                  {isTriaging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ta' ? 'ஆராய்ச்சி செய்கிறது...' : 'Analyzing Triage...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{lang === 'ta' ? 'AI Triage தொடங்கு' : 'Analyze & Match Hospital'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Patient Details Accordion (SOS works in 1 tap without filling) */}
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showOptionalFields ? 'Hide optional patient details' : '+ Optional: Add patient name, phone & emergency contact (Works in 1-tap if empty)'}</span>
              {showOptionalFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showOptionalFields && (
              <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono animate-in fade-in duration-300">
                <div>
                  <label className="block text-slate-400 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. S. Ramanathan"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Age / Gender</label>
                  <input
                    type="text"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 58 / Male"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Caller Mobile Phone</label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="9000000001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="accent-rose-600 rounded"
                  />
                  <label htmlFor="consent" className="cursor-pointer">
                    Share clinical telemetry with assigned Hospital ER & Paramedics under Golden Hour emergency protocol.
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Quick 1-Tap Emergency Preset Chips */}
          <div className="pt-2">
            <div className="text-xs font-mono uppercase text-slate-400 mb-2.5">
              {lang === 'ta' ? 'அல்லது உடனடி அவசர நிலையை தேர்வு செய்யவும்:' : 'Or tap a 1-click critical emergency scenario:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {presets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/80 hover:bg-slate-800/80 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-rose-400 transition line-clamp-1">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Triage & Hospital Matching Results View */}
      {triageResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
          {/* Animated Case Flow Timeline */}
          <CaseFlowTimeline alert={currentAlert} lang={lang} />

          {/* Triage Summary Card & Voice Reader Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-red-600 text-white animate-pulse">
                    {triageResult.dispatchPriorityCode || 'CODE RED'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Category: <strong className="text-white">{triageResult.category}</strong>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    Severity: {triageResult.severity}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                  {triageResult.headline}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {triageResult.reasoning}
                </p>
              </div>

              {/* Golden Hour Countdown Metric */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-600/40 text-center min-w-[140px]">
                <div className="text-[10px] text-amber-400 font-mono uppercase flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Golden Hour Window</span>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {triageResult.goldenHourWindowMinutes} MINS
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Crucial for Survival
                </div>
              </div>
            </div>

            {/* Voice That Speaks Audio Controls */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSpeechPlayback}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Pause Voice' : 'Read Aloud'}</span>
                </button>

                <button
                  onClick={handleNextStepSpeak}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title="Next First-Aid Step"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRepeatStepSpeak}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title="Repeat Instruction"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px]">Speed:</span>
                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5 text-xs font-mono cursor-pointer"
                >
                  <option value={0.8}>0.8x</option>
                  <option value={1.0}>1.0x (Normal)</option>
                  <option value={1.2}>1.2x (Fast)</option>
                </select>

                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[11px] font-bold flex items-center gap-1 transition"
                  title="Share Case with 9677606088 on WhatsApp"
                >
                  <Share2 className="w-3 h-3" />
                  <span>WhatsApp 9677606088</span>
                </a>
              </div>
            </div>

            {/* Disclaimer notice */}
            <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1.5">
              <span>⚠️ Disclaimer: First-aid guidance only. Not a replacement for doctors. Dial 108 immediately.</span>
            </div>
          </div>

          {/* Step 1: Immediate First Aid & CPR Metronome Panel */}
          <FirstAidPanel triage={triageResult} lang={lang} />

          {/* Step 2: Live Emergency Route & Radar Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{lang === 'ta' ? 'நேரடி அவசர வழித்தட வரைபடம்' : 'Live Emergency Route & Hospital Radar'}</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                Leaflet 2D • Live GPS Route
              </span>
            </div>
            <EmergencyMap
              userLocation={userLocation}
              selectedHospital={selectedHospital}
              allHospitals={hospitals}
              alert={currentAlert}
              lang={lang}
              onSelectHospital={setSelectedHospital}
              compact
              height="380px"
            />
          </div>

          {/* Step 3: Algorithmic Hospital Matching Section & Dispatch Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <HospitalMatchCard
                hospitals={hospitals}
                selectedHospitalId={selectedHospital?.id || hospitals[0]?.id}
                onSelectHospital={(h) => setSelectedHospital(h)}
                triage={triageResult}
                lang={lang}
              />
            </div>

            {/* Dispatch Action Card (Right Side) */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ta' ? 'அவசர தகவலை அனுப்பு' : 'Direct ER Dispatch'}
                  </h3>
                </div>

                <p className="text-xs text-slate-300">
                  {lang === 'ta'
                    ? 'தேர்வு செய்யப்பட்ட மருத்துவமனைக்கு நோயாளியின் விவரங்கள் மற்றும் ETA உடனே அனுப்பப்படும்.'
                    : 'Transmits live patient telemetry and pre-books the trauma bay before you arrive.'}
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Hospital:</span>
                    <strong className="text-white truncate max-w-[140px]">
                      {selectedHospital?.shortName || hospitals[0]?.shortName}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Drive Time:</span>
                    <strong className="text-amber-400 font-mono">
                      ~{selectedHospital?.estimatedDriveTimeMins || 8} Mins ({selectedHospital?.distanceKm || 3.8} km)
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Available ICU Beds:</span>
                    <strong className="text-emerald-400 font-mono">
                      {selectedHospital?.availableIcuBeds || 12} Free
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cath Lab Status:</span>
                    <strong className="text-emerald-400 font-mono">
                      {selectedHospital?.cathLabActive ? 'READY' : 'BUSY'}
                    </strong>
                  </div>
                </div>

                {/* Dispatch Trigger Button */}
                <button
                  onClick={handleTriggerDispatch}
                  className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-2xl transition cursor-pointer ${
                    dispatchConfirmed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/50 animate-emergency-glow'
                  }`}
                >
                  {dispatchConfirmed ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      <span>{lang === 'ta' ? 'தகவல் அனுப்பப்பட்டது (LIVE)' : 'Alert Dispatched to ER Desk!'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
                      <span>{lang === 'ta' ? 'மருத்துவமனைக்கு தகவல் அனுப்பு' : 'Confirm & Alert Hospital ER'}</span>
                    </>
                  )}
                </button>

                {dispatchConfirmed && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-center text-emerald-400 font-mono bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60">
                      ✓ Trauma Bay Pre-Reserved at {selectedHospital?.shortName}. Report dispatched to 9677606088.
                    </div>
                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share via WhatsApp to 9677606088</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
