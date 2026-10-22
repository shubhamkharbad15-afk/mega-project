import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MapPin,
  Layers,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  RefreshCw,
} from 'lucide-react-native';
import { colors } from '../theme';
import { fetchNearbyDistresses } from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapScreen({ reports, setReports }) {
  const [radius, setRadius] = useState(5000);
  const [selectedPin, setSelectedPin] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshDistresses = async () => {
    setIsRefreshing(true);
    const nearby = await fetchNearbyDistresses(18.5204, 73.8567, radius);
    if (nearby && nearby.length > 0) {
      setReports(nearby);
    }
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* GIS Spatial Telemetry Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>PostGIS Geospatial Grid</Text>
            <Text style={styles.headerSubtitle}>Spatial Query: ST_DWithin (SRID 4326)</Text>
          </View>
          <TouchableOpacity
            onPress={handleRefreshDistresses}
            style={styles.refreshBtn}
            disabled={isRefreshing}
          >
            <RefreshCw color={colors.primaryDark} size={14} />
            <Text style={styles.refreshText}>{isRefreshing ? 'Querying...' : 'Query 5km'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radiusRow}>
          <Text style={styles.radiusLabel}>Filter Radius:</Text>
          {[2000, 5000, 10000].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRadius(r)}
              style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
            >
              <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>
                {r / 1000} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map Coordinate Radar / Visualizer */}
      <View style={styles.mapVisualizer}>
        <View style={styles.radarCenter}>
          <Navigation color={colors.info} size={28} />
          <Text style={styles.radarCenterLabel}>Your Location (18.5204° N, 73.8567° E)</Text>
        </View>

        {/* Nearby Pothole Markers on Radar */}
        {reports.slice(0, 4).map((r, index) => {
          const isHigh = r.severity === 'high';
          const offsets = [
            { top: 40, left: 50 },
            { top: 80, right: 60 },
            { bottom: 50, left: 80 },
            { bottom: 40, right: 50 },
          ];
          const pos = offsets[index % offsets.length];

          return (
            <TouchableOpacity
              key={r.id}
              onPress={() => setSelectedPin(r)}
              style={[styles.radarPin, pos, { borderColor: isHigh ? colors.danger : colors.primary }]}
            >
              <MapPin color={isHigh ? colors.danger : colors.primaryDark} size={16} />
              <Text style={styles.radarPinText}>
                {Math.round((r.risk_score || 0.8) * 100)}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pavement Cluster List */}
      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionHeading}>Nearby Road Defects ({reports.length})</Text>

        {reports.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedPin(item)}
            style={[styles.distressItem, selectedPin?.id === item.id && styles.distressItemActive]}
          >
            <View style={styles.distressIconCol}>
              <View style={[styles.pinDot, { backgroundColor: item.severity === 'high' ? colors.danger : colors.primary }]} />
            </View>
            <View style={styles.distressBody}>
              <View style={styles.distressRow}>
                <Text style={styles.distressTitle}>{item.title}</Text>
                <Text style={styles.distressDistance}>
                  {((Math.abs(item.latitude - 18.5204) + Math.abs(item.longitude - 73.8567)) * 111).toFixed(1)} km
                </Text>
              </View>
              <Text style={styles.distressLoc}>
                {item.location_name || `${item.latitude?.toFixed(4)}°, ${item.longitude?.toFixed(4)}°`}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaBadge}>{item.defect_type || 'Pothole'}</Text>
                <Text style={styles.statusBadge}>{item.status ? item.status.toUpperCase() : 'CONFIRMED'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radiusLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  radiusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  radiusChipTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  mapVisualizer: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenter: {
    alignItems: 'center',
    gap: 6,
  },
  radarCenterLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'Courier',
  },
  radarPin: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  radarPinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distressItem: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
  },
  distressItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  distressIconCol: {
    paddingTop: 4,
    paddingRight: 10,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  distressBody: {
    flex: 1,
    gap: 4,
  },
  distressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  distressDistance: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.info,
    fontFamily: 'Courier',
  },
  distressLoc: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  metaBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.successDark,
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
