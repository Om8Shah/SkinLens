import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { generateMockResults } from '../mock/skinAnalysis';

const TOTAL_DURATION = 5200;
const TICK_INTERVAL = 50;

const API_STEPS = [
  { key: 'gpt4o', name: 'GPT-4o', icon: 'chatbubble-ellipses', color: Colors.gpt4o },
  { key: 'gemini', name: 'Gemini 1.5 Pro', icon: 'sparkles', color: Colors.gemini },
  { key: 'perfectCorp', name: 'Perfect Corp', icon: 'scan', color: Colors.perfectCorp },
];

function ApiProgressItem({ step, status, delay }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const targetProgress = status === 'waiting' ? 0.15 : status === 'analyzing' ? 0.6 : 1;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'waiting':
        return { label: 'Waiting...', color: Colors.textMuted };
      case 'analyzing':
        return { label: 'Analyzing...', color: step.color };
      case 'done':
        return { label: 'Done', color: Colors.success };
      default:
        return { label: '', color: Colors.textMuted };
    }
  };

  const statusConfig = getStatusConfig();
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.apiItem,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.apiIconContainer, { backgroundColor: step.color + '18' }]}>
        <Ionicons name={step.icon} size={22} color={step.color} />
      </View>
      <View style={styles.apiInfo}>
        <View style={styles.apiHeader}>
          <Text style={styles.apiName}>{step.name}</Text>
          <View style={styles.statusBadge}>
            {status === 'done' && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            )}
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
                backgroundColor: status === 'done' ? Colors.success : step.color,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

export default function LoadingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { photoUri } = route.params;
  const [statuses, setStatuses] = useState({
    gpt4o: 'waiting',
    gemini: 'waiting',
    perfectCorp: 'waiting',
  });
  const [elapsed, setElapsed] = useState(0);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(0.8)).current;
  const overallProgress = useRef(new Animated.Value(0)).current;

  const secondsLeft = Math.max(0, Math.ceil((TOTAL_DURATION - elapsed) / 1000));
  const doneCount = Object.values(statuses).filter((s) => s === 'done').length;

  useEffect(() => {
    Animated.spring(thumbScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    dotLoop.start();

    Animated.timing(overallProgress, {
      toValue: 1,
      duration: TOTAL_DURATION,
      useNativeDriver: false,
    }).start();

    const ticker = setInterval(() => {
      setElapsed((e) => e + TICK_INTERVAL);
    }, TICK_INTERVAL);

    const timers = [];
    timers.push(setTimeout(() => setStatuses((s) => ({ ...s, gpt4o: 'analyzing' })), 800));
    timers.push(setTimeout(() => setStatuses((s) => ({ ...s, gemini: 'analyzing' })), 1600));
    timers.push(setTimeout(() => setStatuses((s) => ({ ...s, perfectCorp: 'analyzing' })), 2200));
    timers.push(setTimeout(() => setStatuses((s) => ({ ...s, gpt4o: 'done' })), 3000));
    timers.push(setTimeout(() => setStatuses((s) => ({ ...s, gemini: 'done' })), 3800));
    timers.push(setTimeout(() => setStatuses((s) => ({ ...s, perfectCorp: 'done' })), 4500));

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
        <Text style={styles.funMessage}>Consulting 3 AI experts on your skin...</Text>

        <View style={styles.countdownRow}>
          <View style={styles.countdownBadge}>
            <Ionicons name="timer-outline" size={16} color={Colors.primary} />
            <Text style={styles.countdownText}>~{secondsLeft}s remaining</Text>
          </View>
          <Text style={styles.progressLabel}>{doneCount}/3 complete</Text>
        </View>

        <View style={styles.overallBarBg}>
          <Animated.View style={[styles.overallBarFill, { width: overallWidth }]} />
        </View>

        <View style={styles.apiList}>
          {API_STEPS.map((step, index) => (
            <ApiProgressItem
              key={step.key}
              step={step}
              status={statuses[step.key]}
              delay={index * 300}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
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
    marginBottom: 8,
  },
  funMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 24,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  overallBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.creamLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 28,
  },
  overallBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  apiList: {
    width: '100%',
    gap: 14,
  },
  apiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  apiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  apiInfo: {
    flex: 1,
  },
  apiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  apiName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.creamLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
