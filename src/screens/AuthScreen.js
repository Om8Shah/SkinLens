import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Check your email for a confirmation link, then sign in.');
        setMode('login');
      }
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd, Colors.primarySoft]}
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="scan-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>SkinLens</Text>
          <Text style={styles.tagline}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </Text>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => switchMode('login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => switchMode('signup')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {successMsg ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color="#6BBF8A" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.warning} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', paddingHorizontal: 24, alignItems: 'center' },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 28,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#FFF' },
  tabText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 24,
    alignSelf: 'stretch',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F7EE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: { flex: 1, fontSize: 13, color: '#3A8A5A', lineHeight: 18 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  submitButton: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: 17, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
});
