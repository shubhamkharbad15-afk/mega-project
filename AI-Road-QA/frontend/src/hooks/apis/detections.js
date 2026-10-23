import { getAuthToken } from './client.js';

const FALLBACK_DETECTION = {
  source:        'client_fallback',
  is_demo:       true,
  warning:       'Backend detection was unavailable. This is a fallback response, not an image-analysis result.',
  detected:      false,
  defect_type:   null,
  confidence:    0.0,
  severity:      'low',
  risk_score:    0.0,
  model_version: 'yolov11-edge-tflite',
  detections:    [],
  image_url:     null,
};

export async function runDetection(fileOrBlob, latitude = 18.5204, longitude = 73.8567) {
  const formData = new FormData();
  formData.append('image', fileOrBlob);
  formData.append('latitude', String(latitude));
  formData.append('longitude', String(longitude));

  const headers = {};
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch('/api/v1/detections/', { method: 'POST', headers, body: formData });
    if (!res.ok) throw new Error(`Detection endpoint returned status ${res.status}`);
    return await res.json();
  } catch {
    return {
      ...FALLBACK_DETECTION,
      detection_id: `local-${Math.random().toString(36).substring(2, 9)}`,
      location: { latitude, longitude },
    };
  }
}