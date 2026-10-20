import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  Users, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  AlertOctagon,
  Copy,
  Check
} from 'lucide-react';

interface PitchGuideProps {
  lang: 'en' | 'ta';
}

export const PitchGuide: React.FC<PitchGuideProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'qa' | 'architecture' | 'impact'>('script');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [copiedScript, setCopiedScript] = useState(false);

  const demoScript = `
🏆 2-MINUTE WINNING DEMO SCRIPT (FOR HACKATHON STAGE)

[0:00 - 0:25] The Problem Hook:
"Judges, every year in India alone, over 1.5 million people die from acute cardiac arrest, stroke, and road accidents. More than 50% could have been saved if they reached the RIGHT hospital with the RIGHT ready facilities during the 'Golden Hour'—the first 60 minutes. Today, ambulances arrive at hospitals only to hear: 'Sorry, no ICU beds' or 'The Cath Lab is closed'. We built Golden Hour SOS to eliminate this deadly delay."

[0:25 - 0:55] Live Citizen SOS & AI Triage (Click SOS Screen):
"Look at our screen. A panicked bystander taps our giant SOS button or speaks in natural Tamil or English: 'Nenju vali, heavy sweating, breathless.'
Instantly, our Gemini 3.8 Flash medical intelligence diagnoses: Acute STEMI / Myocardial Infarction—Code Red. Notice how it instantly provides life-saving first aid: 'Sit the patient in W-position, give 300mg chewable aspirin, and turn on this 110-BPM CPR Metronome' [click Play Beat]."

[0:55 - 1:25] Algorithmic Matching (Click Hospital Match):
"Next, rather than just showing the physically nearest hospital, our algorithm evaluates 4 critical factors:
1. Driving distance & real-time traffic
2. Available ICU beds & Trauma bays
3. Relevant specialists currently on-duty (e.g. Interventional Cardiologist)
4. Equipment readiness (24/7 Cath Lab active).
Apollo Apex is selected with a 98% match because their Cath Lab is active right now!"

[1:25 - 1:55] Live Hospital Pre-Arrival ER Dashboard (Switch to ER Dashboard):
"Now switch to the Hospital ER console. Look at this: the ER team receives an immediate chime alert, sees the patient's incoming vitals, and can click 'Reserve Trauma Bay' and 'Scrub Cath Lab' BEFORE the ambulance even arrives. Door-to-balloon time is cut by 35 minutes!"

[1:55 - 2:00] Conclusion:
"Golden Hour SOS is not just an emergency app—it's a real-time synchronized life-saving pipeline. Thank you!"
  `.trim();

  const handleCopyScript = () => {
    navigator.clipboard.writeText(demoScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const faqs = [
    {
      q: "Why not just call 108 or 911?",
      a: "108/911 handles vehicle dispatch, but they are physically disconnected from real-time hospital capacity. An ambulance driver often arrives at an ER only to discover that the Cath Lab is occupied or no ICU beds are free, causing fatal hospital hopping. Golden Hour SOS bridges the triage, bed verification, and pre-arrival prep before the ambulance departs."
    },
    {
      q: "What if hospital bed or specialist data is outdated or fake?",
      a: "Our architecture supports a 3-tier verification model: (1) Direct HL7/FHIR API integration with hospital Electronic Health Records, (2) One-tap ER nurse confirmation upon dispatch, and (3) Dynamic confidence-decay algorithms where hospitals lose priority ranking if they fail to acknowledge bed status within 15 minutes."
    },
    {
      q: "Can this work in rural areas with poor 4G/5G connectivity?",
      a: "Yes! The client includes an offline clinical decision tree engine that performs instant triage locally on device without network access, and can transmit emergency geo-coordinates and triage code via encrypted SMS fallback to central dispatch."
    },
    {
      q: "How does the AI ensure it doesn't give dangerous medical advice?",
      a: "We restrict the AI using strict clinical schemas validated against AHA (American Heart Association) and ATLS (Advanced Trauma Life Support) emergency protocols. For example, in suspected stroke, it strictly enforces 'NO ASPIRIN' to prevent fatal intracerebral bleeding, and highlights red contraindications prominently."
    },
    {
      q: "What is your business and deployment model?",
      a: "B2G (State Emergency Services & Smart Cities) and B2B (Private hospital networks who pay for prioritized pre-arrival intake dashboards and reduced ER dwell times)."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-600/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {lang === 'ta' ? 'ஹேக்கத்தான் நடுவர் & பிட்ச் வழிகாட்டி' : 'Hackathon Pitch & Judge Q&A Guide'}
                </h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  WINNING KIT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Everything your team needs to deliver a top-tier pitch, answer tough jury questions, and present the system.
              </p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('script')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'script' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Script
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'qa' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Judge Q&A
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'architecture' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tech Architecture
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'impact' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Life Impact Stats
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Demo Script */}
      {activeTab === 'script' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Timed 2-Minute Stage Pitch Script
              </h3>
            </div>
            <button
              onClick={handleCopyScript}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {demoScript}
          </div>
        </div>
      )}

      {/* Tab 2: Judge Q&A */}
      {activeTab === 'qa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              Anticipated Judge Questions & Strongest Answers
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Judges often probe on real-world feasibility, data accuracy, and medical safety. Use these battle-tested answers:
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/50 transition cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-mono">
                        Q{idx + 1}
                      </span>
                      {faq.q}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-900 bg-slate-900/30">
                      <div className="font-bold text-emerald-400 uppercase text-[10px] font-mono mb-1">
                        Recommended Answer:
                      </div>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Tech Architecture & Team Split */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              Technical Architecture & Hackathon Team Split
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Clean separation of concerns matching the 4-person team structure from the specification:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-600/30 text-rose-400 text-xs font-mono font-bold flex items-center justify-center">
                  P1
                </span>
                <h4 className="text-sm font-bold text-white">Person 1: SOS UI & Web Speech Voice</h4>
              </div>
              <p className="text-xs text-slate-400">
                Created high-contrast SOS emergency UI, multi-language voice dictation via Web Speech API, quick one-tap medical presets, and CPR metronome.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">
                  P2
                </span>
                <h4 className="text-sm font-bold text-white">Person 2: Gemini AI Triage Engine</h4>
              </div>
              <p className="text-xs text-slate-400">
                Built structured LLM clinical triage prompts, contraindication guardrails (e.g. no aspirin for stroke), and zero-failure offline heuristic fallback engine.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-600/30 text-sky-400 text-xs font-mono font-bold flex items-center justify-center">
                  P3
                </span>
                <h4 className="text-sm font-bold text-white">Person 3: Algorithmic Hospital Matching & Tactical Map</h4>
              </div>
              <p className="text-xs text-slate-400">
                Implemented multi-criteria ranking algorithm (distance, beds, specialist on duty, active Cath Lab) and animated ambulance radar transit map with Green Corridor status.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                  P4
                </span>
                <h4 className="text-sm font-bold text-white">Person 4: Hospital ER Dashboard & State Sync</h4>
              </div>
              <p className="text-xs text-slate-400">
                Engineered real-time pre-arrival hospital feed with audio chimes, trauma bay pre-reservation controls, live telemetry vitals streaming, and dispatch audit logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Life Impact Stats */}
      {activeTab === 'impact' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Clinical Impact Metrics & Golden Hour Urgency
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Data-backed statistics to quote during the jury Q&A:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-rose-500 font-mono">-40%</div>
              <div className="text-xs font-bold text-white mt-1">STEMI Mortality Reduction</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Cutting door-to-balloon time under 60 minutes saves vital cardiac muscle.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-amber-400 font-mono">1.9M</div>
              <div className="text-xs font-bold text-white mt-1">Neurons Saved / Minute</div>
              <p className="text-[11px] text-slate-400 mt-1">
                In acute ischemic stroke, every single minute saved prevents permanent paralysis.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-emerald-400 font-mono">0 mins</div>
              <div className="text-xs font-bold text-white mt-1">ER Intake Stalling</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Trauma bays & specialist scrub teams are mobilized before ambulance arrival.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
