import { Hospital } from '../types';

export interface ChennaiLocality {
  name: string;
  nameTamil: string;
  lat: number;
  lng: number;
}

export const CHENNAI_LOCALITIES: ChennaiLocality[] = [
  { name: 'Poonamallee', nameTamil: 'பூந்தமல்லி', lat: 13.0480, lng: 80.0945 },
  { name: 'Ambattur', nameTamil: 'அம்பத்தூர்', lat: 13.1143, lng: 80.1548 },
  { name: 'Anna Nagar', nameTamil: 'அண்ணா நகர்', lat: 13.0850, lng: 80.2100 },
  { name: 'T. Nagar', nameTamil: 'தி. நகர்', lat: 13.0418, lng: 80.2341 },
  { name: 'Guindy', nameTamil: 'கிண்டி', lat: 13.0067, lng: 80.2030 },
  { name: 'Adyar', nameTamil: 'அடையாறு', lat: 13.0012, lng: 80.2565 },
  { name: 'Velachery', nameTamil: 'வேளச்சேரி', lat: 12.9750, lng: 80.2200 },
  { name: 'Tambaram', nameTamil: 'தாம்பரம்', lat: 12.9249, lng: 80.1275 },
  { name: 'Sholinganallur', nameTamil: 'சோளிங்கநல்லூர்', lat: 12.9010, lng: 80.2279 },
  { name: 'Porur', nameTamil: 'போரூர்', lat: 13.0382, lng: 80.1565 },
  { name: 'Perambur', nameTamil: 'பெரம்பூர்', lat: 13.1090, lng: 80.2440 },
  { name: 'Chengalpattu', nameTamil: 'செங்கல்பட்டு', lat: 12.6840, lng: 79.9830 },
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-apollo-greams',
    code: 'APOLLO-THOUSAND-LIGHTS',
    name: 'Apex Greams Heart & Trauma Institute (Demo Data)',
    shortName: 'Apex Greams',
    type: 'Super Specialty',
    level: 'Level 1 Trauma Center',
    address: 'Greams Road, Thousand Lights, Chennai',
    phone: '+91 44 2829 0200',
    emergencyHotline: '1066',
    coordinates: { lat: 13.0612, lng: 80.2520 },
    lat: 13.0612,
    lng: 80.2520,
    totalBeds: 600,
    availableIcuBeds: 14,
    availableTraumaBays: 4,
    totalVentilators: 45,
    availableVentilators: 8,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: true,
    specialists: [
      { name: 'Dr. R. Sengottaiyan', specialty: 'Interventional Cardiology', status: 'on_duty' },
      { name: 'Dr. V. Anand', specialty: 'Neurotrauma Surgery', status: 'on_duty' },
      { name: 'Dr. Priya Mani', specialty: 'Critical Care & Emergency', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Star Health', 'HDFC ERGO'],
    hasHelipad: true,
    active: true,
  },
  {
    id: 'hosp-miot-manapakkam',
    code: 'MIOT-MANAPAKKAM',
    name: 'Metropolitan Trauma & Ortho Center (Demo Data)',
    shortName: 'Metro Trauma Hub',
    type: 'Super Specialty',
    level: 'Level 1 Trauma Center',
    address: 'Mount-Poonamallee Road, Manapakkam, Chennai',
    phone: '+91 44 4200 2288',
    emergencyHotline: '044-42002288',
    coordinates: { lat: 13.0232, lng: 80.1834 },
    lat: 13.0232,
    lng: 80.1834,
    totalBeds: 500,
    availableIcuBeds: 18,
    availableTraumaBays: 6,
    totalVentilators: 30,
    availableVentilators: 10,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: true,
    specialists: [
      { name: 'Dr. P. Mohandas', specialty: 'Severe Polytrauma & Ortho', status: 'on_duty' },
      { name: 'Dr. R. Kumar', specialty: 'Emergency Resuscitation', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Comprehensive Govt Health'],
    hasHelipad: true,
    active: true,
  },
  {
    id: 'hosp-sims-vadapalani',
    code: 'SIMS-VADAPALANI',
    name: 'City Stroke & Neuroscience Hub (Demo Data)',
    shortName: 'City Stroke Center',
    type: 'Neuroscience Institute',
    level: 'Comprehensive Stroke Center',
    address: 'Jawaharlal Nehru Salai, Vadapalani, Chennai',
    phone: '+91 44 4921 1455',
    emergencyHotline: '044-20001111',
    coordinates: { lat: 13.0489, lng: 80.2098 },
    lat: 13.0489,
    lng: 80.2098,
    totalBeds: 350,
    availableIcuBeds: 12,
    availableTraumaBays: 3,
    totalVentilators: 25,
    availableVentilators: 6,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. Meenakshi Sundaram', specialty: 'Stroke Neurology & Thrombectomy', status: 'on_duty' },
      { name: 'Dr. K. Sridhar', specialty: 'Cerebrovascular Surgery', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['National Health Insurance', 'Star Health'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-fortis-adyar',
    code: 'FORTIS-ADYAR',
    name: 'Coastal Cardiac Resuscitation Hospital (Demo Data)',
    shortName: 'Coastal Cardiac',
    type: 'Cardiac Center',
    level: 'Primary Cardiac Care',
    address: 'Gandhi Nagar, 1st Main Road, Adyar, Chennai',
    phone: '+91 44 4289 2222',
    emergencyHotline: '044-42892222',
    coordinates: { lat: 13.0067, lng: 80.2568 },
    lat: 13.0067,
    lng: 80.2568,
    totalBeds: 200,
    availableIcuBeds: 8,
    availableTraumaBays: 2,
    totalVentilators: 18,
    availableVentilators: 4,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. S. Karthik', specialty: 'Interventional Cardiology', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Star Health'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-kauvery-alwarpet',
    code: 'KAUVERY-ALWARPET',
    name: 'Central Emergency & Resuscitation Center (Demo Data)',
    shortName: 'Central Resus Bay',
    type: 'Multi-Specialty Private',
    level: 'Level 1 Trauma Center',
    address: 'TTK Road, Alwarpet, Chennai',
    phone: '+91 44 4000 6000',
    emergencyHotline: '044-40006000',
    coordinates: { lat: 13.0376, lng: 80.2535 },
    lat: 13.0376,
    lng: 80.2535,
    totalBeds: 280,
    availableIcuBeds: 10,
    availableTraumaBays: 3,
    totalVentilators: 20,
    availableVentilators: 5,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: true,
    specialists: [
      { name: 'Dr. Aravindan', specialty: 'Critical Care & Toxicology', status: 'on_duty' },
    ],
    trafficStatus: 'moderate',
    acceptedInsurances: ['PM-JAY', 'All Corporate Insurances'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-stanley-govt',
    code: 'STANLEY-ROYAPURAM',
    name: 'Govt Apex Trauma & Burns Medical Center (Demo Data)',
    shortName: 'Stanley Burns & Trauma',
    type: 'Government Apex Trauma',
    level: 'Level 1 Trauma Center',
    address: 'Old Jail Road, Royapuram Medical Hub, Chennai',
    phone: '+91 44 2528 1351',
    emergencyHotline: '108',
    coordinates: { lat: 13.1075, lng: 80.2871 },
    lat: 13.1075,
    lng: 80.2871,
    totalBeds: 1280,
    availableIcuBeds: 22,
    availableTraumaBays: 8,
    totalVentilators: 60,
    availableVentilators: 15,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. K. Jayachandran', specialty: 'Severe Polytrauma & Orthopedics', status: 'on_duty' },
      { name: 'Dr. S. Balamurugan', specialty: 'Plastic & Burns Surgery', status: 'on_duty' },
    ],
    trafficStatus: 'moderate',
    acceptedInsurances: ['Chief Minister Comprehensive Health', 'PM-JAY', 'Free Public Care'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-rgggh-central',
    code: 'RGGGH-CENTRAL',
    name: 'Rajiv Gandhi Apex Command Trauma Center (Demo Data)',
    shortName: 'Central Apex Trauma',
    type: 'Government Apex Trauma',
    level: 'Level 1 Trauma Center',
    address: 'EVR Periyar Salai, Park Town, Chennai Central',
    phone: '+91 44 2530 5000',
    emergencyHotline: '108',
    coordinates: { lat: 13.0805, lng: 80.2785 },
    lat: 13.0805,
    lng: 80.2785,
    totalBeds: 1800,
    availableIcuBeds: 28,
    availableTraumaBays: 10,
    totalVentilators: 80,
    availableVentilators: 20,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: true,
    specialists: [
      { name: 'Dr. E. Theranirajan', specialty: 'Apex Emergency Medicine', status: 'on_duty' },
    ],
    trafficStatus: 'heavy',
    acceptedInsurances: ['Free Public Healthcare', 'PM-JAY'],
    hasHelipad: true,
    active: true,
  },
  {
    id: 'hosp-srmc-porur',
    code: 'SRMC-PORUR',
    name: 'Western Tertiary Trauma & Neuro Hospital (Demo Data)',
    shortName: 'West Tertiary Neuro',
    type: 'Super Specialty',
    level: 'Level 1 Trauma Center',
    address: 'Porur Medical Corridor, Chennai',
    phone: '+91 44 2476 8027',
    emergencyHotline: '1057',
    coordinates: { lat: 13.0372, lng: 80.1428 },
    lat: 13.0372,
    lng: 80.1428,
    totalBeds: 700,
    availableIcuBeds: 16,
    availableTraumaBays: 5,
    totalVentilators: 40,
    availableVentilators: 9,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: true,
    specialists: [
      { name: 'Dr. S. Thanikachalam', specialty: 'Emergency Cardiac & Vascular', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Commercial Insurances'],
    hasHelipad: true,
    active: true,
  },
  {
    id: 'hosp-ambattur-lifeline',
    code: 'AMBATTUR-LIFELINE',
    name: 'Ambattur Industrial Emergency Hospital (Demo Data)',
    shortName: 'Ambattur Lifeline',
    type: 'Multi-Specialty Private',
    level: 'General Emergency',
    address: 'SIDCO Industrial Estate, Ambattur, Chennai',
    phone: '+91 44 2625 3300',
    emergencyHotline: '044-26253300',
    coordinates: { lat: 13.1143, lng: 80.1548 },
    lat: 13.1143,
    lng: 80.1548,
    totalBeds: 160,
    availableIcuBeds: 6,
    availableTraumaBays: 2,
    totalVentilators: 10,
    availableVentilators: 2,
    cathLabActive: false,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: false,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. R. Balaji', specialty: 'Industrial Trauma & Burns', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['ESIC', 'PM-JAY'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-tambaram-apex',
    code: 'TAMBARAM-APEX',
    name: 'Tambaram South Highway Trauma Center (Demo Data)',
    shortName: 'Tambaram South ER',
    type: 'Super Specialty',
    level: 'Level 1 Trauma Center',
    address: 'GST Road, Tambaram Sanatorium, Chennai',
    phone: '+91 44 2241 8000',
    emergencyHotline: '044-22418000',
    coordinates: { lat: 12.9249, lng: 80.1275 },
    lat: 12.9249,
    lng: 80.1275,
    totalBeds: 320,
    availableIcuBeds: 15,
    availableTraumaBays: 4,
    totalVentilators: 22,
    availableVentilators: 7,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. M. Soundar', specialty: 'Highway Trauma Resuscitation', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Star Health'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-sholinganallur-omr',
    code: 'SHOLINGANALLUR-OMR',
    name: 'OMR Tech Corridor Acute Trauma Bay (Demo Data)',
    shortName: 'OMR Cyber ER',
    type: 'Super Specialty',
    level: 'Primary Cardiac Care',
    address: 'Old Mahabalipuram Road, Sholinganallur, Chennai',
    phone: '+91 44 6624 5000',
    emergencyHotline: '044-66245000',
    coordinates: { lat: 12.9010, lng: 80.2279 },
    lat: 12.9010,
    lng: 80.2279,
    totalBeds: 240,
    availableIcuBeds: 11,
    availableTraumaBays: 3,
    totalVentilators: 16,
    availableVentilators: 5,
    cathLabActive: true,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. S. Vimal', specialty: 'Emergency Cardiac & Critical Care', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Corporate Health'],
    hasHelipad: false,
    active: true,
  },
  {
    id: 'hosp-poonamallee-metro',
    code: 'POONAMALLEE-METRO',
    name: 'Poonamallee Gateway Emergency Hospital (Demo Data)',
    shortName: 'Gateway Emergency',
    type: 'Multi-Specialty Private',
    level: 'Level 1 Trauma Center',
    address: 'Bangalore Highway Junction, Poonamallee, Chennai',
    phone: '+91 44 2649 1100',
    emergencyHotline: '108',
    coordinates: { lat: 13.0480, lng: 80.0945 },
    lat: 13.0480,
    lng: 80.0945,
    totalBeds: 190,
    availableIcuBeds: 9,
    availableTraumaBays: 3,
    totalVentilators: 14,
    availableVentilators: 4,
    cathLabActive: false,
    ctMriAvailable: true,
    bloodBankO_NegativeAvailable: true,
    ecmoAvailable: false,
    specialists: [
      { name: 'Dr. J. Vignesh', specialty: 'Polytrauma Stabilization', status: 'on_duty' },
    ],
    trafficStatus: 'normal',
    acceptedInsurances: ['PM-JAY', 'Government Employee Scheme'],
    hasHelipad: false,
    active: true,
  },
];

// Helper to compute haversine distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export interface HospitalMatchResult extends Hospital {
  whyThisHospital?: string;
  whyNearestSkipped?: string;
}

// Matching algorithm ranking hospitals by distance, clinical capability, bed availability, and specialist readiness
export function matchHospitals(
  hospitals: Hospital[],
  userLat: number,
  userLng: number,
  category: string,
  severity: string
): HospitalMatchResult[] {
  // 1. Calculate distance and initial ETA for all hospitals
  const scored = hospitals.map((h) => {
    const lat = h.coordinates?.lat ?? h.lat ?? 13.0827;
    const lng = h.coordinates?.lng ?? h.lng ?? 80.2707;
    const dist = calculateDistanceKm(userLat, userLng, lat, lng);
    
    // Traffic factor (approx 2.1 - 3.8 mins per km depending on traffic)
    const trafficMultiplier = h.trafficStatus === 'heavy' ? 3.8 : h.trafficStatus === 'moderate' ? 2.8 : 2.1;
    const estimatedDriveTimeMins = Math.max(3, Math.round(dist * trafficMultiplier));

    let score = 100;
    const reasons: string[] = [];

    // Penalty for travel time
    score -= dist * 4;

    // Bed availability check
    if (h.availableIcuBeds === 0) {
      score -= 40;
    } else if (h.availableIcuBeds < 3) {
      score -= 10;
      reasons.push(`${h.availableIcuBeds} ICU beds free`);
    } else {
      score += 15;
      reasons.push(`${h.availableIcuBeds} ICU beds available`);
    }

    if (h.availableTraumaBays > 0) {
      score += 10;
      reasons.push(`${h.availableTraumaBays} trauma bays standby`);
    }

    // Category-specific checks
    if (category === 'cardiac') {
      if (h.cathLabActive) {
        score += 35;
        reasons.push('Active 24/7 Primary PCI Cath Lab');
      } else {
        score -= 45;
      }
      const hasCardio = h.specialists?.some((s) => s.specialty.toLowerCase().includes('cardio') && s.status === 'on_duty');
      if (hasCardio) {
        score += 25;
        reasons.push('Interventional Cardiologist on duty');
      }
    } else if (category === 'accident' || category === 'burn') {
      if (h.level === 'Level 1 Trauma Center') {
        score += 30;
        reasons.push('Certified Level 1 Trauma Center');
      }
      if (h.bloodBankO_NegativeAvailable) {
        score += 15;
        reasons.push('O-Negative emergency blood bank stocked');
      }
      const hasTrauma = h.specialists?.some((s) => (s.specialty.toLowerCase().includes('trauma') || s.specialty.toLowerCase().includes('ortho')) && s.status === 'on_duty');
      if (hasTrauma) score += 20;
    } else if (category === 'stroke') {
      if (h.ctMriAvailable) {
        score += 30;
        reasons.push('24/7 CT Angiography ready');
      } else {
        score -= 40;
      }
      const hasNeuro = h.specialists?.some((s) => s.specialty.toLowerCase().includes('neuro') && s.status === 'on_duty');
      if (hasNeuro) {
        score += 25;
        reasons.push('Comprehensive Stroke Team active');
      }
    }

    const finalScore = Math.min(99, Math.max(10, Math.round(score)));

    return {
      ...h,
      distanceKm: dist,
      estimatedDriveTimeMins,
      matchScore: finalScore,
      whyThisHospital: reasons.slice(0, 2).join(' • ') || 'Emergency readiness verified',
    };
  });

  // Sort by score
  const ranked = [...scored].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  // Determine why the nearest hospital was skipped if top pick is not nearest
  const sortedByDist = [...scored].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  const nearest = sortedByDist[0];
  const topPick = ranked[0];

  let skipExplanation = '';
  if (nearest && topPick && nearest.id !== topPick.id) {
    if (category === 'cardiac' && !nearest.cathLabActive) {
      skipExplanation = `Nearest center (${nearest.shortName}, ${nearest.distanceKm} km) lacks active 24/7 Cath Lab required for immediate primary angioplasty.`;
    } else if (nearest.availableIcuBeds === 0) {
      skipExplanation = `Nearest center (${nearest.shortName}, ${nearest.distanceKm} km) skipped due to zero available ICU beds.`;
    } else if (category === 'stroke' && !nearest.ctMriAvailable) {
      skipExplanation = `Nearest center (${nearest.shortName}, ${nearest.distanceKm} km) lacks immediate emergency CT Angiography for clot-busting assessment.`;
    } else {
      skipExplanation = `Nearest center (${nearest.shortName}, ${nearest.distanceKm} km) has lower critical clinical match for ${category.toUpperCase()} compared to ${topPick.shortName}.`;
    }
  }

  return ranked.map((h, i) => ({
    ...h,
    whyNearestSkipped: i === 0 ? skipExplanation : undefined,
  }));
}
