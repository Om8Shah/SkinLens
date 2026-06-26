import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getCachedLastScan } from '../lib/cache';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [lastScan, setLastScan] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const hookFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      getCachedLastScan(user.id).then(setLastScan);
    }
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(hookFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }).start();
    });

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd, Colors.primarySoft]}
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity
        style={[styles.settingsButton, { top: insets.top + 12 }]}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <View style={styles.settingsIconContainer}>
          <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="scan-outline" size={48} color={Colors.primary} />
          </View>
        </View>

        <Text style={styles.appName}>SkinLens</Text>
        <Text style={styles.tagline}>Understand your skin in seconds</Text>

        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="camera-outline" size={26} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Scan My Skin</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {lastScan ? (
        <Animated.View
          style={[
            styles.retentionHook,
            { opacity: hookFade, marginBottom: insets.bottom + 20 },
          ]}
        >
          <TouchableOpacity
            style={styles.retentionCard}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.8}
          >
            <View style={styles.retentionDot} />
            <Text style={styles.retentionText}>
              Last scan:{' '}
              <Text style={styles.retentionBold}>
                {lastScan.conditions_detected} condition
                {lastScan.conditions_detected !== 1 ? 's' : ''} detected
              </Text>{' '}
              — tap to scan again
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  settingsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  buttonContainer: {
    marginTop: 44,
    width: width - 80,
  },
  scanButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  retentionHook: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
  },
  retentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  retentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    marginRight: 10,
  },
  retentionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  retentionBold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
