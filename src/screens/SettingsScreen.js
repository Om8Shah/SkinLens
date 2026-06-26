import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const API_FIELDS = [
  {
    key: 'aiService',
    label: 'AI Service Key',
    placeholder: 'sk-...',
    icon: 'sparkles',
    color: Colors.claude,
  },
];

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [keys, setKeys] = useState({ aiService: '' });
  const [showKeys, setShowKeys] = useState({ aiService: false });

  const updateKey = (field, value) => {
    setKeys((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShow = (field) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI Integration Coming Soon</Text>
            <Text style={styles.infoText}>
              Add your AI service key to enable real-time skin analysis.
              The app currently uses simulated results for demonstration.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>API Keys</Text>

        {API_FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: field.color + '18' }]}>
                <Ionicons name={field.icon} size={18} color={field.color} />
              </View>
              <Text style={styles.fieldLabel}>{field.label}</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textMuted}
                value={keys[field.key]}
                onChangeText={(v) => updateKey(field.key, v)}
                secureTextEntry={!showKeys[field.key]}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => toggleShow(field.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showKeys[field.key] ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About SkinLens</Text>
          <Text style={styles.aboutText}>
            SkinLens uses multiple AI models to analyze facial skin conditions
            including uneven skin tone, pimples, acne marks, hyperpigmentation,
            and wrinkles.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.accountEmail} numberOfLines={1}>{user?.email}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#E07070" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primarySoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '40',
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  fieldCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  aboutSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  accountSection: {
    marginTop: 16,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  accountEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E07070',
  },
});
