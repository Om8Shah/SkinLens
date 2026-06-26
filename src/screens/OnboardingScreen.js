import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export const ONBOARDING_KEY = '@skinlens/onboarding_complete';

const SLIDES = [
  {
    id: '1',
    accentColor: '#C2708A',
    accentBg: 'rgba(194,112,138,0.12)',
    icon: 'people-outline',
    iconSecondary: 'help-circle-outline',
    headline: 'Most people don't know their skin.',
    stat: 'Over 85% of people will experience acne in their lifetime, yet fewer than 1 in 3 ever consult a dermatologist.',
    subtext: 'SkinLens gives you dermatologist-level insight in seconds — no appointment needed.',
  },
  {
    id: '2',
    accentColor: '#D4882A',
    accentBg: 'rgba(212,136,42,0.12)',
    icon: 'warning-outline',
    iconSecondary: 'time-outline',
    headline: 'Ignoring your skin has real consequences.',
    stat: 'Untreated hyperpigmentation and acne scarring can take years to reverse. Early detection changes everything.',
    subtext: 'SkinLens detects 6 skin conditions before they become serious problems.',
  },
  {
    id: '3',
    accentColor: '#7C5CBF',
    accentBg: 'rgba(124,92,191,0.12)',
    icon: 'scan-outline',
    iconSecondary: 'sparkles-outline',
    headline: 'Your skin, analyzed by 3 AIs at once.',
    stat: null,
    subtext:
      'SkinLens uses GPT-4o, Gemini, and Perfect Corp simultaneously to give you the most accurate skin analysis available — in under 30 seconds.',
  },
];

function Slide({ item }) {
  return (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        <View style={[styles.illustrationOuter, { backgroundColor: item.accentBg }]}>
          <View style={[styles.illustrationInner, { backgroundColor: item.accentBg }]}>
            <Ionicons name={item.icon} size={72} color={item.accentColor} />
          </View>
        </View>
        <View style={[styles.secondaryIconBadge, { backgroundColor: item.accentColor }]}>
          <Ionicons name={item.iconSecondary} size={20} color="#FFF" />
        </View>
      </View>

      <Text style={styles.headline}>{item.headline}</Text>

      {item.stat ? (
        <View style={[styles.statCard, { borderLeftColor: item.accentColor }]}>
          <Text style={styles.statText}>{item.stat}</Text>
        </View>
      ) : null}

      {item.id === '3' ? (
        <View style={styles.aiRow}>
          {[
            { name: 'GPT-4o', color: '#10A37F', icon: 'chatbubble-ellipses' },
            { name: 'Gemini', color: '#4285F4', icon: 'sparkles' },
            { name: 'Perfect Corp', color: '#8B5CF6', icon: 'scan' },
          ].map((ai) => (
            <View key={ai.name} style={styles.aiChip}>
              <View style={[styles.aiDot, { backgroundColor: ai.color }]}>
                <Ionicons name={ai.icon} size={12} color="#FFF" />
              </View>
              <Text style={styles.aiName}>{ai.name}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.subtext}>{item.subtext}</Text>
    </View>
  );
}

export default function OnboardingScreen({ onDone }) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd, Colors.primarySoft]}
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      <StatusBar barStyle="dark-content" />

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {isLast ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="scan-outline" size={22} color="#FFF" />
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 160,
  },
  illustrationContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  illustrationOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIconBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 20,
    lineHeight: 36,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  aiDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: '400',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  getStartedText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
  },
  nextText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
});
