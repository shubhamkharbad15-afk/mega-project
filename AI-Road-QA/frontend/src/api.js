// API Client integrating all FastAPI backend endpoints (http://127.0.0.1:8000)
// Includes token management, multipart uploads, PostGIS queries, and seamless fallback.

const API_BASE = '/api/v1';

// Token Management
export function getAuthToken() {
  try {
    const token = localStorage.getItem('road_auth_token');
    if (!token || token.startsWith('mock-jwt-token') || token.length < 20) {
      return null;
    }
    return token;
  } catch (e) {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('road_auth_token', token);
    } else {
      localStorage.removeItem('road_auth_token');
    }
  } catch (e) {
    // storage unavailable
  }
}

function getHeaders(isJson = true) {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// 1. Health & Server Status
export async function checkBackendHealth() {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Health check error');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

// 2. Authentication: Register
export async function registerUser(name, email, password, phone = '') {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Registration failed (${res.status})`);
  return data;
}

// 3. Authentication: Login
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Login failed (${res.status})`);
  if (!data.access_token) throw new Error('The server did not return an access token.');
  setAuthToken(data.access_token);
  return data;
}

// 4. Authentication: Current User
export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders(false) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Could not load signed-in user (${res.status})`);
  return data;
}

// 5. Defect Detection Pipeline (POST /api/v1/detections/)
export async function runDetection(fileOrBlob, latitude = 18.5204, longitude = 73.8567) {
  const formData = new FormData();
  formData.append('image', fileOrBlob);
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());

  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/detections/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Detection endpoint returned status ' + res.status);
    return await res.json();
  } catch (err) {
    return {
      detection_id: 'local-' + Math.random().toString(36).substring(2, 9),
      source: 'client_fallback',
      is_demo: true,
      warning: 'Backend detection was unavailable. This is a fallback response, not an image-analysis result.',
      detected: false,
      defect_type: null,
      confidence: 0.0,
      severity: 'low',
      risk_score: 0.0,
      model_version: 'yolov11-edge-tflite',
      location: { latitude, longitude },
      detections: [],
      image_url: null
    };
  }
}

// 6. Citizen Road Incident Reports (POST /api/v1/reports/)
export async function submitRoadReport(reportData) {
  const res = await fetch(`${API_BASE}/reports/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      title: reportData.title,
      description: reportData.description || '',
      severity: reportData.severity || 'medium',
      latitude: Number(reportData.latitude),
      longitude: Number(reportData.longitude),
      evidence: reportData.evidence || [],
      detection_id: reportData.detection_id || null,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Report submission failed (${res.status})`);
  return { ...data, id: String(data.id), defect_type: data.defect_type || data.title, location_name: `${Number(data.latitude).toFixed(4)}°, ${Number(data.longitude).toFixed(4)}°`, source: 'backend' };
}

export async function updateReportWorkflow(reportId, update) {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}/workflow`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(update),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Work-order update failed (${res.status})`);
  return { ...data, id: String(data.id), source: 'backend' };
}

// 7. PostGIS Nearby Spatial Query. Source metadata lets the UI distinguish
// backend records from local sample data instead of silently blending them.
export async function getNearbyReportsResult(lat = 18.5204, lng = 73.8567, radius = 25000) {
  try {
    const res = await fetch(`${API_BASE}/locations/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`, {
      headers: getHeaders(false),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Nearby reports returned ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      const reports = data.map((item, index) => ({
        ...item,
        id: String(item.id ?? `report-${index + 1}`),
        title: item.title || item.defect_type || 'Road defect report',
        severity: item.severity || 'low',
        status: item.status || 'confirmed',
        defect_type: item.defect_type || 'Unclassified defect',
        description: item.description || '',
        imageUrl: item.imageUrl || (Array.isArray(item.evidence) ? item.evidence[0] : null),
        location_name: item.location_name || (Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))
          ? `${Number(item.latitude).toFixed(4)}°, ${Number(item.longitude).toFixed(4)}°`
          : 'Location not supplied'),
        upvotes: Number(item.upvotes) || 0,
        budget_allocated: Number(item.budget_allocated) || 0,
      }));
      return { reports, source: 'backend', error: null };
    }
    throw new Error('Nearby reports response was not a list');
  } catch (err) {
    return { reports: INITIAL_REPORTS, source: 'sample', error: err.message || 'Backend unavailable' };
  }
}

export async function getNearbyReports(lat = 18.5204, lng = 73.8567, radius = 25000) {
  const result = await getNearbyReportsResult(lat, lng, radius);
  return result.reports;
}

// 8. Analytics Summary (GET /api/v1/analytics/summary)
export async function getAnalyticsSummary() {
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`, {
      headers: getHeaders(false),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }
  return {
    total_reports: null,
    high_severity: null,
    medium_severity: null,
    low_severity: null,
    source: 'unavailable',
    is_demo: true,
    warning: 'Live analytics are unavailable because the backend request failed.'
  };
}

