import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';

function RowItem({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string;
  onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.75}>
      <View style={[styles.rowIcon, danger && { backgroundColor: 'rgba(231,76,60,0.1)', borderColor: 'rgba(231,76,60,0.2)' }]}>
        <Ionicons name={icon as any} size={18} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !danger && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <LinearGradient colors={['#0D1117', '#162032']} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.lg }]} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <LinearGradient colors={['#2ECC71','#27AE60']} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name ?? 'F').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.name ?? 'Farmer'}</Text>
          <Text style={styles.phone}>{user?.phone ? `+91 ${user.phone}` : 'CROOPIC User'}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            <Text style={styles.verifiedText}>Verified Farmer</Text>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <RowItem icon="person-outline"   label="Full Name"          value={user?.name ?? '—'} />
          <RowItem icon="call-outline"     label="Phone Number"       value={user?.phone ? `+91 ${user.phone}` : '—'} />
          <RowItem icon="location-outline" label="State"              value="Not set" />
          <RowItem icon="language-outline" label="App Language"       value="English" onPress={() => {}} />
        </View>

        {/* App section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <RowItem icon="information-circle-outline" label="App Version"  value="1.0.0" />
          <RowItem icon="shield-checkmark-outline"   label="Privacy Policy" onPress={() => {}} />
          <RowItem icon="document-text-outline"      label="Terms of Use"   onPress={() => {}} />
          <RowItem icon="help-circle-outline"        label="Help & FAQ"     onPress={() => {}} />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <RowItem icon="log-out-outline" label="Log Out" onPress={handleLogout} danger />
        </View>

        <Text style={styles.footer}>🌾 CROOPIC v1.0 · Made for Indian Farmers</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  scroll:        { padding: SPACING.lg, paddingBottom: 48 },

  avatarWrap:    { alignItems: 'center', marginBottom: SPACING.xl },
  avatar:        { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  avatarText:    { fontSize: FONTS.sizes.hero, fontWeight: '800', color: '#fff' },
  name:          { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  phone:         { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm, backgroundColor: 'rgba(46,204,113,0.1)', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(46,204,113,0.25)' },
  verifiedText:  { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },

  section:       { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.sm, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle:  { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textMuted, paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm, paddingBottom: 4, letterSpacing: 1, textTransform: 'uppercase' },

  row:           { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md },
  rowIcon:       { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: 'rgba(46,204,113,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' },
  rowLabel:      { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, fontWeight: '500' },
  rowValue:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

  footer:        { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.lg },
});
