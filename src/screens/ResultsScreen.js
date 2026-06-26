import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { getConditions, getSeverityConfig, getAgreementLevel } from '../mock/skinAnalysis';
import { useAuth } from '../context/AuthContext';
import { saveScan } from '../lib/scansDb';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const CONDITIONS = getConditions();

function ConfidenceBar({ confidence, color }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: confidence,
      duration: 800,
      delay: 200,
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
        <Animated.View
          style={[styles.confidenceBarFill, { width: barWidth, backgroundColor: color }]}
        />
      </View>
      <Text style={[styles.confidenceText, { color }]}>{confidence}%</Text>
    </View>
  );
}

function ConditionRow({ condition, result }) {
  const severity = getSeverityConfig(result.severity);
  return (
    <View style={styles.conditionRow}>
      <View style={styles.conditionLeft}>
        <View style={[styles.severityDot, { backgroundColor: severity.color }]} />
        <Text style={styles.conditionName} numberOfLines={1}>{condition.label}</Text>
      </View>
      <View style={styles.conditionRight}>
        <View style={[styles.severityBadge, { backgroundColor: severity.bgColor }]}>
          <Text style={[styles.severityLabel, { color: severity.color }]}>{severity.label}</Text>
        </View>
        <ConfidenceBar confidence={result.confidence} color={severity.color} />
      </View>
    </View>
  );
}

function ApiCard({ apiData }) {
  return (
    <View style={styles.apiCard}>
      <View style={styles.apiCardHeader}>
        <View style={[styles.apiCardIcon, { backgroundColor: apiData.color + '18' }]}>
          <Ionicons name={apiData.icon} size={20} color={apiData.color} />
        </View>
        <Text style={styles.apiCardName}>{apiData.name}</Text>
        <View style={[styles.apiCardDot, { backgroundColor: apiData.color }]} />
      </View>
      <View style={styles.conditionsContainer}>
        {CONDITIONS.map((condition) => (
          <ConditionRow
            key={condition.key}
            condition={condition}
            result={apiData.results[condition.key]}
          />
        ))}
      </View>
    </View>
  );
}

function CompareView({ results }) {
  const apis = Object.values(results);
  return (
    <View style={styles.compareContainer}>
      {CONDITIONS.map((condition) => {
        const agreement = getAgreementLevel(results, condition.key);
        return (
          <View key={condition.key} style={styles.compareRow}>
            <View style={styles.compareHeader}>
              <Text style={styles.compareConditionName}>{condition.label}</Text>
              <View style={[styles.agreementBadge, { backgroundColor: agreement.color + '20' }]}>
                <Ionicons
                  name={
                    agreement.level === 'full'
                      ? 'checkmark-circle'
                      : agreement.level === 'partial'
                      ? 'alert-circle'
                      : 'close-circle'
                  }
                  size={14}
                  color={agreement.color}
                />
                <Text style={[styles.agreementText, { color: agreement.color }]}>
                  {agreement.label}
                </Text>
              </View>
            </View>
            <View style={styles.compareApis}>
              {apis.map((api) => {
                const severity = getSeverityConfig(api.results[condition.key].severity);
                return (
                  <View key={api.name} style={styles.compareApiItem}>
                    <View style={[styles.compareApiDot, { backgroundColor: api.color }]} />
                    <Text style={styles.compareApiName} numberOfLines={1}>{api.name}</Text>
                    <View style={[styles.compareSeverityBadge, { backgroundColor: severity.bgColor }]}>
                      <Text style={[styles.compareSeverityText, { color: severity.color }]}>
                        {severity.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { photoUri, results } = route.params;
  const [activeTab, setActiveTab] = useState('results');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const savedRef = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (user && !savedRef.current) {
      savedRef.current = true;
      saveScan(user.id, results);
    }
  }, [user, results]);

  const detectedCount = Object.values(results).reduce((total, api) => {
    return total + Object.values(api.results).filter((r) => r.severity !== 'not_detected').length;
  }, 0);
  const totalChecks = Object.values(results).length * CONDITIONS.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Results</Text>
        <Text style={styles.headerSubtitle}>
          {detectedCount} of {totalChecks} checks flagged across 3 models
        </Text>
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

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'results' && styles.tabActive]}
            onPress={() => setActiveTab('results')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="list"
              size={18}
              color={activeTab === 'results' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'results' && styles.tabTextActive]}>
              Results
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'compare' && styles.tabActive]}
            onPress={() => setActiveTab('compare')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="git-compare"
              size={18}
              color={activeTab === 'compare' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'compare' && styles.tabTextActive]}>
              Compare
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'results' ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 12}
              decelerationRate="fast"
              contentContainerStyle={styles.cardsRow}
            >
              {Object.entries(results).map(([key, apiData]) => (
                <ApiCard key={key} apiData={apiData} />
              ))}
            </ScrollView>
          </Animated.View>
        ) : (
          <CompareView results={results} />
        )}
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
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
  photoLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.primarySoft,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  cardsRow: {
    gap: 12,
    paddingRight: 20,
  },
  apiCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    width: CARD_WIDTH,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  apiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamLight,
  },
  apiCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  apiCardName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  apiCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conditionsContainer: {
    gap: 12,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  conditionName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  conditionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  confidenceBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.creamLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  compareContainer: {
    gap: 12,
  },
  compareRow: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamLight,
  },
  compareConditionName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  agreementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  agreementText: {
    fontSize: 11,
    fontWeight: '700',
  },
  compareApis: {
    gap: 8,
  },
  compareApiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareApiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compareApiName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    width: 100,
  },
  compareSeverityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  compareSeverityText: {
    fontSize: 11,
    fontWeight: '700',
  },
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
  scanAgainText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
