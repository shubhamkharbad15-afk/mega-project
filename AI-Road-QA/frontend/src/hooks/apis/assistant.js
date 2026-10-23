import { apiFetch, jsonHeaders } from './client.js';

export async function getRepairAdvice(defect_type, severity = 'high', road_type = 'Asphalt Highway') {
  try {
    return await apiFetch('/assistant/repair-advice', {
      method:  'POST',
      headers: jsonHeaders(),
      body:    JSON.stringify({ defect_type, severity, road_type }),
    });
  } catch {
    return buildFallbackAdvice(defect_type, severity, road_type);
  }
}

// ── Local fallback (no backend required) ─────────────────────────────────────

function buildFallbackAdvice(defect_type, severity, road_type) {
  const isPothole = defect_type.toLowerCase().includes('pothole');

  return {
    recommended_repair: isPothole
      ? 'Square cavity edges with saw cut, clean debris with compressed air lance, apply RS-1 cationic tack coat, fill in 40mm compacted lifts with Warm-Mix Asphalt (WMA), and seal with vibratory plate compactor.'
      : 'Rout crack to 15mm depth, blow clean with hot air lance, apply polymer-modified elastomeric bitumen sealant at 180°C, and top with silica sand barrier.',

    materials: isPothole
      ? ['Warm-Mix Asphalt (Grade 2)', 'RS-1 Cationic Tack Coat', '40mm-20mm Crushed Stone Aggregate']
      : ['Modified Bitumen Crack Sealant', 'Silica Sand / Mineral Filler'],

    eco_friendly_alternatives: isPothole
      ? [
          'Warm-Mix Asphalt (WMA) with chemical additives — cuts carbon footprint by 24% and emits zero toxic fumes during urban daytime compaction.',
          'Reclaimed Asphalt Pavement (RAP 40%) blend — conserves virgin bitumen and aggregates.',
          'Bio-based asphalt rejuvenators derived from pine resin / tall oil.',
        ]
      : [
          'Cold-pour plant-based emulsion sealant.',
          'Crumb rubberized bitumen (recycles discarded vehicle tyres into high-flexibility pavement sealant).',
        ],

    estimated_resources: {
      labor:               '3 skilled crew + 1 flagger',
      equipment:           'Vibratory plate compactor (90 kg), infrared joint heater, emulsion sprayer',
      priority:            severity,
      road_type:           road_type,
      estimated_cost_inr:  isPothole ? '₹5,200 - ₹7,800' : '₹1,800 - ₹3,200',
      time_to_complete:    isPothole ? '45 - 60 minutes'  : '20 - 30 minutes',
    },

    safety_notes: [
      'Deploy Class-A traffic cones 30m upstream with luminous retroreflective jackets.',
      'Ensure asphalt compaction temperature remains between 120°C and 130°C.',
      'Allow minimum 30 minutes curing before reopening lane to traffic.',
    ],
  };
}