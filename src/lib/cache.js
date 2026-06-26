import AsyncStorage from '@react-native-async-storage/async-storage';

const lastScanKey = (userId) => `@skinlens/last_scan_${userId}`;
const scansKey = (userId) => `@skinlens/scans_${userId}`;
const MAX_CACHED = 20;

export async function cacheLastScan(userId, scan) {
  try {
    await AsyncStorage.setItem(lastScanKey(userId), JSON.stringify(scan));
  } catch (_) {}
}

export async function getCachedLastScan(userId) {
  try {
    const raw = await AsyncStorage.getItem(lastScanKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function cacheScans(userId, scans) {
  try {
    await AsyncStorage.setItem(scansKey(userId), JSON.stringify(scans.slice(0, MAX_CACHED)));
  } catch (_) {}
}

export async function getCachedScans(userId) {
  try {
    const raw = await AsyncStorage.getItem(scansKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function clearUserCache(userId) {
  try {
    await AsyncStorage.multiRemove([lastScanKey(userId), scansKey(userId)]);
  } catch (_) {}
}
