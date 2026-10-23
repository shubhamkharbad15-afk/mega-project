import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import {
  Camera,
  Compass,
  Crosshair,
  SwitchCamera,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Activity,
  Layers,
  Send,
  X,
} from 'lucide-react-native';
import { colors, typography } from '../theme';
import { runDetection, submitRoadReport } from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CitizenScreen({ reports, setReports }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Telemetry States
  const [location, setLocation] = useState({ latitude: 18.5204, longitude: 73.8567, speed: 0 });
  const [iriRoughness, setIriRoughness] = useState('IRI 1.1 (Good / Sound)');
  const [vibrationZ, setVibrationZ] = useState(0);
  const [detections, setDetections] = useState([]);
  const [customPhoto, setCustomPhoto] = useState(null);

  // Review Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const cameraRef = useRef(null);

  // 1. Live GPS Location Tracking
  useEffect(() => {
    let sub = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (loc) => {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speed: Math.round((loc.coords.speed || 0) * 3.6), // km/h
            });
          }
        );
      }
    })();
    return () => {
      if (sub) sub.remove();
    };
  }, []);

  // 2. Accelerometer Road Bump / Pothole Vibration Sensing
  useEffect(() => {
    Accelerometer.setUpdateInterval(250);
    const sub = Accelerometer.addListener(({ z }) => {
      setVibrationZ(Math.round(z * 100) / 100);
      // Spike detection (> 1.45g or < 0.55g indicates vertical tire jolt over cavity)
      if (Math.abs(z - 1.0) > 0.45) {
        setIriRoughness('IRI 5.2 (Cavity Shock Bump Detected!)');
      } else if (Math.abs(z - 1.0) > 0.2) {
        setIriRoughness('IRI 2.8 (Fair / Moderate Unevenness)');
      } else {
        setIriRoughness('IRI 1.1 (✓ Sound Road Pavement)');
      }
    });
    return () => sub.remove();
  }, []);

  // 3. Take Photo & Run Inference
  const handleCapturePhoto = async () => {
    if (cameraRef.current && isCameraActive) {
      try {
        setIsDetecting(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setCustomPhoto(photo.uri);
        
        // Run YOLO detection
        const result = await runDetection(photo.uri, location.latitude, location.longitude);
        setDetections(result.detections || []);
        
        const hasPothole = result.detections && result.detections.length > 0;
        setReviewData({
          title: hasPothole ? 'Pothole (D40) Cavity Detected' : 'Sound Pavement Verification',
          description: hasPothole
            ? `Vision sensor detected pavement cavity with ${Math.round((result.confidence || 0.9) * 100)}% confidence at GPS coords.`
            : 'Pavement audit confirmed smooth roadway surface meeting municipal standards.',
          defect_type: hasPothole ? 'Pothole (D40)' : 'Sound Pavement',
          severity: hasPothole ? (result.severity || 'high') : 'low',
          imageUrl: photo.uri,
          risk_score: result.risk_score || (hasPothole ? 0.92 : 0.0),
        });
        setReportTitle(hasPothole ? 'Deep Cavity on Carriage Way' : 'Routine Road Audit - Pavement Sound');
        setReportDesc(hasPothole ? 'Pavement surface cavity in vehicle wheelpath. High risk for two-wheelers.' : 'Road surface in sound condition.');
        setModalVisible(true);
      } catch (err) {
        console.warn('Capture error:', err);
      } finally {
        setIsDetecting(false);
      }
    } else if (isSimulating) {
      // Trigger simulation snapshot
      const simUri = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
      setReviewData({
        title: 'Pothole (D40) Road Distress',
        description: 'Simulated road scanner logged pavement cavity with 94% confidence.',
        defect_type: 'Pothole (D40)',
        severity: 'high',
        imageUrl: simUri,
        risk_score: 0.94,
      });
      setReportTitle('Deep Cavity on Express Lane');
      setReportDesc('14cm deep cavity in right wheel path. Poses high risk of rim damage.');
      setModalVisible(true);
    }
  };

  // 4. Submit Report
  const handleSubmitReport = async () => {
    if (!reviewData) return;
    setIsSubmitting(true);
    const newReport = await submitRoadReport({
      title: reportTitle,
      description: reportDesc,
      defect_type: reviewData.defect_type,
      severity: reviewData.severity,
      latitude: location.latitude,
      longitude: location.longitude,
      evidence: [reviewData.imageUrl],
      imageUrl: reviewData.imageUrl,
      citizen_name: 'Citizen Reporter',
      upvotes: 1,
    });

    setReports([newReport, ...reports]);
    setIsSubmitting(false);
    setModalVisible(false);
    setToastMessage('✓ Road report submitted to Municipal Corporation!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <View style={styles.container}>
      {/* Toast Alert */}
      {toastMessage && (
        <View style={styles.toast}>
          <CheckCircle2 color="#FFFFFF" size={18} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Viewport Frame */}
      <View style={styles.viewportContainer}>
        {isCameraActive && permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            enableTorch={torch}
          />
        ) : isSimulating ? (
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' }}
            style={styles.camera}
            resizeMode="cover"
          />
        ) : customPhoto ? (
          <Image
            source={{ uri: customPhoto }}
            style={styles.camera}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.standbyView}>
            <View style={styles.standbyIconCircle}>
              <Camera color={colors.primary} size={32} />
            </View>
            <Text style={styles.standbyTitle}>Hardware Sensing Standby</Text>
            <Text style={styles.standbySubtitle}>
              Activate phone camera for real-time pavement scanning, or start simulation.
            </Text>
            <View style={styles.standbyButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  if (!permission?.granted) requestPermission();
                  setIsCameraActive(true);
                  setIsSimulating(false);
                }}
                style={styles.primaryBtn}
              >
                <Camera color="#000" size={16} />
                <Text style={styles.primaryBtnText}>Start Live Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsSimulating(true);
                  setIsCameraActive(false);
                }}
                style={styles.secondaryBtn}
              >
                <Play color="#FFF" size={16} fill="#FFF" />
                <Text style={styles.secondaryBtnText}>Road Simulator</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Telemetry HUD Overlays */}
        {(isCameraActive || isSimulating) && (
          <>
            <View style={styles.topHudLeft}>
              <View style={styles.hudRow}>
                <Compass color={colors.info} size={12} />
                <Text style={styles.hudCoordinates}>
                  {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                </Text>
              </View>
              <Text style={styles.hudText}>
                SPEED: <Text style={styles.hudBold}>{location.speed} km/h</Text>
              </Text>
              <Text style={styles.hudText}>
                Z-GFORCE: <Text style={styles.hudBold}>{vibrationZ}g</Text>
              </Text>
            </View>

            <View style={styles.topHudRight}>
              <Text style={styles.hudLabel}>ROAD SURFACE</Text>
              <Text style={styles.hudRoughnessText}>{iriRoughness}</Text>
              <Text style={styles.hudEngine}>YOLOv11 Edge</Text>
            </View>

            {/* In-Camera Action Controls */}
            <View style={styles.bottomHudBar}>
              {isCameraActive ? (
                <View style={styles.cameraControlsRow}>
                  <TouchableOpacity
                    onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                    style={styles.iconCircleBtn}
                  >
                    <SwitchCamera color="#0F172A" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTorch(!torch)}
                    style={styles.iconCircleBtn}
                  >
                    {torch ? <Zap color="#F59E0B" size={18} /> : <ZapOff color="#475569" size={18} />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsCameraActive(false);
                      setTorch(false);
                    }}
                    style={[styles.iconCircleBtn, { backgroundColor: '#FEE2E2' }]}
                  >
                    <Square color="#DC2626" size={16} fill="#DC2626" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setIsSimulating(false);
                    setCustomPhoto(null);
                  }}
                  style={styles.stopSimBtn}
                >
                  <Square color="#FFF" size={14} fill="#FFF" />
                  <Text style={styles.stopSimText}>Stop Simulation</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleCapturePhoto}
                disabled={isDetecting}
                style={styles.captureSnapBtn}
              >
                {isDetecting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Crosshair color="#FFF" size={16} />
                    <Text style={styles.captureSnapText}>Capture & Audit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Sensor Dashboard Cards */}
      <ScrollView style={styles.telemetryScroll} contentContainerStyle={styles.telemetryContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity color={colors.primary} size={18} />
            <Text style={styles.cardTitle}>Pavement Distress & Roughness (IRI)</Text>
          </View>
          <Text style={styles.roughnessDisplay}>{iriRoughness}</Text>
          <Text style={styles.cardDesc}>
            Real-time vertical G-force sensor measures suspension shocks over pavement cavities and humps.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Layers color={colors.info} size={18} />
            <Text style={styles.cardTitle}>Geotagged Civic Sensing</Text>
          </View>
          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Latitude</Text>
              <Text style={styles.metricValue}>{location.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Longitude</Text>
              <Text style={styles.metricValue}>{location.longitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>GPS Speed</Text>
              <Text style={styles.metricValue}>{location.speed} km/h</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>SRID</Text>
              <Text style={styles.metricValue}>4326 (WGS84)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Review Snapshot Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <AlertTriangle color={colors.primary} size={20} />
                <Text style={styles.modalHeading}>Review Road Audit</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748B" size={20} />
              </TouchableOpacity>
            </View>

            {reviewData?.imageUrl && (
              <Image source={{ uri: reviewData.imageUrl }} style={styles.modalImage} resizeMode="cover" />
            )}

            <Text style={styles.inputLabel}>Report Title:</Text>
            <TextInput
              style={styles.textInput}
              value={reportTitle}
              onChangeText={setReportTitle}
            />

            <Text style={styles.inputLabel}>Remarks / Landmark Details:</Text>
            <TextInput
              style={[styles.textInput, { height: 60 }]}
              multiline
              value={reportDesc}
              onChangeText={setReportDesc}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.discardBtn}
              >
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={isSubmitting}
                style={styles.submitBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Send color="#FFF" size={16} />
                    <Text style={styles.submitText}>Dispatch to Municipal Portal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  toast: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    backgroundColor: colors.successDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 99,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  toastText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  viewportContainer: {
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  standbyView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  standbyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  standbyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  standbySubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    maxWidth: 280,
  },
  standbyButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  primaryBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  secondaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  topHudLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 8,
    borderRadius: 10,
    gap: 2,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hudCoordinates: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: colors.info,
  },
  hudText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#475569',
  },
  hudBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  topHudRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 8,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  hudLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
  },
  hudRoughnessText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.dangerDark,
  },
  hudEngine: {
    fontSize: 8,
    color: colors.successDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bottomHudBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraControlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  stopSimText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  captureSnapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  captureSnapText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  telemetryScroll: {
    flex: 1,
  },
  telemetryContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roughnessDisplay: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dangerDark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    width: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  discardBtn: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  discardText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
