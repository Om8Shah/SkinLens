import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { generateMockResults } from '../mock/skinAnalysis';

const TOTAL_DURATION = 5000;
const CLAUDE_COLOR = '#CC6B2C';

const STAGES = [
  { label: 'Reading skin texture...', duration: 1000 },
  { label: 'Detecting conditions...', duration: 1200 },
  { label: 'Measuring severity levels...', duration: 1300 },
  { label: 'Calculating confidence scores...', duration: 1000 },
  { label: 'Finalizing analysis...', duration: 500 },
];

export default function LoadingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { photoUri } = route.params;
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const dotAnim = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(0.8)).current;
  const overallProgress = useRef(new Animated.Value(0)).current;
  const stageFade = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const secondsLeft = Math.max(0, Math.ceil((TOTAL_DURATION - elapsed) / 1000));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(thumbScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    dotLoop.start();

    Animated.timing(overallProgress, {
      toValue: 1,
      duration: TOTAL_DURATION,
      useNativeDriver: false,
    }).start();

    const ticker = setInterval(() => setElapsed((e) => e + 50), 50);

    const timers = [];
    let cumulative = 0;
    STAGES.forEach((stage, i) => {
      cumulative += stage.duration;
      if (i < STAGES.length - 1) {
        timers.push(
          setTimeout(() => {
            Animated.sequence([
              Animated.timing(stageFade, { toValue: 0, duration: 200, useNativeDriver: true }),
              Animated.timing(stageFade, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
            setStageIndex(i + 1);
          }, cumulative)
        );
      }
    });

    timers.push(
      setTimeout(() => {
        const results = generateMockResults();
        navigation.replace('Results', { photoUri, results });
      }, TOTAL_DURATION)
    );

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(ticker);
      dotLoop.stop();
    };
  }, []);

  const overallWidth = overallProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.background, Colors.creamLight]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Animated.View style={[styles.thumbnailContainer, { transform: [{ scale: thumbScale }] }]}>
          <Image source={{ uri: photoUri }} style={styles.thumbnail} />
          <View style={styles.thumbnailOverlay}>
            <Animated.View style={{ opacity: dotAnim }}>
              <Ionicons name="scan" size={32} color="rgba(255,255,255,0.9)" />
            </Animated.View>
          </View>
        </Animated.View>

        <Text style={styles.title}>Analyzing Your Skin</Text>
        <Text style={styles.subtitle}>SkinLens AI is reviewing your photo</Text>

        <View style={styles.countdownRow}>
          <View style={styles.countdownBadge}>
            <Ionicons name="timer-outline" size={16} color={Colors.primary} />
            <Text style={styles.countdownText}>~{secondsLeft}s remaining</Text>
          </View>
        </View>

        <View style={styles.overallBarBg}>
          <Animated.View style={[styles.overallBarFill, { width: overallWidth }]} />
        </View>

        <Animated.View
          style={[styles.claudeCard, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
        >
          <View style={styles.claudeCardHeader}>
            <View style={styles.claudeIconContainer}>
              <Ionicons name="sparkles" size={24} color={CLAUDE_COLOR} />
            </View>
            <View style={styles.claudeInfo}>
              <Text style={styles.claudeName}>SkinLens AI</Text>
              <Text style={styles.claudeBy}>Advanced skin analysis</Text>
            </View>
            <View style={styles.analyzingBadge}>
              <Animated.View style={[styles.analyzingDot, { opacity: dotAnim }]} />
              <Text style={styles.analyzingText}>Analyzing</Text>
            </View>
          </View>

          <View style={styles.stageRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.stageIcon} />
            <Animated.Text style={[styles.stageLabel, { opacity: stageFade }]}>
              {STAGES[stageIndex].label}
            </Animated.Text>
          </View>

          <View style={styles.stageDotsRow}>
            {STAGES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stageDot,
                  {
                    backgroundColor: i <= stageIndex ? CLAUDE_COLOR : Colors.creamLight,
                    width: i === stageIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.conditionsHint}>
          <Text style={styles.conditionsHintText}>Checking 6 conditions</Text>
          <View style={styles.conditionPills}>
            {['Tone', 'Pimples', 'Acne Marks', 'Pigment', 'Fine Lines', 'Wrinkles'].map((c) => (
              <View key={c} style={styles.conditionPill}>
                <Text style={styles.conditionPillText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  thumbnailContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 120, 156, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 24,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 10,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countdownText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  overallBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.creamLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 24,
  },
  overallBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: CLAUDE_COLOR,
  },
  claudeCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  claudeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamLight,
  },
  claudeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#CC6B2C18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  claudeInfo: { flex: 1 },
  claudeName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  claudeBy: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  analyzingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CC6B2C18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  analyzingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CLAUDE_COLOR,
  },
  analyzingText: { fontSize: 12, fontWeight: '700', color: CLAUDE_COLOR },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stageIcon: { marginRight: 8 },
  stageLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  stageDotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  stageDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.creamLight,
  },
  conditionsHint: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  conditionsHintText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  conditionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  conditionPill: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  conditionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});
