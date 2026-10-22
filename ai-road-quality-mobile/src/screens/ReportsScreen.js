import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {
  ListFilter,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  ShieldAlert,
  X,
  ExternalLink,
} from 'lucide-react-native';
import { colors } from '../theme';

export default function ReportsScreen({ reports, setReports }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'pothole' | 'crack' | 'confirmed'
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pothole') return r.defect_type?.toLowerCase().includes('pothole') || r.title?.toLowerCase().includes('pothole');
    if (filter === 'crack') return r.defect_type?.toLowerCase().includes('crack') || r.title?.toLowerCase().includes('crack');
    if (filter === 'confirmed') return r.status === 'confirmed';
    return true;
  });

  const handleUpvote = (id) => {
    setReports(
      reports.map((r) => (r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r))
    );
  };

  const renderReportItem = ({ item }) => {
    const isPothole = item.defect_type?.toLowerCase().includes('pothole') || item.title?.toLowerCase().includes('cavity');
    const isHigh = item.severity === 'high';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedReport(item)}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' }}
          style={styles.cardThumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardBody}>
          <View style={styles.badgeRow}>
            <View style={[styles.severityBadge, { backgroundColor: isHigh ? colors.dangerLight : colors.primaryLight }]}>
              <Text style={[styles.severityText, { color: isHigh ? colors.dangerDark : colors.primaryDark }]}>
                {item.defect_type || (isPothole ? 'Pothole (D40)' : 'Road Distress')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? colors.successLight : '#F1F5F9' }]}>
              <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.successDark : colors.textSecondary }]}>
                {item.status ? item.status.toUpperCase() : 'VERIFIED'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <MapPin color={colors.textMuted} size={12} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location_name || `${item.latitude?.toFixed(4)}° N, ${item.longitude?.toFixed(4)}° E`}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.authorText}>
              By {item.citizen_name || 'Citizen'}
            </Text>
            <TouchableOpacity
              onPress={() => handleUpvote(item.id)}
              style={styles.upvoteBtn}
            >
              <ThumbsUp color={colors.primaryDark} size={12} />
              <Text style={styles.upvoteCount}>{item.upvotes || 1}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header & Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({reports.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('pothole')}
            style={[styles.filterChip, filter === 'pothole' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === 'pothole' && styles.filterTextActive]}>
              Potholes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('crack')}
            style={[styles.filterChip, filter === 'crack' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === 'crack' && styles.filterTextActive]}>
              Cracks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('confirmed')}
            style={[styles.filterChip, filter === 'confirmed' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === 'confirmed' && styles.filterTextActive]}>
              Confirmed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Reports Feed */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReportItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedReport} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeading}>Inspection Details</Text>
                  <TouchableOpacity onPress={() => setSelectedReport(null)}>
                    <X color="#64748B" size={20} />
                  </TouchableOpacity>
                </View>

                <Image
                  source={{ uri: selectedReport.imageUrl }}
                  style={styles.modalDetailImage}
                  resizeMode="cover"
                />

                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.detailTitle}>{selectedReport.title}</Text>
                  <Text style={styles.detailDesc}>{selectedReport.description}</Text>

                  <View style={styles.metaBox}>
                    <Text style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Defect Classification: </Text>
                      <Text style={styles.metaVal}>{selectedReport.defect_type}</Text>
                    </Text>
                    <Text style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Severity & Risk: </Text>
                      <Text style={styles.metaVal}>{selectedReport.severity?.toUpperCase()} ({Math.round((selectedReport.risk_score || 0.9) * 100)}%)</Text>
                    </Text>
                    <Text style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Assigned Contractor: </Text>
                      <Text style={styles.metaVal}>{selectedReport.contractor || 'Municipal Works Pool'}</Text>
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setSelectedReport(null)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Close Inspection</Text>
                </TouchableOpacity>
              </>
            )}
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
  filterBar: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  cardThumbnail: {
    width: 105,
    height: '100%',
    backgroundColor: '#0F172A',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10,
    color: colors.textMuted,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  authorText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  upvoteCount: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
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
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalDetailImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  detailDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  metaRow: {
    fontSize: 11,
  },
  metaLabel: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaVal: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
});
