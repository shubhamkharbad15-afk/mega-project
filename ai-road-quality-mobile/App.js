import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Camera,
  MapPin,
  ListFilter,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from './src/theme';
import { initialReports, checkBackendHealth } from './src/api';
import CitizenScreen from './src/screens/CitizenScreen';
import MapScreen from './src/screens/MapScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AdviceScreen from './src/screens/AdviceScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'map' | 'reports' | 'advice'
  const [reports, setReports] = useState(initialReports);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    async function verifyHealth() {
      const health = await checkBackendHealth();
      setBackendStatus(health.status === 'healthy' ? 'connected' : 'offline');
    }
    verifyHealth();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Application Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.logoBadge}>
            <Layers color="#0F172A" size={18} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>AI Road Quality</Text>
              <View style={styles.projectTag}>
                <Text style={styles.projectTagText}>MOBILE</Text>
              </View>
            </View>
            <Text style={styles.teamSubtitle}>
              Final Year Mega Project • CSE 2026–27
            </Text>
          </View>
        </View>

        <View style={[styles.statusPill, backendStatus === 'connected' ? styles.statusOnline : styles.statusOffline]}>
          <View style={[styles.statusDot, backendStatus === 'connected' ? styles.dotOnline : styles.dotOffline]} />
          <Text style={[styles.statusText, backendStatus === 'connected' ? styles.statusTextOnline : styles.statusTextOffline]}>
            {backendStatus === 'connected' ? 'API ONLINE' : 'LOCAL MOCK'}
          </Text>
        </View>
      </View>

      {/* Main Screen Content */}
      <View style={styles.contentArea}>
        {activeTab === 'camera' && (
          <CitizenScreen reports={reports} setReports={setReports} />
        )}
        {activeTab === 'map' && (
          <MapScreen reports={reports} setReports={setReports} />
        )}
        {activeTab === 'reports' && (
          <ReportsScreen reports={reports} setReports={setReports} />
        )}
        {activeTab === 'advice' && (
          <AdviceScreen />
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('camera')}
          style={[styles.tabButton, activeTab === 'camera' && styles.tabButtonActive]}
        >
          <Camera
            color={activeTab === 'camera' ? colors.primaryDark : colors.textMuted}
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'camera' && styles.tabLabelActive]}>
            Sensing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('map')}
          style={[styles.tabButton, activeTab === 'map' && styles.tabButtonActive]}
        >
          <MapPin
            color={activeTab === 'map' ? colors.primaryDark : colors.textMuted}
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'map' && styles.tabLabelActive]}>
            GIS Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('reports')}
          style={[styles.tabButton, activeTab === 'reports' && styles.tabButtonActive]}
        >
          <ListFilter
            color={activeTab === 'reports' ? colors.primaryDark : colors.textMuted}
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'reports' && styles.tabLabelActive]}>
            Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('advice')}
          style={[styles.tabButton, activeTab === 'advice' && styles.tabButtonActive]}
        >
          <Sparkles
            color={activeTab === 'advice' ? colors.primaryDark : colors.textMuted}
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'advice' && styles.tabLabelActive]}>
            IRC Advice
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  projectTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  projectTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
    fontFamily: 'Courier',
  },
  teamSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Courier',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusOnline: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusOffline: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: colors.successDark,
  },
  dotOffline: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  statusTextOnline: {
    color: colors.successDark,
  },
  statusTextOffline: {
    color: colors.textSecondary,
  },
  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 6,
    paddingBottom: Platform.OS === 'ios' ? 12 : 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabButtonActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    marginTop: -2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
