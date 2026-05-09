import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { ScanResponse } from '../../services/api';

const SEV_COLOR: Record<string, string> = {
  High: COLORS.severityHigh, Medium: COLORS.severityMedium,
  Low:  COLORS.severityLow,  None:   COLORS.severityNone,
};
const SEV_ICON: Record<string, string> = {
  High: 'alert-circle', Medium: 'warning',
  Low: 'information-circle', None: 'checkmark-circle',
};

function ConfBar({ label, value }: { label: string; value: number }) {
  const fill = value > 0.7 ? COLORS.primary : value > 0.4 ? COLORS.accent : COLORS.danger;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
      <Text style={{ width: 140, fontSize: 11, color: COLORS.textSecondary }} numberOfLines={1}>{label}</Text>
      <View style={{ flex: 1, height: 6, backgroundColor: COLORS.bgCardLight, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ flex: value, height: '100%', backgroundColor: fill, borderRadius: 3, maxWidth: `${(value * 100).toFixed(0)}%` as any }} />
      </View>
      <Text style={{ width: 42, fontSize: 11, color: COLORS.textSecondary, textAlign: 'right' }}>{(value * 100).toFixed(1)}%</Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }: any) {
  const { scan }: { scan: ScanResponse } = route.params;
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const insets = useSafeAreaInsets();
  const isHi = lang === 'hi';
  const sColor = SEV_COLOR[scan.severity] ?? COLORS.primary;
  const sIcon  = SEV_ICON[scan.severity]  ?? 'checkmark-circle';

  const handleShare = async () => {
    await Share.share({
      message: `🌾 CROOPIC Scan\nDisease: ${scan.disease_name_en}\nSeverity: ${scan.severity}\nConfidence: ${(scan.confidence * 100).toFixed(0)}%\n\n${scan.message_en}`,
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <LinearGradient colors={['#0D1117', '#162032']} style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Scan Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={{ backgroundColor: '#0D1117' }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {scan.image_url
          ? <Image source={{ uri: scan.image_url }} style={styles.leafImage} resizeMode="cover" />
          : <View style={styles.leafPlaceholder}><Ionicons name="leaf" size={64} color={COLORS.primary} /></View>
        }

        {scan.is_healthy ? (
          <LinearGradient colors={['#1a3a2a','#0f2419']} style={styles.banner}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            <Text style={[styles.bannerName, { color: COLORS.primary }]}>{isHi ? 'फसल स्वस्थ है! 🎉' : 'Crop is Healthy! 🎉'}</Text>
          </LinearGradient>
        ) : (
          <LinearGradient colors={[sColor + '22','#0D1117']} style={styles.banner}>
            <Ionicons name={sIcon as any} size={24} color={sColor} />
            <View>
              <Text style={[styles.bannerName, { color: sColor }]}>{isHi ? scan.disease_name_hi : scan.disease_name_en}</Text>
              <Text style={styles.severityLabel}>{scan.severity} Severity</Text>
            </View>
          </LinearGradient>
        )}

        <View style={styles.langRow}>
          {(['en','hi'] as const).map(l => (
            <TouchableOpacity key={l} style={[styles.langBtn, lang === l && styles.langBtnActive]} onPress={() => setLang(l)}>
              <Text style={[styles.langText, lang === l && styles.langTextActive]}>{l === 'en' ? 'English' : 'हिंदी'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isHi ? 'सारांश' : 'Summary'}</Text>
          <Text style={styles.cardText}>{isHi ? scan.message_hi : scan.message_en}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Confidence</Text>
          <Text style={{ fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.sm }}>
            {(scan.confidence * 100).toFixed(1)}% confident
          </Text>
          {scan.top_3.map(p => <ConfBar key={p.label} label={p.label.replace(/_/g,' ')} value={p.confidence} />)}
        </View>

        {!scan.is_healthy && (scan.treatment?.chemical_treatments ?? []).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💊 {isHi ? 'रासायनिक उपचार' : 'Chemical Treatments'}</Text>
            {(scan.treatment.chemical_treatments ?? []).map((t, i) => (
              <View key={i} style={styles.treatItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.treatName}>{t.name}</Text>
                  {t.brand_example && <View style={styles.brandBadge}><Text style={styles.brandText}>{t.brand_example}</Text></View>}
                </View>
                <Text style={styles.treatDetail}>Dosage: {t.dosage} · {t.frequency}</Text>
              </View>
            ))}
          </View>
        )}

        {!scan.is_healthy && (scan.treatment?.organic_treatments ?? []).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌿 {isHi ? 'जैविक उपचार' : 'Organic Treatments'}</Text>
            {(scan.treatment.organic_treatments ?? []).map((t, i) => (
              <View key={i} style={styles.treatItem}>
                <Text style={styles.treatName}>{t.name}</Text>
                <Text style={styles.treatDetail}>{t.dosage} · {t.frequency}</Text>
              </View>
            ))}
          </View>
        )}

        {!scan.is_healthy && (scan.treatment?.prevention ?? []).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🛡️ {isHi ? 'रोकथाम' : 'Prevention Tips'}</Text>
            {(scan.treatment.prevention ?? []).map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 }}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {!scan.is_healthy && scan.treatment?.urgency && (
          <View style={[styles.urgencyCard, { borderColor: sColor + '55' }]}>
            <Ionicons name="time" size={18} color={sColor} />
            <Text style={[{ fontSize: FONTS.sizes.md, fontWeight: '700' }, { color: sColor }]}>
              {isHi ? 'तात्कालिकता: ' : 'Urgency: '}{scan.treatment.urgency}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0D1117' },
  topBar:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:         { padding: 4, marginRight: SPACING.md },
  topTitle:        { flex: 1, fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  shareBtn:        { padding: 4 },
  scroll:          { paddingBottom: 48 },
  leafImage:       { width: '100%', height: 260 },
  leafPlaceholder: { width: '100%', height: 260, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  banner:          { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, margin: SPACING.lg, borderRadius: RADIUS.xl },
  bannerName:      { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  severityLabel:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  langRow:         { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  langBtn:         { flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  langBtnActive:   { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: COLORS.primary },
  langText:        { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  langTextActive:  { color: COLORS.primary },
  card:            { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardTitle:       { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  cardText:        { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },
  treatItem:       { backgroundColor: COLORS.bgCardLight, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  treatName:       { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  treatDetail:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  brandBadge:      { backgroundColor: 'rgba(46,204,113,0.1)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(46,204,113,0.25)' },
  brandText:       { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600' },
  urgencyCard:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, backgroundColor: COLORS.bgCard },
});
