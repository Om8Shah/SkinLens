import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { getConditions, getSeverityConfig } from '../mock/skinAnalysis';
import { useAuth } from '../context/AuthContext';
import { saveScan } from '../lib/scansDb';

const { width } = Dimensions.get('window');
const CONDITIONS = getConditions();

function ConfidenceBar({ confidence, color, delay }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: confidence,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.confidenceContainer}>
      <View style={styles.confidenceBarBg}>
        <Animated.View style={[styles.confidenceBarFill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <Text style={[styles.confidenceText, { color }]}>{confidence}%</Text>
    </View>
  );
}

function ConditionCard({ condition, result, index }) {
  const severity = getSeverityConfig(result.severity);
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.conditionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.conditionLeft}>
        <View style={[styles.severityDot, { backgroundColor: severity.color }]} />
        <Text style={styles.conditionName}>{condition.label}</Text>
      </View>
      <View style={styles.conditionRight}>
        <View style={[styles.severityBadge, { backgroundColor: severity.bgColor }]}>
          <Text style={[styles.severityLabel, { color: severity.color }]}>{severity.label}</Text>
        </View>
        <ConfidenceBar confidence={result.confidence} color={severity.color} delay={index * 80 + 200} />
      </View>
    </Animated.View>
  );
}

export default function ResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { photoUri, results } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const savedRef = useRef(false);

  const claudeResults = results.claude.results;
  const detected = Object.values(claudeResults).filter((r) => r.severity !== 'not_detected');
  const detectedCount = detected.length;
  const severeCount = detected.filter((r) => r.severity === 'moderate_severe').length;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (user && !savedRef.current) {
      savedRef.current = true;
      saveScan(user.id, results);
    }
  }, [user, results]);

  const getSummaryConfig = () => {
    if (detectedCount === 0) return { label: 'Excellent skin health', color: Colors.success, icon: 'checkmark-circle' };
    if (severeCount > 1) return { label: 'Needs attention', color: Colors.danger, icon: 'alert-circle' };
    if (detectedCount <= 2) return { label: 'Mild concerns detected', color: Colors.warning, icon: 'alert-circle' };
    return { label: 'Multiple conditions found', color: Colors.warning, icon: 'information-circle' };
  };

  const summary = getSummaryConfig();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Results</Text>
        <View style={styles.claudeBadge}>
          <Ionicons name="sparkles" size={13} color="#CC6B2C" />
          <Text style={styles.claudeBadgeText}>SkinLens AI</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <LinearGradient
            colors={['transparent', 'rgba(45,32,38,0.6)']}
            style={styles.photoGradient}
          >
            <Text style={styles.photoLabel}>Analysis Complete</Text>
          </LinearGradient>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: summary.color }]}>
          <View style={styles.summaryLeft}>
            <Ionicons name={summary.icon} size={22} color={summary.color} />
            <View>
              <Text style={[styles.summaryStatus, { color: summary.color }]}>{summary.label}</Text>
              <Text style={styles.summarySubtext}>
                {detectedCount} of {CONDITIONS.length} conditions flagged
                {severeCount > 0 ? `, ${severeCount} moderate-severe` : ''}
              </Text>
            </View>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>Condition Breakdown</Text>
          <View style={styles.conditionsHeader}>
            <Text style={styles.conditionsHeaderLeft}>Condition</Text>
            <Text style={styles.conditionsHeaderRight}>Severity · Confidence</Text>
          </View>
          {CONDITIONS.map((condition, index) => (
            <ConditionCard
              key={condition.key}
              condition={condition}
              result={claudeResults[condition.key]}
              index={index}
            />
          ))}
        </Animated.View>

        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only and does not constitute medical advice.
            Consult a dermatologist for professional guidance.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.scanAgainGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="camera-outline" size={22} color="#FFF" />
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  claudeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CC6B2C18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  claudeBadgeText: { fontSize: 12, fontWeight: '700', color: '#CC6B2C' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  photoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  photoLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryStatus: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  summarySubtext: { fontSize: 13, color: Colors.textSecondary },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  conditionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  conditionsHeaderLeft: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  conditionsHeaderRight: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  conditionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  conditionName: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', flex: 1 },
  conditionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 88,
    alignItems: 'center',
  },
  severityLabel: { fontSize: 10, fontWeight: '700' },
  confidenceContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 70 },
  confidenceBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.creamLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceBarFill: { height: '100%', borderRadius: 2 },
  confidenceText: { fontSize: 10, fontWeight: '700', width: 28, textAlign: 'right' },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.creamLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  scanAgainButton: {
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  scanAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  scanAgainText: { color: '#FFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
});
