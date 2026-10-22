# AI Road Quality Management System — Mobile Sensing App

A React Native & Expo mobile application built for citizen road distress sensing, hardware camera inference, real-time vehicle vibration telemetry, and municipal work order integration.

---

## Academic Information
- **Institution:** Department of Computer Science & Engineering
- **Academic Year:** 2026–27
- **Guide:** Prof. Bhagyashree Udgave
- **Team Members:** Harshwardhan Galande, Shubham Kharbad, Aayush Patil, Akash Patil, Akash Deshmane

---

## Mobile Architecture & Sensors
- **Live Hardware Camera Viewfinder (`expo-camera`):** Direct hardware camera capture on Android & iOS without WebRTC or HTTPS origin limitations.
- **Pavement Roughness & Shock Telemetry (`expo-sensors`):** Real-time accelerometer z-axis vibration monitoring to measure International Roughness Index (IRI) when driving over bumps and potholes.
- **Geotagged PostGIS Telemetry (`expo-location`):** Hardware GPS tracking with heading, speed, and WGS84 coordinate geotagging.
- **Full Backend Integration:** Seamlessly posts citizen reports and distress imagery to the FastAPI backend (`/api/v1/reports/` and `/api/v1/detections/`).
- **IRC Specification Generator:** Instant Indian Road Congress engineering repair guidance and eco-friendly Warm-Mix Asphalt (WMA) alternatives.

---

## How to Run on iOS / Android

### 1. Install Dependencies
```bash
cd ai-road-quality-mobile
npm install
```

### 2. Start Expo Development Server
```bash
npm start
```
or:
```bash
npx expo start
```

### 3. Open on Your Phone
1. Install **Expo Go** from the App Store (iOS) or Google Play Store (Android).
2. Scan the QR code displayed in your terminal with your phone camera (iOS) or Expo Go app (Android).
3. The app loads instantly on your physical device with full hardware camera, GPS, and accelerometer vibration access.
