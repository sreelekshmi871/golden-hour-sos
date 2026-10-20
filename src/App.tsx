import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Navbar } from './components/Navbar';
import { SosScreen } from './components/SosScreen';
import { HospitalDashboard } from './components/HospitalDashboard';
import { EmergencyMap } from './components/EmergencyMap';
import { CaseTracker } from './components/CaseTracker';
import { LoginPage } from './components/LoginPage';
import { AccountPage } from './components/AccountPage';
import { AdminPage } from './components/AdminPage';
import { PitchGuide } from './components/PitchGuide';
import { DemoOtpToast } from './components/DemoOtpToast';
import { INITIAL_HOSPITALS, matchHospitals } from './data/hospitals';
import { EmergencyAlert, Hospital, TriageResult, User, DemoOtpPayload } from './types';
import { emergencyAudio } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'sos' | 'dashboard' | 'map' | 'tracker' | 'pitch' | 'login' | 'account' | 'admin'>('sos');
  const [trackingCaseId, setTrackingCaseId] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Simulated GPS Location (Defaults to Chennai Sterling Road / Guindy in demo)
  const [userLocation, setUserLocation] = useState({
    lat: 13.0645,
    lng: 80.2460,
    address: 'Near Sterling Road, Nungambakkam, Chennai'
  });

  // Hospitals State
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(INITIAL_HOSPITALS[0]);

  // Alerts State
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [currentActiveAlert, setCurrentActiveAlert] = useState<EmergencyAlert | null>(null);

  // Judges Demo OTP Notification State
  const [demoOtpNotification, setDemoOtpNotification] = useState<DemoOtpPayload | null>(null);

  // 1. Check Authenticated Session on Mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Hash Routing support for #/, #/hospital, #/map, #/tracker, #/login, #/account, #/admin, #/pitch, and #/case/:code
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#/case/')) {
        const code = hash.replace('#/case/', '').split('?')[0].trim();
        setTrackingCaseId(code);
        setCurrentTab('tracker');
      } else if (hash === '#/hospital') {
        setCurrentTab('dashboard');
      } else if (hash === '#/map') {
        setCurrentTab('map');
      } else if (hash === '#/tracker') {
        setCurrentTab('tracker');
      } else if (hash === '#/login') {
        setCurrentTab('login');
      } else if (hash === '#/account') {
        setCurrentTab('account');
      } else if (hash === '#/admin') {
        setCurrentTab('admin');
      } else if (hash === '#/pitch') {
        setCurrentTab('pitch');
      } else if (hash === '#/' || hash === '#/sos') {
        setCurrentTab('sos');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: 'sos' | 'dashboard' | 'map' | 'tracker' | 'pitch' | 'login' | 'account' | 'admin') => {
    setCurrentTab(tab);
    if (tab === 'sos') window.location.hash = '#/';
    else if (tab === 'dashboard') window.location.hash = '#/hospital';
    else if (tab === 'map') window.location.hash = '#/map';
    else if (tab === 'tracker') window.location.hash = trackingCaseId ? `#/case/${trackingCaseId}` : '#/tracker';
    else if (tab === 'login') window.location.hash = '#/login';
    else if (tab === 'account') window.location.hash = '#/account';
    else if (tab === 'admin') window.location.hash = '#/admin';
    else if (tab === 'pitch') window.location.hash = '#/pitch';
  };

  // 3. Real-time WebSocket synchronization via Socket.IO
  useEffect(() => {
    const socket = io();

    socket.on('init', (data: { alerts?: EmergencyAlert[]; hospitals?: Hospital[] }) => {
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(data.alerts);
        setCurrentActiveAlert(data.alerts[0]);
      }
      if (data.hospitals && data.hospitals.length > 0) {
        setHospitals(data.hospitals);
      }
    });

    socket.on('alert:new', (newAlert: EmergencyAlert) => {
      setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
      setCurrentActiveAlert(newAlert);
      emergencyAudio.playAlertChime();
    });

    socket.on('alert:action', (updatedAlert: EmergencyAlert) => {
      setAlerts((prev) => prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)));
      if (currentActiveAlert?.id === updatedAlert.id) {
        setCurrentActiveAlert(updatedAlert);
      }
    });

    socket.on('hospitals:update', (updatedHospitals: Hospital[]) => {
      setHospitals(updatedHospitals);
    });

    // Listen to real-time Demo OTP broadcasts for Judges Mode
    socket.on('otp:demo', (payload: DemoOtpPayload) => {
      setDemoOtpNotification(payload);
    });

    socket.on('otp:verified', (data: { phone: string }) => {
      // Auto dismiss demo notification on successful verification
      setDemoOtpNotification((prev) => (prev?.phone === data.phone ? null : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentActiveAlert]);

  // 4. Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospRes, alertRes] = await Promise.all([
          fetch('/api/hospitals').then(r => r.json()).catch(() => null),
          fetch('/api/alerts').then(r => r.json()).catch(() => null),
        ]);

        if (hospRes?.hospitals) {
          const matched = matchHospitals(hospRes.hospitals, userLocation.lat, userLocation.lng, 'cardiac', 'CRITICAL');
          setHospitals(matched);
          setSelectedHospital(matched[0]);
        } else {
          const matched = matchHospitals(INITIAL_HOSPITALS, userLocation.lat, userLocation.lng, 'cardiac', 'CRITICAL');
          setHospitals(matched);
          setSelectedHospital(matched[0]);
        }

        if (alertRes?.alerts && alertRes.alerts.length > 0) {
          setAlerts(alertRes.alerts);
          setCurrentActiveAlert(alertRes.alerts[0]);
        }
      } catch (err) {
        console.warn('Backend fetch error:', err);
      }
    };

    fetchData();
  }, []);

  // Update hospital rankings whenever user location changes
  useEffect(() => {
    const currentCategory = currentActiveAlert?.triage?.category || 'cardiac';
    const currentSeverity = currentActiveAlert?.triage?.severity || 'CRITICAL';
    const matched = matchHospitals(hospitals, userLocation.lat, userLocation.lng, currentCategory, currentSeverity);
    setHospitals(matched);
    if (!selectedHospital || !matched.some(h => h.id === selectedHospital.id)) {
      setSelectedHospital(matched[0]);
    }
  }, [userLocation]);

  // Triage API call
  const handleTriageSubmit = async (text: string): Promise<TriageResult> => {
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang })
      });
      const data = await res.json();
      const triage: TriageResult = data.triage;

      const ranked = matchHospitals(hospitals, userLocation.lat, userLocation.lng, triage.category, triage.severity);
      setHospitals(ranked);
      setSelectedHospital(ranked[0]);

      return triage;
    } catch (e) {
      console.error('Triage call error:', e);
      throw e;
    }
  };

  // Dispatch SOS Alert to Hospital
  const handleDispatchAlert = async (
    triage: TriageResult,
    hospital: Hospital,
    location: { lat: number; lng: number; address: string },
    description: string,
    patientMeta?: { name?: string; age?: string; phone?: string; emergencyContact?: string; consent?: boolean }
  ) => {
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const newAlert: EmergencyAlert = {
      id: `SOS-${codeNum}`,
      caseCode: `SOS-${codeNum}`,
      userId: currentUser?.id || null,
      timestamp: Date.now(),
      incidentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientName: patientMeta?.name || currentUser?.name || 'Citizen Caller',
      patientAge: patientMeta?.age || 'Adult',
      patientPhone: patientMeta?.phone || currentUser?.phone || '9000000001',
      emergencyContact: patientMeta?.emergencyContact || '+91 98401 23456',
      consent: patientMeta?.consent ?? true,
      patientDescription: description,
      triage,
      userLocation: location,
      assignedHospitalId: hospital.id,
      ambulanceId: `TN-01-AMB-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'DISPATCHED',
      etaMinutes: hospital.estimatedDriveTimeMins || 8,
      distanceKm: hospital.distanceKm || 3.5,
      goldenHourElapsedMinutes: 3,
      hospitalBedReserved: false,
      traumaTeamMobilized: false,
      cathLabPrepped: false,
      activityLog: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `SOS Broadcasted (${location.address})`,
          actor: 'Citizen App',
        },
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `AI Triage: ${triage.headline} (${triage.dispatchPriorityCode})`,
          actor: 'AI Clinical Engine',
        },
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Pre-alert transmitted to ${hospital.name} ER Desk`,
          actor: 'Dispatcher',
        },
      ],
    };

    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert: newAlert }),
      });
    } catch (e) {
      console.warn('Alert post sync:', e);
    }

    setAlerts(prev => [newAlert, ...prev]);
    setCurrentActiveAlert(newAlert);

    emergencyAudio.speak(
      lang === 'ta'
        ? 'அவசர எச்சரிக்கை மருத்துவமனைக்கு அனுப்பப்பட்டது. ஆம்புலன்ஸ் விரைந்து வருகிறது.'
        : 'Emergency alert dispatched to hospital ER desk. Prepare for arrival.',
      lang
    );
  };

  // Hospital ER Dashboard action updates (Accept, Divert, Add Note)
  const handleUpdateAlertAction = async (alertId: string, action: string, note?: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note, actor: 'ER Head Nurse' }),
      });
      const data = await res.json();
      if (data?.alert) {
        setAlerts(prev => prev.map(a => a.id === alertId ? data.alert : a));
        if (currentActiveAlert?.id === alertId) {
          setCurrentActiveAlert(data.alert);
        }
        return;
      }
    } catch (e) {
      console.warn('Alert action call:', e);
    }

    // Client fallback
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updated = { ...a };
      if (action === 'accept_and_prepare') {
        updated.hospitalBedReserved = true;
        updated.status = 'ACCEPTED';
        updated.activityLog.push({ time: nowStr, event: 'Trauma Bay 1 Reserved & Specialist Team Mobilized', actor: 'ER Desk' });
      } else if (action === 'divert') {
        updated.status = 'DIVERTED';
        // Auto re-match to second-best hospital
        const nextBest = hospitals.find(h => h.id !== updated.assignedHospitalId && h.availableIcuBeds > 0) || hospitals[1];
        if (nextBest) {
          updated.assignedHospitalId = nextBest.id;
          updated.activityLog.push({ time: nowStr, event: `Diverted. Re-matched to ${nextBest.name}`, actor: 'Network Coordinator' });
        }
      }
      if (note) {
        updated.activityLog.push({ time: nowStr, event: `Note: ${note}`, actor: 'ER Physician' });
      }
      return updated;
    }));
  };

  // Update Hospital Beds
  const handleUpdateHospitalBeds = (hospitalId: string, availableIcuBeds: number, availableTraumaBays: number) => {
    setHospitals(prev => prev.map(h => {
      if (h.id === hospitalId) {
        return { ...h, availableIcuBeds, availableTraumaBays };
      }
      return h;
    }));

    fetch('/api/hospitals/update-beds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId, availableIcuBeds, availableTraumaBays }),
    }).catch(console.warn);
  };

  // 1-Click Demo Case Setup (Guindy STEMI Cardiac Emergency)
  const handleSimulateDemo = () => {
    const demoLocation = {
      lat: 13.0067,
      lng: 80.2030,
      address: 'Near Guindy Kathipara Junction, Chennai'
    };
    setUserLocation(demoLocation);

    const demoTriage: TriageResult = {
      category: 'cardiac',
      severity: 'CRITICAL',
      headline: 'Acute Anterior STEMI (Myocardial Infarction)',
      reasoning: 'Severe crushing chest pain radiating to left jaw with diaphoresis near Guindy. Immediate primary percutaneous coronary intervention (PCI) required within Golden Hour window.',
      goldenHourWindowMinutes: 60,
      timeRemainingMinutes: 48,
      requiredSpecialists: ['Interventional Cardiologist', 'Cardiovascular Anesthesiologist'],
      requiredFacilities: ['Primary PCI Cath Lab (24/7)', 'Cardiac Resuscitation Bay', 'CCU'],
      vitalSignsToMonitor: ['Continuous ECG Lead II', 'SpO2 Saturation', 'Non-Invasive Blood Pressure'],
      firstAidSteps: [
        {
          step: 1,
          title: 'Position Upright & Loosen Clothing',
          instruction: 'Sit patient up against a wall with bent knees (W-position) to reduce cardiac workload. Do NOT let them walk or exert.',
          tamilInstruction: 'நோயாளிக்கு உட்கார்ந்த நிலையில் கால்களை மடித்து வைக்கவும். உடைகளை தளர்த்தவும்.',
          criticalWarning: 'Never lay a breathless cardiac patient flat on their back.',
          audioPrompt: 'Sit the patient comfortably upright and loosen tight clothing.'
        },
        {
          step: 2,
          title: 'Administer Soluble Aspirin 300mg',
          instruction: 'If conscious and not allergic, have them chew one 300mg Aspirin immediately to slow platelet aggregation.',
          tamilInstruction: 'ஆஸ்பிரின் மாத்திரை 300mg மென்று விழுங்க சொல்லவும்.',
          criticalWarning: 'Do not administer if bleeding or unconscious.',
          audioPrompt: 'Give 300 milligram chewable aspirin.'
        },
        {
          step: 3,
          title: 'Prepare for Hands-Only CPR if Breathing Stops',
          instruction: 'Check pulse and breathing continuously. If unresponsive, begin center chest compressions at 100-120 bpm.',
          tamilInstruction: 'சுவாசம் நின்றால் உடனே நெஞ்சின் மத்தியில் தொடர்ந்து அழுத்தவும்.',
          hasTimer: true,
          timerDurationSeconds: 120,
          audioPrompt: 'If unconscious, press firmly in center chest to the rhythm of Stayin Alive.'
        }
      ],
      preHospitalMedicationWarning: 'Do not administer nitroglycerin if systolic blood pressure is below 90 mmHg or severe lightheadedness.',
      cprRequired: true,
      dispatchPriorityCode: 'CODE RED - CAT 1 PRIORITY'
    };

    const targetHosp = hospitals.find(h => h.id === 'hosp-apollo-greams') || hospitals[0];
    handleDispatchAlert(
      demoTriage,
      targetHosp,
      demoLocation,
      '58M sudden crushing chest pain radiating to left jaw near Guindy Kathipara, diaphoresis, acute distress',
      { name: 'K. Balasubramanian', age: '58 / M', phone: '9000000001', emergencyContact: '+91 98401 23456', consent: true }
    );
    handleTabChange('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    handleTabChange('sos');
  };

  return (
    <div className="min-h-screen bg-[#0A1A3C] text-slate-100 flex flex-col font-sans relative">
      {/* Real-time Floating Judges Demo OTP Notification */}
      <DemoOtpToast
        payload={demoOtpNotification}
        onDismiss={() => setDemoOtpNotification(null)}
        onAutoFill={(code) => {
          if (currentTab !== 'login') {
            handleTabChange('login');
          }
          // Dispatch window event so LoginPage fills and focuses OTP
          window.dispatchEvent(
            new CustomEvent('goldenhour:fill-otp', {
              detail: { otp: code, phone: demoOtpNotification?.phone },
            })
          );
        }}
      />

      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        lang={lang}
        setLang={setLang}
        activeAlertsCount={alerts.length}
        onSimulateDemo={handleSimulateDemo}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'sos' && (
          <SosScreen
            onTriageSubmit={handleTriageSubmit}
            onDispatchAlert={handleDispatchAlert}
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            setSelectedHospital={setSelectedHospital}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            currentAlert={currentActiveAlert}
            lang={lang}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'dashboard' && (
          <HospitalDashboard
            alerts={alerts}
            hospitals={hospitals}
            selectedHospitalId={selectedHospital?.id || hospitals[0]?.id}
            setSelectedHospitalId={(id) => {
              const h = hospitals.find(h => h.id === id);
              if (h) setSelectedHospital(h);
            }}
            onUpdateAlertAction={handleUpdateAlertAction}
            onUpdateHospitalBeds={handleUpdateHospitalBeds}
            lang={lang}
            onSimulateIncoming={handleSimulateDemo}
          />
        )}

        {currentTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <span>LIVE EMERGENCY ROUTE RADAR</span>
                  <span className="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded">
                    LEAFLET 2D ENGINE
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Greater Chennai Metropolitan Region • Dynamic OSRM Road Routing • Hospital Capacity Radar
                </p>
              </div>
            </div>

            <EmergencyMap
              userLocation={userLocation}
              selectedHospital={selectedHospital}
              allHospitals={hospitals}
              alert={currentActiveAlert}
              lang={lang}
              onSelectHospital={setSelectedHospital}
              height="620px"
            />
          </div>
        )}

        {currentTab === 'tracker' && (
          <CaseTracker
            alerts={alerts}
            hospitals={hospitals}
            currentAlertId={trackingCaseId || currentActiveAlert?.id}
            lang={lang}
            onBackToApp={() => handleTabChange('sos')}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              if (user.role === 'hospital') handleTabChange('dashboard');
              else if (user.role === 'admin') handleTabChange('admin');
              else handleTabChange('account');
            }}
            onContinueAsGuest={() => handleTabChange('sos')}
            lang={lang}
            setLang={setLang}
          />
        )}

        {currentTab === 'account' && currentUser && (
          <AccountPage
            user={currentUser}
            onUpdateUser={setCurrentUser}
            onLogout={handleLogout}
            alerts={alerts}
            lang={lang}
            onViewCase={(code) => {
              setTrackingCaseId(code);
              handleTabChange('tracker');
            }}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            hospitals={hospitals}
            alerts={alerts}
            onUpdateHospitalBeds={handleUpdateHospitalBeds}
            lang={lang}
          />
        )}

        {currentTab === 'pitch' && (
          <PitchGuide lang={lang} />
        )}
      </main>

      {/* Footer with emergency disclaimer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <p>
          Golden Hour SOS Platform • "Right patient. Right hospital. Right time."
        </p>
        <p className="text-[10px] text-slate-600 mt-1">
          Prototype for demonstration. Not a medical device. In a real emergency call 108.
        </p>
      </footer>
    </div>
  );
}
