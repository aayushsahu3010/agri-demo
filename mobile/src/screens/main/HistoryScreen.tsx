import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { ScanResponse } from '../../services/api';
import { getHistory, clearHistory } from '../../services/historyStore';

const SEV_COLOR: Record<string, string> = {
  High: COLORS.severityHigh, Medium: COLORS.severityMedium,
  Low:  COLORS.severityLow,  None:   COLORS.severityNone,
};

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory]       = useState<ScanResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const h = await getHistory();
    setHistory(h);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleClear = async () => { await clearHistory(); setHistory([]); };

  const renderItem = ({ item }: { item: ScanResponse }) => {
    const sColor = SEV_COLOR[item.severity] ?? COLORS.primary;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Result', { scan: item })}
      >
        {item.image_url
          ? <Image source={{ uri: item.image_url }} style={styles.thumb} />
          : (
            <View style={[styles.thumb, { backgroundColor: COLORS.bgCardLight, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="leaf" size={24} color={COLORS.primary} />
            </View>
          )
        }
        <View style={styles.info}>
          <Text style={styles.disease} numberOfLines={1}>{item.disease_name_en}</Text>
          <Text style={styles.diseaseHi} numberOfLines={1}>{item.disease_name_hi}</Text>
          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: sColor + '22', borderColor: sColor + '55' }]}>
              <Text style={[styles.badgeText, { color: sColor }]}>{item.severity}</Text>
            </View>
            <Text style={styles.conf}>{(item.confidence * 100).toFixed(0)}%</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0D1117', '#162032']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSub}>{history.length} scan{history.length !== 1 ? 's' : ''} on device</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptyText}>Your scan results will appear here after you analyse a crop.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')} style={styles.scanNowBtn}>
            <LinearGradient colors={['#2ECC71','#27AE60']} style={styles.scanNowGrad}>
              <Text style={styles.scanNowText}>Scan a Crop →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.scan_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.lg, paddingTop: 56 },
  headerTitle:  { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  headerSub:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  clearBtn:     { padding: 10, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },

  list:         { padding: SPACING.lg, paddingTop: 0, paddingBottom: 32 },
  card:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  thumb:        { width: 56, height: 56, borderRadius: RADIUS.md },
  info:         { flex: 1 },
  disease:      { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  diseaseHi:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },
  meta:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  badge:        { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  badgeText:    { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  conf:         { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  empty:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  emptyTitle:   { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textSecondary },
  emptyText:    { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  scanNowBtn:   { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  scanNowGrad:  { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  scanNowText:  { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md },
});
