import { supabase } from './supabase';
import { cacheLastScan, cacheScans, getCachedScans } from './cache';

export async function saveScan(userId, results) {
  const conditionsDetected = Object.values(results).reduce((total, api) => {
    return (
      total +
      Object.values(api.results).filter((r) => r.severity !== 'not_detected').length
    );
  }, 0);

  const { data, error } = await supabase
    .from('scans')
    .insert({ user_id: userId, results, conditions_detected: conditionsDetected })
    .select()
    .single();

  if (error || !data) return { data: null, error };

  await cacheLastScan(userId, data);
  const existing = await getCachedScans(userId);
  await cacheScans(userId, [data, ...existing]);

  return { data, error: null };
}

export async function fetchScans(userId) {
  const { data, error } = await supabase
    .from('scans')
    .select('id, conditions_detected, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!error && data?.length) {
    await cacheScans(userId, data);
    await cacheLastScan(userId, data[0]);
  }

  return { data: data ?? [], error };
}
