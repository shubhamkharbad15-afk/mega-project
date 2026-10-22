import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Clock,
  IndianRupee,
  Wrench,
  AlertTriangle,
  Send,
} from 'lucide-react-native';
import { colors } from '../theme';
import { getRepairAdvice } from '../api';

export default function AdviceScreen() {
  const [defectType, setDefectType] = useState('pothole');
  const [severity, setSeverity] = useState('high');
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    const result = await getRepairAdvice(defectType, severity, 'Urban Arterial Road');
    setAdvice(result);
    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Configuration Header Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Sparkles color={colors.primaryDark} size={18} />
          <Text style={styles.cardTitle}>IRC Repair & Material Guidance</Text>
        </View>
        <Text style={styles.cardDesc}>
          Generates engineering methodology and eco-friendly cold-pour/WMA alternatives per Indian Road Congress standards.
        </Text>

        <Text style={styles.inputLabel}>Select Road Distress Type:</Text>
        <View style={styles.buttonRow}>
          {[
            { id: 'pothole', label: 'Pothole (D40)' },
            { id: 'crack', label: 'Crack (D10)' },
            { id: 'alligator', label: 'Alligator (D20)' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setDefectType(item.id)}
              style={[styles.selectorChip, defectType === item.id && styles.selectorChipActive]}
            >
              <Text style={[styles.selectorText, defectType === item.id && styles.selectorTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Severity Level:</Text>
        <View style={styles.buttonRow}>
          {['low', 'medium', 'high'].map((sev) => (
            <TouchableOpacity
              key={sev}
              onPress={() => setSeverity(sev)}
              style={[styles.selectorChip, severity === sev && styles.selectorChipActive]}
            >
              <Text style={[styles.selectorText, severity === sev && styles.selectorTextActive]}>
                {sev.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleGenerateAdvice}
          disabled={isLoading}
          style={styles.generateBtn}
        >
          {isLoading ? (
            <ActivityIndicator color="#0F172A" size="small" />
          ) : (
            <>
              <Sparkles color="#0F172A" size={16} />
              <Text style={styles.generateBtnText}>Generate Specifications</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Generated Advisory Result */}
      {advice && (
        <View style={styles.resultContainer}>
          {/* Engineering Methodology */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Wrench color={colors.info} size={16} />
              <Text style={styles.resultHeading}>Recommended Engineering Procedure</Text>
            </View>
            <Text style={styles.procedureText}>{advice.recommended_repair}</Text>
          </View>

          {/* Eco-Friendly Alternatives */}
          <View style={[styles.card, { borderColor: colors.successDark }]}>
            <View style={styles.cardHeader}>
              <Leaf color={colors.successDark} size={16} />
              <Text style={[styles.resultHeading, { color: colors.successDark }]}>
                Eco-Friendly Sustainable Materials
              </Text>
            </View>
            {advice.eco_friendly_alternatives?.map((item, idx) => (
              <View key={idx} style={styles.ecoRow}>
                <Text style={styles.ecoBullet}>•</Text>
                <Text style={styles.ecoText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Budget & Resources */}
          {advice.estimated_resources && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <IndianRupee color={colors.primaryDark} size={16} />
                <Text style={styles.resultHeading}>Estimated Resources & Cost</Text>
              </View>
              <View style={styles.resourceGrid}>
                <View style={styles.resourceItem}>
                  <Text style={styles.resourceLabel}>Budget (INR)</Text>
                  <Text style={styles.resourceVal}>{advice.estimated_resources.estimated_cost_inr}</Text>
                </View>
                <View style={styles.resourceItem}>
                  <Text style={styles.resourceLabel}>Crew Work Time</Text>
                  <Text style={styles.resourceVal}>{advice.estimated_resources.time_to_complete}</Text>
                </View>
                <View style={styles.resourceItem}>
                  <Text style={styles.resourceLabel}>Manpower</Text>
                  <Text style={styles.resourceVal}>{advice.estimated_resources.labor}</Text>
                </View>
                <View style={styles.resourceItem}>
                  <Text style={styles.resourceLabel}>Priority Tier</Text>
                  <Text style={[styles.resourceVal, { color: colors.danger }]}>
                    {advice.estimated_resources.priority?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Safety Protocols */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ShieldCheck color={colors.primaryDark} size={16} />
              <Text style={styles.resultHeading}>IRC Traffic Safety Requirements</Text>
            </View>
            {advice.safety_notes?.map((note, idx) => (
              <View key={idx} style={styles.ecoRow}>
                <Text style={styles.ecoBullet}>✓</Text>
                <Text style={styles.ecoText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 14,
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
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  selectorChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectorTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultContainer: {
    gap: 12,
  },
  resultHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  procedureText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  ecoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  ecoBullet: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.successDark,
    lineHeight: 18,
  },
  ecoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  resourceItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  resourceVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