// 9. AI Repair Assistant Advisory (POST /api/v1/assistant/repair-advice)
export async function getRepairAdvice(defect_type, severity = 'high', road_type = 'Asphalt Highway') {
  try {
    const res = await fetch(`${API_BASE}/assistant/repair-advice`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ defect_type, severity, road_type }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // assistant fallback
  }

  const isPothole = defect_type.toLowerCase().includes('pothole');
  return {
    recommended_repair: isPothole
      ? 'Square cavity edges with saw cut, clean debris with compressed air lance, apply RS-1 cationic tack coat, fill in 40mm compacted lifts with Warm-Mix Asphalt (WMA), and seal with vibratory plate compactor.'
      : 'Rout crack to 15mm depth, blow clean with hot air lance, apply polymer-modified elastomeric bitumen sealant at 180°C, and top with silica sand barrier.',
    materials: isPothole 
      ? ['Warm-Mix Asphalt (Grade 2)', 'RS-1 Cationic Tack Coat', '40mm-20mm Grushed Stone Aggregate'] 
      : ['Modified Bitumen Crack Sealant', 'Silica Sand / Mineral Filler'],
    eco_friendly_alternatives: isPothole
      ? [
          'Warm-Mix Asphalt (WMA) with chemical additives — cuts carbon footprint by 24% and emits zero toxic fumes during urban daytime compaction.',
          'Reclaimed Asphalt Pavement (RAP 40%) blend — conserves virgin bitumen and aggregates.',
          'Bio-based asphalt rejuvenators derived from pine resin / tall oil.'
        ]
      : [
          'Cold-pour plant-based emulsion sealant.',
          'Crumb rubberized bitumen (recycles discarded vehicle tyres into high-flexibility pavement sealant).'
        ],
    estimated_resources: {
      labor: '3 skilled crew + 1 flagger',
      equipment: 'Vibratory plate compactor (90 kg), infrared joint heater, emulsion sprayer',
      priority: severity,
      road_type: road_type,
      estimated_cost_inr: isPothole ? '₹5,200 - ₹7,800' : '₹1,800 - ₹3,200',
      time_to_complete: isPothole ? '45 - 60 minutes' : '20 - 30 minutes'
    },
    safety_notes: [
      'Deploy Class-A traffic cones 30m upstream with luminous retroreflective jackets.',
      'Ensure asphalt compaction temperature remains between 120°C and 130°C.',
      'Allow minimum 30 minutes curing before reopening lane to traffic.'
    ]
  };
}

