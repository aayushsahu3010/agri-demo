/**
 * HomeScreen.tsx
 * ─────────────────────────────────────────────────────────
 * Dashboard — Greeting, quick-scan CTA, stat cards,
 * recent scan history preview.
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { ScanResponse, DEMO_MODE } from '../../services/api';
import { getHistory } from '../../services/historyStore';

// ── Severity badge helper ─────────────────────────────────
const SEVERITY_COLOR: Record<string, string> = {
  High:   COLORS.severityHigh,
  Medium: COLORS.severityMedium,
  Low:    COLORS.severityLow,
  None:   COLORS.severityNone,
};

function SeverityBadge({ level }: { level: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: SEVERITY_COLOR[level] + '22', borderColor: SEVERITY_COLOR[level] + '55' }]}>
      <Text style={[styles.badgeText, { color: SEVERITY_COLOR[level] }]}>{level}</Text>
    </View>
  );
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [history, setHistory]       = useState<ScanResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    const h = await getHistory();
    setHistory(h.slice(0, 5)); // show latest 5 on home
  };

  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const totalScans  = history.length;
  const diseased    = history.filter(s => !s.is_healthy).length;
  const healthy     = history.filter(s =>  s.is_healthy).length;

  return (
    <LinearGradient colors={['#0D1117', '#162032']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Demo Banner ── */}
        {DEMO_MODE && (
          <View style={styles.demoBanner}>
            <Ionicons name="flask" size={14} color="#F39C12" />
            <Text style={styles.demoText}>
              Demo Mode — AI results are simulated. Set{' '}
              <Text style={{ fontWeight: '800' }}>DEMO_MODE = false</Text>
              {' '}in api.ts to use the real backend.
            </Text>
          </View>
        )}

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Jai Kisan 🌾</Text>
            <Text style={styles.name}>{user?.name ?? 'Farmer'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Hero CTA ── */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Scan')}
        >
          <LinearGradient
            colors={['#2ECC71', '#27AE60']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCta}
          >
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Scan Your Crop</Text>
              <Text style={styles.heroSubtitle}>Get instant AI diagnosis & treatment plan</Text>
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>Start Scan →</Text>
              </View>
            </View>
            <Ionicons name="scan" size={72} color="rgba(255,255,255,0.25)" style={styles.heroIcon} />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Stats ── */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <StatCard icon="leaf"         value={String(totalScans)} label="Total Scans" color={COLORS.primary}    />
          <StatCard icon="alert-circle" value={String(diseased)}   label="Diseased"    color={COLORS.danger}     />
          <StatCard icon="checkmark-circle" value={String(healthy)} label="Healthy"   color={COLORS.severityNone} />
        </View>

        {/* ── Recent Scans ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          )}
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="camera-outline" size={44} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>Tap "Start Scan" above to diagnose your first crop</Text>
          </View>
        ) : (
          history.map((scan) => (
            <TouchableOpacity
              key={scan.scan_id}
              style={styles.scanCard}
              activeOpacity={0.82}
              onPress={() => navigation.navigate('Result', { scan })}
            >
              {scan.image_url ? (
                <Image source={{ uri: scan.image_url }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgCardLight }]}>
                  <Ionicons name="leaf" size={28} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.scanInfo}>
                <Text style={styles.scanDisease} numberOfLines={1}>
                  {scan.disease_name_en}
                </Text>
                <Text style={styles.scanCrop} numberOfLines={1}>
                  {scan.disease_name_hi}
                </Text>
                <View style={styles.scanMeta}>
                  <SeverityBadge level={scan.severity} />
                  <Text style={styles.scanConf}>{(scan.confidence * 100).toFixed(0)}% confident</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))
        )}

        {/* ── Tip Card ── */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={20} color={COLORS.accent} />
          <Text style={styles.tipText}>
            <Text style={{ color: COLORS.accent, fontWeight: '700' }}>Pro Tip: </Text>
            Take photos in bright natural light for best AI accuracy.
          </Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { padding: SPACING.lg, paddingTop: 56, paddingBottom: 32 },

  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  greeting:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  name:         { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  notifBtn:     { padding: 8, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },

  heroCta:      { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl, overflow: 'hidden', flexDirection: 'row' },
  heroLeft:     { flex: 1 },
  heroTitle:    { fontSize: FONTS.sizes.xl, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroSubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.md, lineHeight: 20 },
  heroBtn:      { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  heroBtnText:  { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.sm },
  heroIcon:     { position: 'absolute', right: -8, bottom: -8 },

  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm, marginTop: SPACING.lg },
  seeAll:       { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  statsRow:     { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard:     {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', gap: 4,
    borderWidth: 1,
  },
  statValue:    { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  statLabel:    { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },

  emptyCard:    {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  emptyTitle:   { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textSecondary },
  emptyText:    { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },

  scanCard:     {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  thumb:        { width: 56, height: 56, borderRadius: RADIUS.md },
  scanInfo:     { flex: 1 },
  scanDisease:  { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  scanCrop:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },
  scanMeta:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  scanConf:     { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  badge:        { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  badgeText:    { fontSize: FONTS.sizes.xs, fontWeight: '700' },

  tipCard:      {
    flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start',
    backgroundColor: 'rgba(243,156,18,0.08)', borderRadius: RADIUS.lg,
    padding: SPACING.md, marginTop: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(243,156,18,0.2)',
  },
  tipText:      { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },

  demoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(243,156,18,0.1)', borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(243,156,18,0.35)',
  },
  demoText: { flex: 1, fontSize: FONTS.sizes.xs, color: '#F39C12', lineHeight: 18 },
});