// 10. Notifications (GET /api/v1/notifications/)
export async function getNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications/`, {
      headers: getHeaders(false),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }
  return { items: [], source: 'unavailable', is_demo: true, warning: 'Notifications could not be loaded from the backend.' };
}

// Seed dataset of realistic Pune and Indian highway road incidents
export const INITIAL_REPORTS = [
  {
    id: 'rep-101',
    title: 'Deep Cavity on Express Lane',
    description: '14cm deep cavity in right wheel path. Poses high risk of rim damage and loss of steering control for two-wheelers.',
    defect_type: 'Pothole (D40)',
    severity: 'high',
    risk_score: 0.94,
    status: 'confirmed',
    latitude: 18.5204,
    longitude: 73.8567,
    location_name: 'FC Road, Deccan Gymkhana (Near Goodluck Chowk)',
    zone: 'Ward 4 - Central',
    created_at: '2026-10-21T09:15:00Z',
    citizen_name: 'Citizen Reporter',
    upvotes: 42,
    budget_allocated: 7500,
    contractor: 'Apex Infra Projects Ltd.',
    imageUrl: '/new_images/images-2.jpeg',
    milestones: {
      before: '/new_images/images-2.jpeg',
      in_progress: '/new_images/repair-in-progress.jpg',
      resolved: null
    }
  },
  {
    id: 'rep-102',
    title: 'Structural Alligator Cracking Network',
    description: 'Extensive alligator fatigue cracking network over 8 meters of roadway. Base layer water infiltration observed.',
    defect_type: 'Alligator Crack (D20)',
    severity: 'medium',
    risk_score: 0.72,
    status: 'in_progress',
    latitude: 18.5314,
    longitude: 73.8446,
    location_name: 'Senapati Bapat Road, Near Pavillion Mall',
    zone: 'Ward 7 - Kothrud North',
    created_at: '2026-10-20T14:40:00Z',
    citizen_name: 'Community Reporter',
    upvotes: 28,
    budget_allocated: 14200,
    contractor: 'Metro Roadworks Corp.',
    imageUrl: '/new_images/images-7.jpeg',
    milestones: {
      before: '/new_images/images-7.jpeg',
      in_progress: '/new_images/repair-in-progress.jpg',
      resolved: null
    }
  },
  {
    id: 'rep-103',
    title: 'Transverse Flyover Joint Fracture',
    description: 'Thermal expansion fracture across both lanes of flyover ascent. Edge spalling observed.',
    defect_type: 'Longitudinal/Transverse (D10)',
    severity: 'low',
    risk_score: 0.45,
    status: 'resolved',
    latitude: 18.5089,
    longitude: 73.8078,
    location_name: 'Chandani Chowk NH-48 Ramp',
    zone: 'Ward 12 - West Corridor',
    created_at: '2026-10-18T11:20:00Z',
    citizen_name: 'Local Resident',
    upvotes: 19,
    budget_allocated: 4800,
    contractor: 'GreenPave Highway Solutions',
    imageUrl: '/new_images/images-3.jpeg',
    milestones: {
      before: '/new_images/images-3.jpeg',
      in_progress: '/new_images/repair-in-progress.jpg',
      resolved: '/new_images/repair-resolved.jpg'
    }
  },
  {
    id: 'rep-104',
    title: 'Waterlogged Pothole Cluster',
    description: 'Post-monsoon depression series with standing rainwater. Vehicles swerving into oncoming traffic lane.',
    defect_type: 'Pothole (D40)',
    severity: 'high',
    risk_score: 0.89,
    status: 'confirmed',
    latitude: 18.5913,
    longitude: 73.7389,
    location_name: 'Hinjewadi Phase 1, Near Wipro Circle',
    zone: 'Ward 19 - IT Expressway',
    created_at: '2026-10-21T07:50:00Z',
    citizen_name: 'Road User',
    upvotes: 64,
    budget_allocated: 9200,
    contractor: 'Pending Assignment',
    imageUrl: '/new_images/images-10.jpeg',
    milestones: {
      before: '/new_images/images-10.jpeg',
      in_progress: null,
      resolved: null
    }
  },
  {
    id: 'rep-105',
    title: 'Severe Trench Subsidence & Manhole Dip',
    description: '18cm deep road cut depression across two lanes. High risk of toppling for two-wheelers and severe axle impact.',
    defect_type: 'Subsidence / Trench (D40)',
    severity: 'high',
    risk_score: 0.96,
    status: 'confirmed',
    latitude: 18.5065,
    longitude: 73.8322,
    location_name: 'Karve Road, Near Nal Stop Flyover',
    zone: 'Ward 8 - Kothrud South',
    created_at: '2026-10-21T18:30:00Z',
    citizen_name: 'Pooja R.',
    upvotes: 51,
    budget_allocated: 11500,
    contractor: 'Apex Infra Projects Ltd.',
    imageUrl: '/new_images/images-5.jpeg',
    milestones: {
      before: '/new_images/images-5.jpeg',
      in_progress: null,
      resolved: null
    }
  },
  {
    id: 'rep-106',
    title: 'Crater Cavity at Metro Pier Transition',
    description: 'Sharp-edged pothole cavity measuring 1.2m across in central bus lane. Standing rainwater obscures depth during evening peak commute.',
    defect_type: 'Severe Pothole (D40)',
    severity: 'high',
    risk_score: 0.91,
    status: 'confirmed',
    latitude: 18.5604,
    longitude: 73.9168,
    location_name: 'Nagar Road, Near Phoenix Marketcity, Viman Nagar',
    zone: 'Ward 14 - Viman Nagar / Kalyani Nagar',
    created_at: '2026-10-22T06:15:00Z',
    citizen_name: 'Kunal S.',
    upvotes: 39,
    budget_allocated: 8800,
    contractor: 'Metro Roadworks Corp.',
    imageUrl: '/new_images/images-4.jpeg',
    milestones: {
      before: '/new_images/images-4.jpeg',
      in_progress: null,
      resolved: null
    }
  },
  {
    id: 'rep-107',
    title: 'Longitudinal Thermal Joint Rutting',
    description: 'Wheel rutting depth 35mm causing vehicle steering drag during lane changes. Surface aggregate raveling.',
    defect_type: 'Rutting & Longitudinal Crack (D10)',
    severity: 'medium',
    risk_score: 0.68,
    status: 'in_progress',
    latitude: 18.5638,
    longitude: 73.8077,
    location_name: 'Aundh-Baner Link Road, Near Medipoint Hospital',
    zone: 'Ward 2 - Aundh / Baner Corridor',
    created_at: '2026-10-20T11:05:00Z',
    citizen_name: 'Vikram N.',
    upvotes: 22,
    budget_allocated: 6400,
    contractor: 'GreenPave Highway Solutions',
    imageUrl: '/new_images/images-6.jpeg',
    milestones: {
      before: '/new_images/images-6.jpeg',
      in_progress: '/new_images/repair-in-progress.jpg',
      resolved: null
    }
  },
  {
    id: 'rep-108',
    title: 'Edge Spalling & Shoulder Breakdown',
    description: 'Pavement edge unraveling into unpaved shoulder over 15 meters. Lateral support loss along canal embankment.',
    defect_type: 'Edge Crack / Spalling (D30)',
    severity: 'medium',
    risk_score: 0.64,
    status: 'confirmed',
    latitude: 18.4912,
    longitude: 73.8291,
    location_name: 'Sinhagad Road, Near Rajaram Bridge',
    zone: 'Ward 11 - Sinhagad Road Corridor',
    created_at: '2026-10-19T16:20:00Z',
    citizen_name: 'Mandar J.',
    upvotes: 31,
    budget_allocated: 7900,
    contractor: 'Apex Infra Projects Ltd.',
    imageUrl: '/new_images/images-8.jpeg',
    milestones: {
      before: '/new_images/images-8.jpeg',
      in_progress: null,
      resolved: null
    }
  },
  {
    id: 'rep-109',
    title: 'Block Cracking Pattern on Approach Gradient',
    description: 'Interconnected square fatigue crack blocks spanning 20 sq meters. Moisture seepage noted at seam intersections.',
    defect_type: 'Block Cracking (D20)',
    severity: 'medium',
    risk_score: 0.70,
    status: 'in_progress',
    latitude: 18.5398,
    longitude: 73.8297,
    location_name: 'University Road / Ganeshkhind, Near Pune University Circle',
    zone: 'Ward 5 - Shivaji Nagar / Model Colony',
    created_at: '2026-10-21T13:40:00Z',
    citizen_name: 'Snehal T.',
    upvotes: 27,
    budget_allocated: 8300,
    contractor: 'Metro Roadworks Corp.',
    imageUrl: '/new_images/images-11.jpeg',
    milestones: {
      before: '/new_images/images-11.jpeg',
      in_progress: '/new_images/repair-in-progress.jpg',
      resolved: null
    }
  },
  {
    id: 'rep-110',
    title: 'Patch Deterioration & Corrugation Shoving',
    description: 'Previous cold-mix repair has pushed into 40mm asphalt ripples at signalized intersection stop line.',
    defect_type: 'Shoving / Pavement Corrugation (D30)',
    severity: 'medium',
    risk_score: 0.58,
    status: 'confirmed',
    latitude: 18.5144,
    longitude: 73.9272,
    location_name: 'Hadapsar - Solapur Road, Near Magarpatta City North Gate',
    zone: 'Ward 16 - Hadapsar / Magarpatta',
    created_at: '2026-10-22T08:00:00Z',
    citizen_name: 'Rahul K.',
    upvotes: 18,
    budget_allocated: 5200,
    contractor: 'Pending Assignment',
    imageUrl: '/new_images/images-9.jpeg',
    milestones: {
      before: '/new_images/images-9.jpeg',
      in_progress: null,
      resolved: null
    }
  }
];
